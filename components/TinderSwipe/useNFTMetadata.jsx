import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/utils/marketplaceUtils';

/**
 * Custom hook to get the total number of NFTs minted in the marketplace
 * @returns {Object} - Contains totalMinted, maxTokenId and loading states
 */
export const useTotalNFTsMinted = () => {
  const {
    data: totalMinted,
    isLoading,
    isError
  } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'TotalNftMinted',
  });

  // Format counts and max token ID
  const maxTokenId = totalMinted ? Number(totalMinted) - 1 : 0;
  const formattedTotal = totalMinted ? Number(totalMinted).toString() : '0';

  return {
    totalMinted: formattedTotal,
    maxTokenId,
    isLoading,
    isError
  };
};

/**
 * Custom hook to fetch NFT metadata and image
 * @param {string|number} tokenId - The token ID to fetch
 * @returns {Object} - The hook result object
 */
export const useNFTMetadata = (tokenId) => {
  // Convert tokenId to string for internal use
  const tokenIdString = tokenId?.toString() || '0';
  
  // State for formatted listing data
  const [nftData, setNftData] = useState(null);
  // State for NFT image URL
  const [imageUrl, setImageUrl] = useState(null);
  // State to track metadata loading
  const [isLoading, setIsLoading] = useState(false);
  // State to track metadata error
  const [error, setError] = useState(null);
  // State to track image error
  const [imageError, setImageError] = useState(false);

  // Fetch listing metadata for the specified token ID
  const { 
    data: listingData, 
    isLoading: isListingLoading, 
    isError: isListingError,
    refetch: refetchListing
  } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getListingWithMetadata',
    args: [parseInt(tokenIdString)],
    enabled: tokenIdString !== '' && !isNaN(parseInt(tokenIdString)),
  });

  // Function to fetch and extract image from metadata
  const fetchImageFromMetadata = async (tokenURI) => {
    if (!tokenURI) return;
    
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setImageError(false);
    
    try {
      console.log('Attempting to fetch metadata from:', tokenURI);
      
      // Handle IPFS URI - use Pinata gateway directly since it's working
      let url = tokenURI;
      
      if (tokenURI.startsWith('ipfs://')) {
        url = `https://gateway.pinata.cloud/ipfs/${tokenURI.replace('ipfs://', '')}`;
        console.log('Converted IPFS URL to Pinata gateway:', url);
      }
      
      const response = await fetch(url, { 
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
      }
      
      const metadata = await response.json();
      console.log('Metadata fetched successfully:', metadata);
      
      // Check if metadata is empty or undefined
      if (!metadata) {
        throw new Error('Empty metadata received');
      }
      
      // Extract image URL from metadata - handle different metadata formats
      let imageUri = '';
      if (metadata.image) {
        imageUri = metadata.image;
      } else if (metadata.image_url) {
        imageUri = metadata.image_url;
      } else if (metadata.animation_url) {
        imageUri = metadata.animation_url;
      } else {
        // Some metadata might store image in properties
        if (metadata.properties && metadata.properties.image) {
          imageUri = metadata.properties.image;
        }
      }
      
      // If no image found in metadata
      if (!imageUri) {
        console.warn('No image found in metadata:', metadata);
        setImageError(true);
        return;
      }
      
      // Handle IPFS image URL - also use Pinata gateway
      if (imageUri.startsWith('ipfs://')) {
        imageUri = `https://gateway.pinata.cloud/ipfs/${imageUri.replace('ipfs://', '')}`;
      }
      
      console.log('Image URL extracted:', imageUri);
      setImageUrl(imageUri);
      
      return {
        imageUrl: imageUri,
        metadata
      };
      
    } catch (error) {
      console.error('Error fetching metadata:', error);
      
      // Fallback method - try parsing metadata directly if it's embedded in the token URI
      if (tokenURI.includes('{')) {
        try {
          console.log('Attempting to parse tokenURI directly as JSON');
          // Try to extract JSON directly from the tokenURI (some contracts embed it)
          const jsonStart = tokenURI.indexOf('{');
          const jsonStr = tokenURI.substring(jsonStart);
          const parsedMetadata = JSON.parse(jsonStr);
          
          if (parsedMetadata && parsedMetadata.image) {
            let imageUri = parsedMetadata.image;
            if (imageUri.startsWith('ipfs://')) {
              imageUri = `https://gateway.pinata.cloud/ipfs/${imageUri.replace('ipfs://', '')}`;
            }
            console.log('Successfully extracted image from embedded JSON:', imageUri);
            setImageUrl(imageUri);
            return {
              imageUrl: imageUri,
              metadata: parsedMetadata
            };
          }
        } catch (jsonError) {
          console.error('Failed to parse embedded JSON:', jsonError);
          setImageError(true);
        }
      }
      
      setError(`${error.message}`);
      setImageError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process the array response from the contract into a structured object
  useEffect(() => {
    if (!isListingLoading && !isListingError && listingData) {
      console.log('Raw listing data:', listingData);
      
      let formattedData;
      // Check if listingData is an array
      if (Array.isArray(listingData)) {
        formattedData = {
          seller: listingData[0],
          price: listingData[1],
          isActive: listingData[2],
          tokenURI: listingData[3],
          name: listingData[4],
          description: listingData[5],
          age: listingData[6],
          revenue: listingData[7],
          netIncome: listingData[8],
          url: listingData[9],
          symbol: listingData[10],
          assetType: listingData[11]
        };
      } else {
        // If it's already an object, just use it as is
        formattedData = listingData;
      }
      
      setNftData(formattedData);
      
      // Fetch image from tokenURI
      if (formattedData?.tokenURI) {
        fetchImageFromMetadata(formattedData.tokenURI);
      }
    }
  }, [listingData, isListingLoading, isListingError]);

  // Manual refetch function
  const refetch = () => {
    if (tokenIdString !== '' && !isNaN(parseInt(tokenIdString))) {
      refetchListing();
    }
  };

  return {
    nftData,          // All NFT data from the contract
    imageUrl,         // Extracted image URL
    isLoading: isListingLoading || isLoading,  // Combined loading state
    error: isListingError ? 'Error fetching NFT data' : error,  // Combined error state
    imageError,       // Image specific error state
    refetch,          // Function to manually refetch the data
    setImageError     // Expose setter for image error state
  };
};

// Export only once at the end of the file
export default useNFTMetadata;