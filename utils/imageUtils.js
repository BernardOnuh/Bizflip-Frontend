// imageUtils.js
class ImageHandler {
    constructor(options = {}) {
      // Configurable options with sensible defaults
      this.options = {
        allowedDomains: [
          'img-cdn.magiceden.dev',
          'metadata.degods.com',
          'cdn.example.com'
        ],
        cacheSize: 100,
        retryAttempts: 3,
        timeout: 5000,
        ...options
      }
  
      // Image cache to prevent repeated loading of the same image
      this.imageCache = new Map()
    }
  
    // Validate image URL against allowed domains
    isValidImageUrl(url) {
      try {
        const parsedUrl = new URL(url)
        return this.options.allowedDomains.some(domain => 
          parsedUrl.hostname.includes(domain)
        )
      } catch {
        return false
      }
    }
  
    // Fetch image with advanced error handling and retry mechanism
    async fetchImage(url, options = {}) {
      // Check cache first
      if (this.imageCache.has(url)) {
        return this.imageCache.get(url)
      }
  
      // Validate URL
      if (!this.isValidImageUrl(url)) {
        throw new Error(`Image URL not allowed: ${url}`)
      }
  
      // Merge default and passed options
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
          ...options.headers
        },
        ...options
      }
  
      let attempts = 0
      while (attempts < this.options.retryAttempts) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), this.options.timeout)
  
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
          })
  
          clearTimeout(timeoutId)
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
  
          // Convert to blob
          const blob = await response.blob()
  
          // Create object URL
          const objectUrl = URL.createObjectURL(blob)
  
          // Cache the object URL
          if (this.imageCache.size >= this.options.cacheSize) {
            // Remove oldest cached item
            const oldestKey = this.imageCache.keys().next().value
            URL.revokeObjectURL(this.imageCache.get(oldestKey))
            this.imageCache.delete(oldestKey)
          }
          this.imageCache.set(url, objectUrl)
  
          return objectUrl
        } catch (error) {
          attempts++
          console.warn(`Image fetch attempt ${attempts} failed:`, error)
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        }
      }
  
      throw new Error(`Failed to fetch image after ${this.options.retryAttempts} attempts`)
    }
  
    // Create an image element with error handling
    createImageElement(url, altText = '') {
      return new Promise((resolve, reject) => {
        const img = new Image()
        
        img.onload = () => {
          // Optional image processing (e.g., resize, compress)
          resolve(img)
        }
  
        img.onerror = async () => {
          try {
            // Attempt to fetch and create image from object URL
            const objectUrl = await this.fetchImage(url)
            img.src = objectUrl
          } catch (error) {
            // Fallback to error handling
            reject(error)
          }
        }
  
        img.alt = altText
        img.src = url
      })
    }
  
    // Batch image loading with progress tracking
    async loadImages(imageUrls, onProgress) {
      const loadedImages = []
      const totalImages = imageUrls.length
  
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const img = await this.createImageElement(imageUrls[i])
          loadedImages.push(img)
  
          // Optional progress callback
          if (onProgress) {
            onProgress({
              loaded: loadedImages.length,
              total: totalImages,
              progress: (loadedImages.length / totalImages) * 100
            })
          }
        } catch (error) {
          console.error(`Failed to load image ${imageUrls[i]}:`, error)
          // Optionally track failed images
        }
      }
  
      return loadedImages
    }
  
    // Clean up cached object URLs
    cleanup() {
      this.imageCache.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl)
      })
      this.imageCache.clear()
    }
  }
  
  // Usage Example
  async function displayImages() {
    const imageHandler = new ImageHandler({
      allowedDomains: [
        'img-cdn.magiceden.dev', 
        'metadata.degods.com',
        'your-api-domain.com'
      ]
    })
  
    try {
      // Fetch image URLs from an API
      const apiResponse = await fetch('https://your-api.com/images')
      const imageData = await apiResponse.json()
  
      // Extract image URLs
      const imageUrls = imageData.map(item => item.imageUrl)
  
      // Load images with progress tracking
      const loadedImages = await imageHandler.loadImages(
        imageUrls, 
        (progress) => {
          console.log(`Loading progress: ${progress.progress.toFixed(2)}%`)
          // Update UI progress bar
          updateProgressBar(progress.progress)
        }
      )
  
      // Display loaded images
      const galleryElement = document.getElementById('image-gallery')
      loadedImages.forEach(img => {
        galleryElement.appendChild(img)
      })
    } catch (error) {
      console.error('Image loading failed:', error)
      // Handle error (show error message, fallback UI, etc.)
    } finally {
      // Clean up object URLs when done
      imageHandler.cleanup()
    }
  }
  
  // Optional: Progress bar update function
  function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar')
    progressBar.style.width = `${progress}%`
  }
  
  // Export for module usage
  export default ImageHandler