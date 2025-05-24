// marketplaceUtils.js - Utility functions for interacting with NFT and marketplace contracts

import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from './marketplace-abi';
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from './nft-abi';

// Format amounts from wei to ETH
export const formatEth = (amount) => {
  if (!amount) return '0';
  return (parseInt(amount) / 1e18).toFixed(4);
};

// Convert token URI to image URL
export const getImageUrlFromTokenURI = async (tokenURI) => {
  if (!tokenURI) return '';
  
  try {
    // If it's an IPFS URI, convert it to gateway URL
    if (tokenURI.startsWith('ipfs://')) {
      const ipfsGatewayUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      
      // Try to fetch metadata JSON
      const response = await fetch(ipfsGatewayUrl);
      if (response.ok) {
        const metadata = await response.json();
        // Check if metadata has image URL
        if (metadata.image) {
          // Convert IPFS image URL if needed
          if (metadata.image.startsWith('ipfs://')) {
            return metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
          }
          return metadata.image;
        }
      }
      return ipfsGatewayUrl;
    }
    
    // For HTTP URLs, return as is
    if (tokenURI.startsWith('http')) {
      return tokenURI;
    }
    
    // For base64 encoded data URLs
    if (tokenURI.startsWith('data:')) {
      return tokenURI;
    }
  } catch (error) {
    console.error('Error processing token URI:', error);
  }
  
  // Return default image if no valid URL found
  return 'https://via.placeholder.com/400x400?text=NFT+Image';
};

// Format NFT data from contract response
export const formatNFTData = (tokenId, details, tokenURI) => {
  const [name, symbol, age, assetType, minter, royaltyFee, revenue, netProfit, hasUnlockable] = details;
  
  return {
    tokenId,
    name: `${name || "NFT"} #${tokenId}`,
    symbol,
    age: parseInt(age),
    assetType,
    revenue: parseInt(revenue),
    netIncome: parseInt(netProfit),
    royaltyFee: parseInt(royaltyFee) / 100, // Convert basis points to percentage
    minter,
    hasUnlockable,
    url: getImageUrlFromTokenURI(tokenURI),
    description: `A ${assetType} NFT with ${formatEth(revenue)} ETH in revenue and ${formatEth(netProfit)} ETH in net profit.`
  };
};

// Function to check if an NFT is listed on the marketplace
export const isNFTListed = async (readContract, tokenId) => {
  try {
    const listing = await readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'listings',
      args: [NFT_CONTRACT_ADDRESS, tokenId],
    });
    
    return listing && listing.isActive;
  } catch (error) {
    console.error('Error checking if NFT is listed:', error);
    return false;
  }
};

// Function to get NFT listing price
export const getNFTListingPrice = async (readContract, tokenId) => {
  try {
    const listing = await readContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: 'listings',
      args: [NFT_CONTRACT_ADDRESS, tokenId],
    });
    
    return listing && listing.isActive ? listing.price : null;
  } catch (error) {
    console.error('Error getting NFT listing price:', error);
    return null;
  }
};

// Function to get all NFTs owned by an address
export const getNFTsByOwner = async (readContract, ownerAddress) => {
  try {
    // First get the balance (number of NFTs owned)
    const balance = await readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [ownerAddress],
    });
    
    // No NFTs owned
    if (!balance || parseInt(balance) === 0) {
      return [];
    }
    
    // This is a simplified approach - actual implementation would depend on contract events/indexing
    // For a real implementation, you might need to query events or use an indexer service
    
    // Get total NFTs minted (we'll iterate from 1 to totalMinted to find owned NFTs)
    const totalMinted = await readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_CONTRACT_ABI,
      functionName: 'TotalNftMinted',
    });
    
    const ownedNFTs = [];
    let found = 0;
    
    // Loop through all token IDs to find ones owned by the address
    // Note: This is inefficient for contracts with many NFTs
    for (let tokenId = 1; tokenId <= parseInt(totalMinted); tokenId++) {
      try {
        const owner = await readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: NFT_CONTRACT_ABI,
          functionName: 'ownerOf',
          args: [tokenId],
        });
        
        if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
          // Get NFT details
          const details = await readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_CONTRACT_ABI,
            functionName: 'getNFTDetails',
            args: [tokenId],
          });
          
          // Get token URI
          const tokenURI = await readContract({
            address: NFT_CONTRACT_ADDRESS,
            abi: NFT_CONTRACT_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          });
          
          ownedNFTs.push(formatNFTData(tokenId, details, tokenURI));
          found++;
          
          // If we found all the NFTs owned by this address, we can stop
          if (found >= parseInt(balance)) {
            break;
          }
        }
      } catch (error) {
        // Skip errors (likely token doesn't exist or was burned)
        continue;
      }
    }
    
    return ownedNFTs;
  } catch (error) {
    console.error('Error getting NFTs by owner:', error);
    return [];
  }
};

export { MARKETPLACE_ABI, MARKETPLACE_ADDRESS, NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS };