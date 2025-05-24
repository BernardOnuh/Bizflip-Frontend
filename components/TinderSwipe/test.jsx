import { useState } from 'react';
import { useNFTMetadata } from './useNFTMetadata';
import { useReadContract } from 'wagmi';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/utils/marketplaceUtils';

export const NFTDisplay = () => {
  // State for token ID input
  const [tokenId, setTokenId] = useState('0');
  
  // Use the custom hook to fetch NFT data and image
  const { 
    nftData, 
    imageUrl, 
    isLoading, 
    error, 
    refetch 
  } = useNFTMetadata(tokenId);

  // Fetch total NFT count for navigation
  const { 
    data: totalMinted, 
    isLoading: isTotalLoading, 
    isError: isTotalError 
  } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: 'TotalNftMinted',
  });

  // Handler for fetching listing data
  const handleFetchListing = () => {
    refetch();
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (tokenId !== '' && !isNaN(parseInt(tokenId)) && parseInt(tokenId) > 0) {
      const newTokenId = (parseInt(tokenId) - 1).toString();
      setTokenId(newTokenId);
    }
  };

  const handleNext = () => {
    if (tokenId !== '' && !isNaN(parseInt(tokenId)) && totalMinted && parseInt(tokenId) < Number(totalMinted) - 1) {
      const newTokenId = (parseInt(tokenId) + 1).toString();
      setTokenId(newTokenId);
    }
  };

  // Format counts and max token ID
  const maxTokenId = totalMinted ? Number(totalMinted) - 1 : 0;
  const formattedTotal = totalMinted ? Number(totalMinted).toString() : '0';

  // Calculate if prev/next buttons should be disabled
  const isPrevDisabled = parseInt(tokenId) <= 0 || isNaN(parseInt(tokenId));
  const isNextDisabled = !totalMinted || parseInt(tokenId) >= Number(totalMinted) - 1 || isNaN(parseInt(tokenId));

  return (
    <div className="p-6 border rounded-lg shadow-md">
      {/* Total NFT Count Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Total NFTs Minted</h2>
        {isTotalLoading ? (
          <p>Loading total count...</p>
        ) : isTotalError ? (
          <p className="text-red-500">Error loading total count</p>
        ) : (
          <div>
            <p className="text-2xl font-bold">{formattedTotal}</p>
            <p className="text-xs text-gray-500">Token IDs range from 0 to {maxTokenId}</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="my-6" />

      {/* Listing Metadata Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Browse NFT Listings</h2>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-1">
              Token ID
            </label>
            <div className="flex">
              <button
                onClick={handlePrevious}
                disabled={isPrevDisabled}
                className={`px-4 py-2 rounded-l-md ${
                  isPrevDisabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                aria-label="Previous NFT"
              >
                ← Prev
              </button>
              <input
                id="tokenId"
                type="number"
                min="0"
                max={maxTokenId}
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full px-3 py-2 border-t border-b"
                placeholder="Enter token ID"
              />
              <button
                onClick={handleNext}
                disabled={isNextDisabled}
                className={`px-4 py-2 rounded-r-md ${
                  isNextDisabled 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                aria-label="Next NFT"
              >
                Next →
              </button>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFetchListing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Fetch
            </button>
          </div>
        </div>

        {/* Navigation Controls - Current position indicator */}
        {totalMinted && !isNaN(parseInt(tokenId)) && (
          <div className="mb-4 text-center text-sm text-gray-600">
            Viewing NFT {parseInt(tokenId) + 1} of {formattedTotal}
          </div>
        )}

        {/* Listing Metadata Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {isLoading ? (
            <p>Loading NFT details...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : !nftData ? (
            <p className="text-gray-500">Enter a token ID and click Fetch to view details</p>
          ) : (
            <div>
              {/* NFT Image Section */}
              <div className="mb-4">
                {isLoading ? (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                    <p>Loading image...</p>
                  </div>
                ) : error ? (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                    <p className="text-red-500">Error loading image: {error}</p>
                  </div>
                ) : imageUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={imageUrl} 
                      alt={nftData.name || 'NFT Image'} 
                      className="max-h-64 rounded-lg object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/400/320";
                        e.target.alt = "Image failed to load";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                    <p>No image available</p>
                  </div>
                )}
              </div>

              <div className="flex items-center mb-2">
              <h3 className="text-lg font-bold">{nftData.name || 'No Name'}</h3>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${nftData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {nftData.isActive ? 'Listed' : 'Not Listed'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-mono text-xs truncate">{nftData.seller}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold">{nftData.price ? (Number(nftData.price) / 1e18).toFixed(4) : '0'} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asset Type</p>
                  <p>{nftData.assetType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Symbol</p>
                  <p>{nftData.symbol || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p>{Number(nftData.age)} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p>${Number(nftData.revenue).toLocaleString()} / year</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Income</p>
                  <p>${Number(nftData.netIncome).toLocaleString()} / year</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">URL</p>
                  <p className="truncate text-xs">
                    {nftData.url?.startsWith('ipfs://') ? (
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${nftData.url.replace('ipfs://', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {nftData.url}
                      </a>
                    ) : (
                      nftData.url || 'N/A'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-sm mt-1">{nftData.description || 'No description available'}</p>
              </div>
              
              {nftData.tokenURI && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Token URI</p>
                  <p className="text-xs font-mono truncate mt-1">
                    {nftData.tokenURI?.startsWith('ipfs://') ? (
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${nftData.tokenURI.replace('ipfs://', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {nftData.tokenURI}
                      </a>
                    ) : (
                      nftData.tokenURI
                    )}
                  </p>
                </div>
              )}

              {/* Navigation buttons at the bottom */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={isPrevDisabled}
                  className={`px-4 py-2 rounded-md ${
                    isPrevDisabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  ← Previous NFT
                </button>
                <button
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`px-4 py-2 rounded-md ${
                    isNextDisabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Next NFT →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDisplay;