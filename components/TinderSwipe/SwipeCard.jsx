import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CommentSection from './CommentSection';
import useNFTMetadata from './useNFTMetadata';
import { useTotalNFTsMinted } from './useNFTMetadata';

const SwipeCard = ({ 
  tokenId = 0, // Provide a default tokenId of 0
  name, 
  url, 
  age, 
  description, 
  revenue, 
  netIncome, 
  price,
  symbol,
  assetType,
  tokenURI,
  onSwipeRight, 
  onSwipeLeft, 
  onSwipeUp,
  maxTokenId, // Add maxTokenId prop to limit navigation
  onTokenIdChange // Add callback for token ID changes
}) => {
  // If maxTokenId not provided, fetch it using the hook
  const { maxTokenId: fetchedMaxTokenId, isLoading: isLoadingTotal } = useTotalNFTsMinted();
  
  // Use provided maxTokenId or fetched one
  // Note: Token IDs are zero-based, so the max token ID is TotalNftMinted - 1
  const effectiveMaxTokenId = maxTokenId !== undefined ? maxTokenId : fetchedMaxTokenId;
  
  console.log("SwipeCard rendering with props:", { 
    tokenId, 
    name, 
    url, 
    tokenURI,
    hasTokenId: tokenId !== undefined,
    hasURL: url !== undefined,
    hasTokenURI: tokenURI !== undefined,
    providedMaxTokenId: maxTokenId,
    fetchedMaxTokenId,
    effectiveMaxTokenId
  });
  
  // Use the custom hook to fetch metadata and image
  const { 
    nftData, 
    imageUrl, 
    isLoading, 
    error,
    imageError,
    refetch,
    setImageError: hookSetImageError
  } = useNFTMetadata(tokenId);
  
  // Create local image error state since hook might not provide setter
  const [localImageError, setLocalImageError] = useState(false);
  
  // State
  const [isFlipped, setIsFlipped] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [dragStartInfo, setDragStartInfo] = useState({ x: 0, y: 0 });
  const [dragInfo, setDragInfo] = useState({ x: 0, y: 0, rotation: 0 });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [exitAnimation, setExitAnimation] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Constants
  const SWIPE_THRESHOLD = 100;
  
  // Set isMounted on component load
  useEffect(() => {
    console.log("Component mount effect triggered");
    setIsMounted(true);
    
    return () => {
      console.log("Component unmounting");
      setIsMounted(false);
    };
  }, []);
  
  // Log hook results for debugging
  useEffect(() => {
    console.log("NFT metadata hook results:", {
      hasNFTData: !!nftData,
      hasImageUrl: !!imageUrl,
      isLoading,
      error,
      imageError
    });
  }, [nftData, imageUrl, isLoading, error, imageError]);
  
  // Reset image error when new image URL is available
  useEffect(() => {
    if (imageUrl) {
      console.log("New image URL available, resetting error state:", imageUrl);
      setLocalImageError(false);
      if (typeof hookSetImageError === 'function') {
        hookSetImageError(false);
      }
    }
  }, [imageUrl, hookSetImageError]);
  
  // Log handler availability
  useEffect(() => {
    console.log("Swipe handlers available:", {
      right: typeof onSwipeRight === 'function',
      left: typeof onSwipeLeft === 'function',
      up: typeof onSwipeUp === 'function'
    });
  }, [onSwipeRight, onSwipeLeft, onSwipeUp]);
  
  // Token navigation handler
  const handleNavigateToken = (direction) => {
    if (direction === 'next' && tokenId < effectiveMaxTokenId) {
      const nextTokenId = tokenId + 1;
      console.log(`Navigating to next token ID: ${nextTokenId}`);
      if (typeof onTokenIdChange === 'function') {
        onTokenIdChange(nextTokenId);
      }
    } else if (direction === 'prev' && tokenId > 0) {
      const prevTokenId = tokenId - 1;
      console.log(`Navigating to previous token ID: ${prevTokenId}`);
      if (typeof onTokenIdChange === 'function') {
        onTokenIdChange(prevTokenId);
      }
    } else {
      console.log(`Cannot navigate ${direction}, current: ${tokenId}, max: ${effectiveMaxTokenId}`);
    }
  };
  
  // Image error handler
  const handleImageError = () => {
    console.error("Error loading image:", imageUrl);
    setLocalImageError(true);
    if (typeof hookSetImageError === 'function') {
      hookSetImageError(true);
    }
  };
  
  // Retry handler
  const handleRetry = (e) => {
    if (e) e.stopPropagation(); // Prevent card flip if called from click event
    console.log("Retry button clicked");
    setRetryCount(prev => prev + 1);
    
    // Reset states
    setLocalImageError(false);
    if (typeof hookSetImageError === 'function') {
      hookSetImageError(false);
    }
    
    // Refetch the data
    console.log("Attempting to refetch NFT data");
    refetch();
  };
  
  // Card flip handler
  const handleCardClick = (e) => {
    console.log("Card clicked, event target:", e.target.tagName);
    
    // Don't flip if clicking on controls or during drag
    if (
      isDragging || 
      e.target.closest('.info-icon') || 
      e.target.closest('.direction-controls') ||
      e.target.closest('.retry-button') ||
      e.target.tagName === 'BUTTON' ||
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA'
    ) {
      console.log("Ignoring card click due to control element or drag state");
      return;
    }
    
    console.log("Flipping card:", !isFlipped);
    setIsFlipped(!isFlipped);
  };
  
  // Swipe animation complete handler
  const handleAnimationComplete = () => {
    console.log("Animation complete, exit animation:", exitAnimation);
    
    if (exitAnimation) {
      console.log(`Executing ${exitAnimation.direction} swipe handler`);
      
      // Call the appropriate handler based on exit direction
      if (exitAnimation.direction === 'right' && typeof onSwipeRight === 'function') {
        console.log("Calling onSwipeRight handler");
        onSwipeRight();
      } else if (exitAnimation.direction === 'left') {
        console.log("Swipe left detected, advancing to next token");
        handleNavigateToken('next');
        
        // Still call the original handler if provided
        if (typeof onSwipeLeft === 'function') {
          console.log("Also calling onSwipeLeft handler");
          onSwipeLeft();
        }
      } else if (exitAnimation.direction === 'up' && typeof onSwipeUp === 'function') {
        console.log("Calling onSwipeUp handler");
        onSwipeUp();
      } else {
        console.log("No handler found for direction:", exitAnimation.direction);
      }
      
      // Reset state
      console.log("Resetting animation state");
      setExitAnimation(null);
      setDragInfo({ x: 0, y: 0, rotation: 0 });
      setSwipeDirection(null);
    }
  };
  
  // DRAG HANDLERS
  
  const handleDragStart = (event, info) => {
    console.log("Drag start:", info.point);
    
    if (isFlipped || showControls) {
      console.log("Ignoring drag start due to flipped or control state");
      return;
    }
    
    setDragStartInfo({ x: info.point.x, y: info.point.y });
    setIsDragging(true);
    setSwipeDirection(null);
  };
  
  const handleDrag = (event, info) => {
    if (!isDragging) {
      console.log("Ignoring drag because isDragging is false");
      return;
    }
    
    const offsetX = info.point.x - dragStartInfo.x;
    const offsetY = info.point.y - dragStartInfo.y;
    const rotation = offsetX * 0.05; // Adjust rotation intensity
    
    // Only log occasionally to avoid console spam
    if (Math.abs(offsetX) % 20 === 0 || Math.abs(offsetY) % 20 === 0) {
      console.log(`Dragging: x=${offsetX}, y=${offsetY}, rotation=${rotation}`);
    }
    
    setDragInfo({ x: offsetX, y: offsetY, rotation });
    
    // Determine visual swipe direction indicators
    let newDirection = null;
    if (Math.abs(offsetY) > Math.abs(offsetX) && offsetY < -50) {
      newDirection = 'up';
    } else if (offsetX > 50) {
      newDirection = 'right';
    } else if (offsetX < -50) {
      newDirection = 'left';
    }
    
    if (newDirection !== swipeDirection) {
      console.log("Swipe direction changed:", newDirection);
      setSwipeDirection(newDirection);
    }
  };
  
  const handleDragEnd = (event, info) => {
    console.log("Drag end:", info.point);
    
    if (!isDragging) {
      console.log("Ignoring drag end because isDragging is false");
      return;
    }
    
    const offsetX = info.point.x - dragStartInfo.x;
    const offsetY = info.point.y - dragStartInfo.y;
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);
    
    console.log(`Drag ended with offsets: x=${offsetX}, y=${offsetY}`);
    
    // Decide swipe action based on movement direction and threshold
    if (absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD) {
      if (absY > absX && offsetY < -SWIPE_THRESHOLD) {
        // SWIPE UP
        console.log("Swipe UP detected, triggering exit animation");
        setExitAnimation({
          direction: 'up',
          x: 0,
          y: -1000,
          rotation: 0
        });
      } else if (offsetX > SWIPE_THRESHOLD) {
        // SWIPE RIGHT
        console.log("Swipe RIGHT detected, triggering exit animation");
        setExitAnimation({
          direction: 'right',
          x: 1000,
          y: 0,
          rotation: 20
        });
      } else if (offsetX < -SWIPE_THRESHOLD) {
        // SWIPE LEFT
        console.log("Swipe LEFT detected, triggering exit animation");
        
        // Check if we can navigate to next token
        const canNavigate = tokenId < effectiveMaxTokenId;
        
        setExitAnimation({
          direction: 'left',
          x: -1000,
          y: 0,
          rotation: -20,
          disabled: !canNavigate
        });
        
        if (!canNavigate) {
          console.log("Cannot navigate beyond max token ID", effectiveMaxTokenId);
        }
      }
    } else {
      // Not enough movement, reset position
      console.log("Drag distance below threshold, resetting position");
      setDragInfo({ x: 0, y: 0, rotation: 0 });
      setSwipeDirection(null);
    }
    
    setIsDragging(false);
  };
  
  // BUTTON HANDLERS
  
  const handleDirectButtonSwipe = (direction) => {
    console.log(`Direct button swipe: ${direction}`);
    
    switch (direction) {
      case 'left':
        // Only allow left swipe if we're not at max token ID
        if (tokenId < effectiveMaxTokenId) {
          setExitAnimation({
            direction: 'left',
            x: -1000,
            y: 0,
            rotation: -20
          });
        } else {
          console.log("Cannot navigate beyond max token ID:", effectiveMaxTokenId);
        }
        break;
      case 'right':
        setExitAnimation({
          direction: 'right',
          x: 1000,
          y: 0,
          rotation: 20
        });
        break;
      case 'up':
        setExitAnimation({
          direction: 'up',
          x: 0,
          y: -1000,
          rotation: 0
        });
        break;
      default:
        console.warn(`Unknown swipe direction: ${direction}`);
        break;
    }
    
    setShowControls(false);
  };
  
  // Get display values, preferring nftData from the hook but falling back to props
  const displayData = nftData || {};
  
  const displayName = displayData.name || name || "NFT Swipe";
  const displaySymbol = displayData.symbol || symbol;
  const displayDescription = displayData.description || description;
  const displayAge = displayData.age || age;
  const displayAssetType = displayData.assetType || assetType;
  const displayRevenue = displayData.revenue !== undefined ? Number(displayData.revenue) : revenue;
  const displayNetIncome = displayData.netIncome !== undefined ? Number(displayData.netIncome) : netIncome;
  
  // Format price if it exists
  const displayPrice = displayData.price ? 
    (Number(displayData.price) / 1e18).toFixed(4) : price;
  const formattedPrice = displayPrice ? `${displayPrice} ETH` : null;
  
  // Log final display values for debugging
  useEffect(() => {
    console.log("Final display values:", {
      name: displayName,
      symbol: displaySymbol,
      age: displayAge,
      assetType: displayAssetType,
      revenue: displayRevenue,
      netIncome: displayNetIncome,
      price: formattedPrice,
      imageUrl,
      hasError: !!error || localImageError || imageError
    });
  }, [displayName, displaySymbol, displayAge, displayAssetType, displayRevenue, 
      displayNetIncome, formattedPrice, imageUrl, error, localImageError, imageError]);
  
  // RENDER COMPONENT
  
  // Combine local and hook image errors
  const hasError = !!error || localImageError || imageError;
  
  // Determine if navigation buttons should be disabled
  const isAtMaxToken = tokenId >= effectiveMaxTokenId;
  const isAtMinToken = tokenId <= 0;

  // Calculate total NFTs (for display purposes)
  const totalNFTs = effectiveMaxTokenId + 1; // +1 because token IDs are zero-based
  
  return (
    <div className="w-full max-w-sm mx-auto relative">
      {(isLoading || isLoadingTotal) && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-white bg-opacity-80 rounded-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
    
      {/* Main Card */}
      <motion.div 
        className="relative w-full h-96 md:h-112 shadow-xl rounded-2xl overflow-hidden card-container"
        drag={!isFlipped && !showControls && !isLoading && !hasError}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={exitAnimation ? {
          x: exitAnimation.x,
          y: exitAnimation.y,
          rotate: exitAnimation.rotation,
          opacity: 0,
          transition: { duration: 0.5, ease: "easeOut" }
        } : {
          x: dragInfo.x,
          y: dragInfo.y,
          rotate: dragInfo.rotation,
          opacity: 1,
          transition: isDragging ? { duration: 0 } : { 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.3
          }
        }}
        onAnimationComplete={handleAnimationComplete}
        whileTap={!isFlipped && !showControls ? { scale: 0.98 } : {}}
        onClick={handleCardClick}
      >
        {/* Swipe Direction Indicators */}
        <div className={`absolute top-1/3 left-6 transform -translate-y-1/2 z-20 bg-red-500 text-white text-2xl font-bold w-16 h-16 flex items-center justify-center rounded-full transition-opacity duration-200 ${swipeDirection === 'left' ? 'opacity-90' : 'opacity-0'}`}>
          {isAtMaxToken ? 'MAX' : 'NEXT'}
        </div>
        
        <div className={`absolute top-1/3 right-6 transform -translate-y-1/2 z-20 bg-green-500 text-white text-2xl font-bold w-16 h-16 flex items-center justify-center rounded-full transition-opacity duration-200 ${swipeDirection === 'right' ? 'opacity-90' : 'opacity-0'}`}>
          LIKE
        </div>
        
        <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 z-20 bg-blue-500 text-white text-2xl font-bold w-16 h-16 flex items-center justify-center rounded-full transition-opacity duration-200 ${swipeDirection === 'up' ? 'opacity-90' : 'opacity-0'}`}>
          SAVE
        </div>
      
        {/* Card Front */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-2xl transition-all duration-500 ease-in-out ${isFlipped ? 'rotate-y-180 opacity-0' : 'rotate-y-0 opacity-100'}`}
        >
          {/* Error State */}
          {hasError ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
              <div className="text-center p-4">
                <svg className="mx-auto h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="mt-2 text-white font-medium text-xl">Error loading NFT</p>
                
                <button 
                  onClick={handleRetry}
                  className="retry-button mt-4 px-6 py-2 bg-white text-purple-600 rounded-full hover:bg-gray-100 transition font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : imageUrl ? (
            // Image loaded successfully
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            >
              <img 
                src={imageUrl} 
                alt={displayName || "NFT"}
                className="hidden"
                onError={handleImageError}
              />
            </div>
          ) : (
            // Loading placeholder
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-24 bg-gray-300 rounded mt-3"></div>
              </div>
            </div>
          )}
          
          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white text-xl font-bold">{displayName}</h3>
            
            <div className="flex justify-between items-center">
              {formattedPrice && (
                <div className="mt-1 bg-black bg-opacity-50 inline-block px-3 py-1 rounded-full text-white text-sm">
                  {formattedPrice}
                </div>
              )}
              
              <div className="mt-1 bg-black bg-opacity-50 inline-block px-3 py-1 rounded-full text-white text-sm">
                ID: {tokenId} / {totalNFTs - 1}
              </div>
            </div>
          </div>
          
          {/* Asset labels */}
          {(displaySymbol || displayAssetType) && !hasError && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {displaySymbol && (
                <span className="bg-purple-500 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {displaySymbol}
                </span>
              )}
              {displayAssetType && (
                <span className="bg-blue-500 bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {displayAssetType}
                </span>
              )}
            </div>
          )}
          
          {/* Info icon */}
          {!hasError && (
            <div 
              className="info-icon absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer hover:bg-opacity-70 transition"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Info icon clicked, toggling controls");
                setShowControls(!showControls);
              }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Card Back */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-2xl bg-white transition-all duration-500 ease-in-out backface-hidden ${isFlipped ? 'rotate-y-0 opacity-100' : 'rotate-y-180 opacity-0'}`}
        >
          <div className="p-5 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-purple-800 mb-2">{displayName}</h2>
            <div className="flex gap-2 mb-3 flex-wrap">
              {displayAge && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {displayAge} yr{displayAge !== 1 ? 's' : ''}
                </span>
              )}
              {displaySymbol && (
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {displaySymbol}
                </span>
              )}
              {displayAssetType && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {displayAssetType}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 mb-4 flex-grow overflow-y-auto">
              {displayDescription || "No description available."}
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Annual Revenue</p>
                <p className="font-bold">${displayRevenue?.toLocaleString() || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs text-gray-500">Net Income</p>
                <p className="font-bold">${displayNetIncome?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
            
            {formattedPrice && (
              <div className="bg-purple-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-purple-800">Listed Price</p>
                <p className="font-bold text-purple-800">{formattedPrice}</p>
              </div>
            )}
            
            {/* Token ID Display */}
            <div className="bg-gray-50 p-2 rounded-lg mb-4">
              <p className="text-xs text-gray-500">Token ID</p>
              <p className="font-mono text-sm">{tokenId} of {totalNFTs - 1} (Total NFTs: {totalNFTs})</p>
            </div>  
          </div>
        </div>
        
        {/* Direction controls overlay */}
        {showControls && !isFlipped && (
          <div className="direction-controls absolute inset-0 bg-black bg-opacity-60 z-10 flex items-center justify-center transition-opacity duration-300 ease-in-out">
            <div className="grid grid-cols-3 gap-4 p-4">
              {/* Left button (Next) */}
              <div className="col-start-1 col-end-2 row-start-2 row-end-3 text-center">
                <button 
                  className={`w-16 h-16 ${isAtMaxToken ? 'bg-gray-400 cursor-not-allowed' : 'bg-white bg-opacity-90 hover:bg-red-100'} rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-lg`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Control panel: left button clicked");
                    if (!isAtMaxToken) {
                      handleDirectButtonSwipe('left');
                    }
                  }}
                  disabled={isAtMaxToken}
                >
                  <svg className={`h-10 w-10 ${isAtMaxToken ? 'text-gray-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <p className="text-white text-center mt-2 text-sm">{isAtMaxToken ? 'End' : 'Next'}</p>
              </div>
              
              {/* Up button (Bookmark) */}
              <div className="col-start-2 col-end-3 row-start-1 row-end-2 text-center">
                <button 
                  className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-blue-100 transition transform hover:scale-110 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Control panel: up button clicked");
                    handleDirectButtonSwipe('up');
                  }}
                >
                  <svg className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  </button>
                <p className="text-white text-center mt-2 text-sm">Bookmark</p>
              </div>
              
              {/* Right button (Like) */}
              <div className="col-start-3 col-end-4 row-start-2 row-end-3 text-center">
                <button 
                  className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-green-100 transition transform hover:scale-110 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Control panel: right button clicked");
                    handleDirectButtonSwipe('right');
                  }}
                >
                  <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <p className="text-white text-center mt-2 text-sm">Like</p>
              </div>
            </div>
            
            {/* Close button */}
            <button 
              className="absolute top-2 left-2 text-white hover:text-gray-300 transition"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Control panel: close button clicked");
                setShowControls(false);
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </motion.div>
      
      {/* Action Buttons */}
      <div className="mt-6 flex justify-center space-x-6">
        <button
          onClick={() => {
            console.log("Bottom action button: next token clicked");
            if (!isAtMaxToken) {
              handleDirectButtonSwipe('left');
            }
          }}
          className={`w-14 h-14 flex items-center justify-center rounded-full ${isAtMaxToken ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-500'} transition shadow-md`}
          aria-label="Next"
          disabled={isAtMaxToken || hasError}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            console.log("Bottom action button: save clicked");
            handleDirectButtonSwipe('up');
          }}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-500 transition shadow-md"
          aria-label="Save"
          disabled={hasError}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        
        <button
          onClick={() => {
            console.log("Bottom action button: like clicked");
            handleDirectButtonSwipe('right');
          }}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-green-100 hover:text-green-500 transition shadow-md"
          aria-label="Like"
          disabled={hasError}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      {/* Swipe instructions */}
      <div className="text-center mt-2 text-sm bg-black bg-opacity-20 rounded-full py-2 px-4 mx-auto inline-block">
        <p className="md:hidden text-white">Tap to flip • Swipe left for next • Swipe right to like</p>
        <p className="hidden md:block text-white">Tap to flip • Swipe left for next • Swipe right to like • Click (i) for more options</p>
      </div>
      
      {/* Comment section */}
      <div className="mt-8 comment-section">
        <CommentSection nftId={tokenId || displayName} />
      </div>
    </div>
  );
};

export default SwipeCard;