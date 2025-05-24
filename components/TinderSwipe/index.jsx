import React, { useState, useEffect, useCallback } from 'react';
import SwipeCard from './SwipeCard';
import ActionModal from './ActionModal';
import { useReadContract, useReadContracts } from 'wagmi';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/utils/marketplaceUtils';
import { useTotalNFTsMinted } from './useNFTMetadata';

// Helper function to convert IPFS URLs to HTTP gateway URLs
const convertIpfsUrl = (url) => {
  if (!url) return null;
  
  // List of reliable IPFS gateways - use multiple for better reliability
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];
  
  // Choose a gateway
  const gateway = gateways[0];
  
  // Handle ipfs:// protocol links
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', gateway);
  }
  
  // Handle direct IPFS hashes
  if (url.startsWith('Qm') && url.length >= 46) {
    return `${gateway}${url}`;
  }
  
  return url;
};

// Function to create a simple metadata object from listing data
const createMetadataFromListing = (listing, tokenId) => {
  if (!listing) return null;
  
  return {
    name: listing.name || `NFT #${tokenId}`,
    description: listing.description || "No description available",
    image: listing.url || ""
  };
};

const NFTSwipe = () => {
  // Use the custom hook to get total NFTs minted
  const { maxTokenId, totalMinted, isLoading: isTotalLoading } = useTotalNFTsMinted();
  
  // State for managing the current token ID and preloaded data
  const [currentTokenId, setCurrentTokenId] = useState(0);
  const [preloadedData, setPreloadedData] = useState({});
  const [preloadBuffer, setPreloadBuffer] = useState(3); // Preload +/- 3 tokens
  
  // UI state
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // Determine which token IDs to preload
  const getTokensToPreload = useCallback(() => {
    if (maxTokenId === undefined || maxTokenId === null) return [];
    
    const tokensToPreload = [];
    
    // Add the current token ID
    tokensToPreload.push(currentTokenId);
    
    // Add next tokens within buffer
    for (let i = 1; i <= preloadBuffer; i++) {
      const nextId = currentTokenId + i;
      if (nextId <= maxTokenId) {
        tokensToPreload.push(nextId);
      }
    }
    
    // Add previous tokens within buffer
    for (let i = 1; i <= preloadBuffer; i++) {
      const prevId = currentTokenId - i;
      if (prevId >= 0) {
        tokensToPreload.push(prevId);
      }
    }
    
    // Filter out tokens that are already loaded
    return tokensToPreload.filter(id => !preloadedData[id]);
  }, [currentTokenId, maxTokenId, preloadBuffer, preloadedData]);
  
  // Fetch the current NFT listing metadata
  const { 
    data: currentListing, 
    isLoading: isCurrentLoading,
    isError: isCurrentError,
    refetch: refetchCurrent
  } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'getListingWithMetadata',
    args: [currentTokenId],
    enabled: !isNaN(currentTokenId),
  });
  
  // Fetch metadata for tokens to preload
  const tokensToPreload = getTokensToPreload();
  
  const { 
    data: batchListingData,
    isLoading: isBatchLoading,
    isError: isBatchError
  } = useReadContracts({
    contracts: tokensToPreload.map(tokenId => ({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'getListingWithMetadata',
      args: [tokenId],
    })),
    enabled: tokensToPreload.length > 0,
  });
  
  // Process the current NFT data
  useEffect(() => {
    if (isCurrentLoading || isCurrentError || !currentListing) return;
    
    // Process the current listing
    console.log('Processing current listing data for token:', currentTokenId);
    
    let formatted;
    if (Array.isArray(currentListing)) {
      formatted = {
        seller: currentListing[0],
        price: currentListing[1],
        isActive: currentListing[2],
        tokenURI: currentListing[3],
        name: currentListing[4],
        description: currentListing[5],
        age: currentListing[6],
        revenue: currentListing[7],
        netIncome: currentListing[8],
        url: currentListing[9],
        symbol: currentListing[10],
        assetType: currentListing[11]
      };
    } else {
      formatted = currentListing;
    }
    
    // Create metadata from listing
    const metadata = createMetadataFromListing(formatted, currentTokenId);
    
    // Convert image URL if needed
    const processedImageUrl = formatted.url ? convertIpfsUrl(formatted.url) : null;
    
    // Update preloaded data
    setPreloadedData(prev => ({
      ...prev,
      [currentTokenId]: {
        nftData: formatted,
        metadata,
        imageUrl: processedImageUrl
      }
    }));
    
    // Set the selected NFT
    setSelectedNft(formatted);
    
  }, [currentListing, isCurrentLoading, isCurrentError, currentTokenId]);
  
  // Process batch preloaded data
  useEffect(() => {
    if (isBatchLoading || isBatchError || !batchListingData || tokensToPreload.length === 0) return;
    
    console.log('Processing batch data for tokens:', tokensToPreload);
    
    const newPreloadedData = { ...preloadedData };
    
    batchListingData.forEach((result, index) => {
      if (!result || !result.result) return;
      
      const tokenId = tokensToPreload[index];
      const data = result.result;
      
      let formatted;
      if (Array.isArray(data)) {
        formatted = {
          seller: data[0],
          price: data[1],
          isActive: data[2],
          tokenURI: data[3],
          name: data[4],
          description: data[5],
          age: data[6],
          revenue: data[7],
          netIncome: data[8],
          url: data[9],
          symbol: data[10],
          assetType: data[11]
        };
      } else {
        formatted = data;
      }
      
      // Create metadata from listing
      const metadata = createMetadataFromListing(formatted, tokenId);
      
      // Convert image URL if needed
      const processedImageUrl = formatted.url ? convertIpfsUrl(formatted.url) : null;
      
      newPreloadedData[tokenId] = {
        nftData: formatted,
        metadata,
        imageUrl: processedImageUrl
      };
    });
    
    setPreloadedData(newPreloadedData);
    
  }, [batchListingData, isBatchLoading, isBatchError, tokensToPreload, preloadedData]);
  
  // Log preloaded data stats
  useEffect(() => {
    console.log(`Preloaded data: ${Object.keys(preloadedData).length} tokens`);
  }, [preloadedData]);
  
  // Handle token ID change
  const handleTokenIdChange = (newTokenId) => {
    console.log(`Changing token ID from ${currentTokenId} to ${newTokenId}`);
    
    // Don't do anything if it's the same token ID
    if (newTokenId === currentTokenId) return;
    
    // Update the token ID
    setCurrentTokenId(newTokenId);
  };
  
  // Navigate to the next token ID
  const handleNext = () => {
    if (maxTokenId !== undefined && currentTokenId < maxTokenId) {
      handleTokenIdChange(currentTokenId + 1);
    } else {
      // Loop back to the beginning
      handleTokenIdChange(0);
    }
  };
  
  // Navigate to the previous token ID
  const handlePrevious = () => {
    if (currentTokenId > 0) {
      handleTokenIdChange(currentTokenId - 1);
    } else if (maxTokenId !== undefined) {
      // Loop to the end
      handleTokenIdChange(maxTokenId);
    }
  };
  
  // Handle swipe right (like/invest)
  const handleSwipeRight = () => {
    console.log("Right swipe handler triggered");
    // Set the current NFT as selected for the action modal
    if (preloadedData[currentTokenId]) {
      setSelectedNft(preloadedData[currentTokenId].nftData);
      
      // Show action modal after a slight delay
      setTimeout(() => {
        setActionModalVisible(true);
      }, 100);
    }
  };
  
  // Handle swipe left (next)
  const handleSwipeLeft = () => {
    console.log("Left swipe handler triggered");
    // The token ID change will be handled by the SwipeCard's onTokenIdChange callback
  };
  
  // Handle swipe up (bookmark)
  const handleSwipeUp = () => {
    console.log("Up swipe handler triggered");
    // Add current NFT to favorites
    if (preloadedData[currentTokenId]) {
      const nft = preloadedData[currentTokenId].nftData;
      setFavorites([...favorites, nft]);
      setNotificationMessage(`${nft.name} bookmarked!`);
      setShowNotification(true);
      
      // Auto hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };
  
  const handleMakeOffer = () => {
    setActionType('offer');
    setActionModalVisible(false);
    setOfferModalVisible(true);
  };
  
  const handleInvest = () => {
    setActionType('invest');
    setActionModalVisible(false);
    setOfferModalVisible(true);
  };
  
  const handleLater = () => {
    if (selectedNft) {
      setFavorites([...favorites, selectedNft]);
      setNotificationMessage(`${selectedNft.name} added to favorites!`);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
    setActionModalVisible(false);
  };
  
  const handleOfferSubmit = () => {
    setOfferModalVisible(false);
    setNotificationMessage(
      actionType === 'offer' 
        ? 'Your offer has been submitted!' 
        : 'Your investment has been processed!'
    );
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };
  
  // Determine if the component is in a loading state
  const isLoading = 
    (isCurrentLoading && !preloadedData[currentTokenId]) || 
    isTotalLoading;
  
  const currentNftData = preloadedData[currentTokenId];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-indigo-600 px-4 py-8 flex flex-col items-center justify-center">
      {/* Header */}
      <header className="w-full max-w-md mb-8 flex justify-between items-center">
        <div className="text-white">
          <h1 className="text-3xl font-bold">NFT Swipe</h1>
          <p className="text-white text-opacity-80">Discover amazing NFTs</p>
        </div>
        
        <div className="flex space-x-2">
          {/* Stats/info could go here */}
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <p className="text-white text-sm">{Object.keys(preloadedData).length} loaded</p>
          </div>
        </div>
      </header>
      
      {/* Debug info */}
      <div className="text-white text-sm opacity-70 absolute top-2 right-2">
        Token ID: {currentTokenId} of {maxTokenId}
      </div>
      
      {/* Main content */}
      <div className="w-full max-w-md">
        {isLoading && !currentNftData ? (
          <div className="bg-gradient-to-br from-indigo-500/30 to-purple-600/30 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-white/80 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-white/90 font-medium">Loading NFT data...</p>
            </div>
          </div>
        ) : isCurrentError ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden h-96 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-red-500 mb-2">Error loading NFT</p>
              <button 
                onClick={refetchCurrent}
                className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : currentNftData ? (
          <SwipeCard
            tokenId={currentTokenId}
            maxTokenId={maxTokenId}
            onTokenIdChange={handleTokenIdChange}
            name={currentNftData.nftData.name || `NFT #${currentTokenId}`}
            url={currentNftData.imageUrl}
            age={Number(currentNftData.nftData.age) || 0}
            description={currentNftData.nftData.description || "No description available"}
            revenue={Number(currentNftData.nftData.revenue) || 0}
            netIncome={Number(currentNftData.nftData.netIncome) || 0}
            price={currentNftData.nftData.price ? (Number(currentNftData.nftData.price) / 1e18).toFixed(4) : '0'}
            symbol={currentNftData.nftData.symbol || ""}
            assetType={currentNftData.nftData.assetType || ""}
            tokenURI={currentNftData.nftData.tokenURI || ""}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipeUp={handleSwipeUp}
            preloadedData={preloadedData}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden h-96 flex items-center justify-center">
            <p className="text-gray-600">No NFT data available</p>
          </div>
        )}
      </div>
      
      {/* Optional quick navigation buttons */}
      <div className="mt-4 flex space-x-4">
        <button 
          onClick={handlePrevious}
          className="bg-white bg-opacity-20 text-white py-2 px-6 rounded-full hover:bg-opacity-30 transition"
          disabled={isLoading || currentTokenId === 0}
        >
          ← Prev
        </button>
        <button 
          onClick={handleNext}
          className="bg-white bg-opacity-20 text-white py-2 px-6 rounded-full hover:bg-opacity-30 transition"
          disabled={isLoading || (maxTokenId !== undefined && currentTokenId >= maxTokenId)}
        >
          Next →
        </button>
      </div>
      
      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-purple-900 px-6 py-3 rounded-full shadow-lg animate-bounce">
          {notificationMessage}
        </div>
      )}
      
      {/* Action Modal */}
      {actionModalVisible && selectedNft && (
        <ActionModal
          isOpen={actionModalVisible}
          onClose={() => setActionModalVisible(false)}
          onMakeOffer={handleMakeOffer}
          onInvest={handleInvest}
          onSaveForLater={handleLater}
          nft={selectedNft}
        />
      )}
      
      {/* Offer/Invest Modal */}
      {offerModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {actionType === 'offer' ? 'Make an Offer' : 'Invest'}
              </h3>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {actionType === 'offer' ? 'Offer Amount (ETH)' : 'Investment Amount (USD)'}
                </label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={actionType === 'offer' ? "0.00 ETH" : "$0.00"}
                />
              </div>
              
              {actionType === 'offer' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>1 day</option>
                    <option>3 days</option>
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>30 days</option>
                  </select>
                </div>
              )}
              
              {actionType === 'invest' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Period
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>1 year</option>
                    <option>2 years</option>
                  </select>
                </div>
              )}
              
    
            </div>
            
            <div className="p-4 border-t border-gray-200 flex space-x-2">
              <button
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setOfferModalVisible(false)}
              >
                Cancel
              </button>
              
              <button
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
                onClick={handleOfferSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTSwipe;