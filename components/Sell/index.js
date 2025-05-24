import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESS } from '@/utils/marketplace-abi';

// For simplicity in this demo, I'll define a function to handle Pinata uploads
// In production, you would likely call a backend service to handle this
const uploadToPinata = async (file) => {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || 'a1c6edc1aa04d16d2d38';
  const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '39304408eff0e388508f6aa9a1e5c809cf8c5f255dda2931f6558a10eca3792d';
  
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Set pinata metadata - IMPORTANT: keyvalues must use strings or numbers, not booleans
    const metadata = {
      name: file.name || "Untitled",
      keyvalues: {
        isPrivate: "true"  // Changed from boolean true to string "true"
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));
    
    // Configure pinata options
    const options = {
      cidVersion: 0,
      wrapWithDirectory: false
    };
    formData.append('pinataOptions', JSON.stringify(options));
    
    // Make the API request to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret
      },
      body: formData
    });
    
    // Get response text for proper error handling
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Pinata error response:", responseText);
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    // Parse the response text as JSON
    const data = JSON.parse(responseText);
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const uploadMetadataToPinata = async (metadata) => {
  const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || 'a1c6edc1aa04d16d2d38';
  const apiSecret = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '39304408eff0e388508f6aa9a1e5c809cf8c5f255dda2931f6558a10eca3792d';
  
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: "NFT Metadata",
          keyvalues: {
            isPrivate: "true"  // Changed from boolean true to string "true"
          }
        }
      })
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error("Pinata error response:", responseText);
      throw new Error(`Metadata upload failed with status: ${response.status}`);
    }
    
    const data = JSON.parse(responseText);
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const Sell = () => {
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const { writeContractAsync, isPending: isWritePending } = useWriteContract();
  
  const imageRef = useRef();
  
  // Mode toggle - new feature
  const [mode, setMode] = useState('mint'); // 'mint' or 'list'
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const getTotalSteps = () => mode === 'mint' ? 4 : 2; // Fewer steps for list-only mode
  
  // Collection state
  const [collections, setCollections] = useState([
    { id: 1, collectionName: "CryptoPunks", logoImageHash: "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx", erc721Address: "0x1234..." },
    { id: 2, collectionName: "Bored Ape Yacht Club", logoImageHash: "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq", erc721Address: "0x5678..." },
    { id: 3, collectionName: "Art Blocks", logoImageHash: "QmTmMUWQRym5jVqrLwE9y9QULjvszoZYxiGPCPazSZ6qA6", erc721Address: "0x9ABC..." }
  ]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [collectionLogo, setCollectionLogo] = useState(null);
  const [collectionLogoPreview, setCollectionLogoPreview] = useState(null);
  const [collectionLogoIpfsHash, setCollectionLogoIpfsHash] = useState("");
  const [isUploadingCollectionLogo, setIsUploadingCollectionLogo] = useState(false);
  
  // NFT state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hoveringImage, setHoveringImage] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [royalty, setRoyalty] = useState('');
  const [supply, setSupply] = useState('1');
  const [hasUnlockableContent, setHasUnlockableContent] = useState(false);
  const [unlockableContent, setUnlockableContent] = useState('');
  const [nftType, setNftType] = useState('');
  const [revenue, setRevenue] = useState('');
  const [age, setAge] = useState('');
  const [netProfit, setNetProfit] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  
  // Existing NFT data - for list-only mode
  // MODIFIED: Using a predefined contract address
  const predefinedContractAddress = '0x41349b39bbc971dab11ab6f4ebdbd9d907f84c38';
  const [tokenId, setTokenId] = useState('');
  const [existingNftData, setExistingNftData] = useState(null);
  const [isLoadingNft, setIsLoadingNft] = useState(false);
  
  // UI State
  const [isMinting, setIsMinting] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [ipfsImageHash, setIpfsImageHash] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [mintingProgress, setMintingProgress] = useState({ step: 0, message: '' });
  const [listingProgress, setListingProgress] = useState({ step: 0, message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mintHash, setMintHash] = useState(null);
  const [listingHash, setListingHash] = useState(null);

  // Wait for transaction receipt
  const { data: txReceipt, isSuccess: txSuccess, isError: txError } = 
    useWaitForTransactionReceipt({
      hash: mintHash || listingHash,
      enabled: !!(mintHash || listingHash)
    });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Section validation
  const [basicDetailsValid, setBasicDetailsValid] = useState(false);
  const [advancedSettingsValid, setAdvancedSettingsValid] = useState(false);
  const [listingValid, setListingValid] = useState(false);
  const [existingNftValid, setExistingNftValid] = useState(false);

  // Collection logo dropzone
  const { getRootProps: getCollectionLogoRootProps, getInputProps: getCollectionLogoInputProps } = useDropzone({
    onDrop: async acceptedFiles => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      setCollectionLogo(file);
      setCollectionLogoPreview(URL.createObjectURL(file));
      
      // Upload the collection logo to IPFS/Pinata
      setIsUploadingCollectionLogo(true);
      const result = await uploadToPinata(file);
      setIsUploadingCollectionLogo(false);
      
      if (result.success) {
        setCollectionLogoIpfsHash(result.ipfsHash);
        setSuccess(`Collection logo uploaded to IPFS: ${result.ipfsHash}`);
      } else {
        setError(`Failed to upload collection logo: ${result.error}`);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    maxSize: 5242880, // 5MB
  });

  // NFT image dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async acceptedFiles => {
      const file = acceptedFiles[0];
      if (!file) return;
      
      // Create data URL preview using FileReader (keep this for backup)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImagePreview(dataUrl); // Keep local preview as fallback
      };
      reader.readAsDataURL(file);
      
      setImage(file);
      setIsUploading(true);
      setError('');  
    
      const result = await uploadToPinata(file);
      
      if (result.success) {
        setIpfsImageHash(result.ipfsHash);
        setIpfsUrl(`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`);
        
        // Force a re-render to show the IPFS image instead of the local preview
        setImagePreview(`https://gateway.pinata.cloud/ipfs/${result.ipfsHash}`);
        
        // Rest of your metadata upload code...
      } else {
        setError(`Failed to upload to IPFS: ${result.error}`);
      }
      
      setIsUploading(false);
  
      if (result.success) {
        setIpfsImageHash(result.ipfsHash);
        setIpfsUrl(result.pinataUrl);
        
        // Now create and upload metadata
        const metadata = {
          name: name || 'Untitled NFT',
          symbol: symbol || 'SYMBOL',
          description: description || 'No description provided',
          image: `ipfs://${result.ipfsHash}`,
          attributes: [
            { trait_type: 'Asset Type', value: nftType || 'Art' },
            { trait_type: 'Age', value: age || '0' },
            { display_type: 'number', trait_type: 'Supply', value: supply || '1' },
            { display_type: 'number', trait_type: 'Royalty', value: royalty || '0' }
          ],
          properties: {
            revenue: revenue || '0',
            netProfit: netProfit || '0',
            hasUnlockableContent: hasUnlockableContent,
            unlockableContent: hasUnlockableContent ? unlockableContent : ''
          }
        };
        
        const metadataResult = await uploadMetadataToPinata(metadata);
        
        if (metadataResult.success) {
          setIpfsHash(metadataResult.ipfsHash);
          setSuccess(`NFT content uploaded to IPFS. Image: ${result.ipfsHash}, Metadata: ${metadataResult.ipfsHash}`);
        } else {
          setError(`Failed to upload metadata: ${metadataResult.error}`);
        }
        
        setIsUploading(false);
      } else {
        setError(`Failed to upload to IPFS: ${result.error}`);
        setIsUploading(false);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    maxSize: 15728640, // 15MB
  });

  // Collection logo removal
  const removeCollectionLogo = () => {
    setCollectionLogo(null);
    setCollectionLogoPreview(null);
    setCollectionLogoIpfsHash("");
  };

  // NFT image removal
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setIpfsHash('');
    setIpfsImageHash('');
    setIpfsUrl('');
  };

  // Create new collection
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      setError('Collection name is required');
      return;
    }

    const newId = collections.length + 1;
    const newCollection = {
      id: newId,
      collectionName: newCollectionName,
      description: newCollectionDescription,
      logoImageHash: collectionLogoIpfsHash || "QmDefaultLogo",
      erc721Address: "0x" + Math.random().toString(36).substring(2, 15)
    };

    setCollections([...collections, newCollection]);
    setSelectedCollection(newId.toString());
    setIsCreatingCollection(false);
    setSuccess('New collection created successfully!');
  };

  // Function to fetch NFT data from contract
  // MODIFIED: Now only requires tokenId since we use predefined contract address
  const fetchExistingNftData = async () => {
    if (!tokenId) {
      setError('Please provide a Token ID');
      return;
    }
    
    try {
      setIsLoadingNft(true);
      setError('');
      
      // In a real application, you would make a contract call here to get the NFT's metadata
      // For demo purposes, we'll simulate this with a timeout
      setTimeout(() => {
        // Mock response - in a real app this would come from the blockchain
        const nftData = {
          name: `NFT #${tokenId}`,
          description: "A beautiful digital collectible",
          image: "https://gateway.pinata.cloud/ipfs/QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx",
          attributes: [
            { trait_type: "Rarity", value: "Rare" },
            { trait_type: "Type", value: "Collectible" }
          ]
        };
        
        setExistingNftData(nftData);
        setName(nftData.name);
        setDescription(nftData.description);
        setImagePreview(nftData.image);
        setExistingNftValid(true);
        setIsLoadingNft(false);
        setSuccess(`NFT #${tokenId} data loaded successfully`);
      }, 1500);
      
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      setError(`Failed to fetch NFT data: ${error.message}`);
      setIsLoadingNft(false);
    }
  };

  // Effect for handling transaction receipt
  useEffect(() => {
    if (txSuccess && txReceipt) {
      console.log("Transaction successful:", txReceipt);
      if (mintHash) {
        setMintingProgress({ step: 5, message: 'NFT minted and listed successfully!' });
        setSuccess(`NFT minted successfully! Transaction hash: ${mintHash}`);
        setIsMinting(false);
      } else if (listingHash) {
        setListingProgress({ step: 3, message: 'NFT listed successfully!' });
        setSuccess(`NFT listed successfully! Transaction hash: ${listingHash}`);
        setIsListing(false);
      }
    } else if (txError) {
      console.error("Transaction error");
      setError("Transaction failed. Please check your wallet for details.");
      setIsMinting(false);
      setIsListing(false);
    }
  }, [txSuccess, txError, txReceipt, mintHash, listingHash]);

  // Update metadata when form fields change
  useEffect(() => {
    // Only update metadata if we already have an image hash
    if (ipfsImageHash && !isUploading && !isMinting) {
      const updateMetadata = async () => {
        // Create updated metadata with current form values
        const metadata = {
          name: name || 'Untitled NFT',
          symbol: symbol || 'SYMBOL',
          description: description || 'No description provided',
          image: `ipfs://${ipfsImageHash}`,
          attributes: [
            { trait_type: 'Asset Type', value: nftType || 'Art' },
            { trait_type: 'Age', value: age || '0' },
            { display_type: 'number', trait_type: 'Supply', value: supply || '1' },
            { display_type: 'number', trait_type: 'Royalty', value: royalty || '0' }
          ],
          properties: {
            revenue: revenue || '0',
            netProfit: netProfit || '0',
            hasUnlockableContent: hasUnlockableContent,
            unlockableContent: hasUnlockableContent ? unlockableContent : ''
          }
        };
        
        // Only update if significant changes have been made
        if (name && symbol && description) {
          setIsUploading(true);
          const result = await uploadMetadataToPinata(metadata);
          setIsUploading(false);
          
          if (result.success) {
            setIpfsHash(result.ipfsHash);
          }
        }
      };
      
      // Debounce metadata updates using a timeout
      const debounceTimeout = setTimeout(() => {
        updateMetadata();
      }, 2000); // Wait 2 seconds after typing stops before updating
      
      return () => clearTimeout(debounceTimeout);
    }
  }, [name, symbol, description, nftType, age, supply, royalty, hasUnlockableContent, unlockableContent, ipfsImageHash]);

  // Step validation
  // MODIFIED: For list-only mode, we only need to validate tokenId and not the contract address
  useEffect(() => {
    const collectionSelected = selectedCollection !== "" || isCreatingCollection;

    // Basic details validation
    setBasicDetailsValid(
      image !== null && 
      ipfsHash !== '' && 
      name.trim() !== '' && 
      symbol.trim() !== '' && 
      collectionSelected
    );

    // Advanced settings validation - always valid for now as they're optional
    setAdvancedSettingsValid(true);

    // Listing validation
    setListingValid(listingPrice !== '' && parseFloat(listingPrice) > 0);

    // Existing NFT validation - now we only check tokenId
    setExistingNftValid(
      tokenId !== '' && 
      existingNftData !== null
    );

  }, [
    image, ipfsHash, name, symbol, selectedCollection, isCreatingCollection, listingPrice,
    tokenId, existingNftData
  ]);

  const renderWalletStatus = () => {
    // Only show the actual status when component is mounted on client
    if (!isMounted) {
      return (
        <div className="text-sm text-gray-600">
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            <span>Connecting wallet...</span>
          </div>
        </div>
      );
    }
    
    // Now it's safe to render the correct status since we're on the client
    return (
      <div className="text-sm text-gray-600">
        {isConnected ? (
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span>Connected: {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : ''}</span>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            <span>Wallet not connected</span>
          </div>
        )}
      </div>
    );
  };

  // Navigation functions
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getNextStepEligibility = () => {
    const issues = [];

    // Different validation based on mode
    if (mode === 'mint') {
      // Step 1 Validation
      if (currentStep === 1) {
        if (!image) {
          issues.push("Please upload an NFT image");
        }
        if (selectedCollection === "" && !isCreatingCollection) {
          issues.push("Please select or create a collection");
        }
      }

      // Step 2 Validation (Basic Details)
      if (currentStep === 2) {
        if (!name.trim()) {
          issues.push("NFT Name is required");
        }
        if (!symbol.trim()) {
          issues.push("NFT Symbol is required");
        }
      }

      // Step 3 Validation (Advanced Settings)
      if (currentStep === 3) {
        // Optional validations for advanced settings can be added here
      }

      // Step 4 Validation (Listing)
      if (currentStep === 4) {
        if (!listingPrice || parseFloat(listingPrice) <= 0) {
          issues.push("Listing Price must be greater than 0");
        }
        if (!isConnected) {
          issues.push("Please connect your wallet first");
        }
      }
    } else if (mode === 'list') {
      // List-only mode validations - MODIFIED to only check for tokenId
      
      // Step 1 Validation (NFT Details)
      if (currentStep === 1) {
        if (!tokenId) {
          issues.push("Token ID is required");
        }
        if (!existingNftData) {
          issues.push("Please fetch the NFT data first");
        }
      }
      
      // Step 2 Validation (Listing)
      if (currentStep === 2) {
        if (!listingPrice || parseFloat(listingPrice) <= 0) {
          issues.push("Listing Price must be greater than 0");
        }
        if (!isConnected) {
          issues.push("Please connect your wallet first");
        }
      }
    }

    return {
      isEligible: issues.length === 0,
      issues: issues
    };
  };

  const goToNextStep = () => {
    const validationResult = getNextStepEligibility();

    if (validationResult.isEligible) {
      console.log("Moving to next step");
      setCurrentStep(currentStep + 1);
      setError(''); // Clear any previous errors
    } else {
      // Display errors
      const errorMessage = validationResult.issues.join('\n');
      setError(errorMessage);
    }
  };

  const isNextButtonDisabled = () => {
    const validationResult = getNextStepEligibility();
    return !validationResult.isEligible || isUploading || isLoadingNft;
  };

  // Mint NFT using wagmi/viem
  const mintNFT = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsMinting(true);
      setMintingProgress({ step: 1, message: 'Connecting to wallet...' });
      
      // Prepare royalty fee (convert percentage to basis points)
      const royaltyFee = Math.floor(parseFloat(royalty || '0') * 100);
      
      setMintingProgress({ step: 2, message: 'Preparing NFT data...' });
      
      // Convert listing price to Wei
      const listingPriceWei = parseEther(listingPrice || '0');
      
      setMintingProgress({ step: 3, message: 'Minting NFT...' });
      
      // Make sure you've properly imported and initialized Wagmi v2
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'mintAndList',
        args: [
          name,
          symbol,
          parseInt(age || '0'),
          nftType || 'Art',
          `ipfs://${ipfsHash}`,
          hasUnlockableContent,
          hasUnlockableContent ? unlockableContent : '',
          royaltyFee,
          listingPriceWei
        ]
      });
      
      setMintHash(hash);
      setMintingProgress({ step: 4, message: 'Transaction submitted, waiting for confirmation...' });
    } catch (err) {
      console.error("Error minting NFT:", err);
      setError(`Failed to mint NFT: ${err.message || "Unknown error"}`);
      setIsMinting(false);
    }
  };

  // List existing NFT function - MODIFIED to use predefined contract address
  const listExistingNFT = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!tokenId || !listingPrice) {
      setError("Missing required fields: Token ID or listing price");
      return;
    }

    try {
      setIsListing(true);
      setListingProgress({ step: 1, message: 'Preparing to list NFT...' });
      
      // Convert listing price to Wei
      const listingPriceWei = parseEther(listingPrice || '0');
      
      setListingProgress({ step: 2, message: 'Listing NFT...' });
      
      // Call the marketplace contract to list the existing NFT with the predefined address
      const hash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [
          predefinedContractAddress, // Using the predefined contract address
          tokenId,
          listingPriceWei
        ]
      });
      
      setListingHash(hash);
      setListingProgress({ step: 3, message: 'Transaction submitted, waiting for confirmation...' });
    } catch (err) {
      console.error("Error listing NFT:", err);
      setError(`Failed to list NFT: ${err.message || "Unknown error"}`);
      setIsListing(false);
    }
  };

  // Mode toggle handler
  const handleModeToggle = (newMode) => {
    setMode(newMode);
    setCurrentStep(1);
    setError('');
    setSuccess('');
    
    // Reset appropriate fields based on the mode
    if (newMode === 'mint') {
      setTokenId('');
      setExistingNftData(null);
    } else {
      // For list-only mode, reset mint-specific fields but keep predefined address
      setIpfsHash('');
      setIpfsImageHash('');
      setImage(null);
      setImagePreview(null);
    }
  };

  // Step indicator for mint+list mode
  const renderMintStepIndicator = () => {
    return (
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1 relative flex flex-col items-center">
            <div 
              className={`w-10 h-10 mb-3 rounded-full flex items-center justify-center relative z-10 ${
                currentStep === step 
                  ? 'bg-purple-600 text-white' 
                  : currentStep > step 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 4&& (
              <div 
                className={`absolute top-5 left-1/2 right-1/2 h-0.5 w-full ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                }`}
                style={{ transform: 'translateX(-50%)' }}
              ></div>
            )}
            <div className={`text-xs text-center w-full ${
              currentStep === step 
                ? 'text-purple-600 font-semibold' 
                : currentStep > step 
                ? 'text-green-500' 
                : 'text-gray-500'
            }`}>
              {step === 1 ? 'Upload' : 
               step === 2 ? 'Basic Details' : 
               step === 3 ? 'Advanced' : 'Listing'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Step indicator for list-only mode
  const renderListStepIndicator = () => {
    return (
      <div className="flex items-center justify-center">
        {[1, 2].map((step) => (
          <div key={step} className="flex-1 relative flex flex-col items-center max-w-[200px]">
            <div 
              className={`w-10 h-10 mb-3 rounded-full flex items-center justify-center relative z-10 ${
                currentStep === step 
                  ? 'bg-purple-600 text-white' 
                  : currentStep > step 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 2 && (
              <div 
                className={`absolute top-5 left-1/2 right-1/2 h-0.5 w-full ${
                  currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                }`}
                style={{ transform: 'translateX(-50%)' }}
              ></div>
            )}
            <div className={`text-xs text-center w-full ${
              currentStep === step 
                ? 'text-purple-600 font-semibold' 
                : currentStep > step 
                ? 'text-green-500' 
                : 'text-gray-500'
            }`}>
              {step === 1 ? 'NFT Details' : 'Listing'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Step content rendering functions
  const renderStepContent = () => {
    if (mode === 'mint') {
      return renderMintStepContent();
    } else {
      return renderListStepContent();
    }
  };

  // Content for list-only mode - MODIFIED to show predefined contract address
  const renderListStepContent = () => {
    switch (currentStep) {
      case 1: // NFT Details
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4">Step 1: NFT Details</h2>
            <div className="flex flex-col md:flex-row gap-8">
              {/* NFT Lookup Form */}
              <div className="w-full md:w-2/3 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-4 text-gray-800">Enter NFT Information</h3>
                  
                  {/* Contract Address - Now read-only */}
                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm font-medium mb-2">
                      NFT Contract Address
                    </label>
                    <div className="flex items-center bg-gray-100 border border-gray-300 rounded-md py-3 px-4 text-gray-800">
                      <span className="text-gray-600 font-mono text-sm">{predefinedContractAddress}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Predefined contract address for this marketplace
                    </p>
                  </div>
                  
                  {/* Token ID */}
                  <div className="mb-6">
                    <label className="block text-gray-600 text-sm font-medium mb-2">
                      Token ID <span className="text-xs text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="123"
                      value={tokenId}
                      onChange={e => setTokenId(e.target.value)}
                      disabled={isListing || isLoadingNft}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the token ID of the NFT you want to list
                    </p>
                  </div>
                  
                  {/* Fetch button */}
                  <button
                    className={`w-full py-3 px-4 rounded-md transition-colors ${
                      tokenId && !isLoadingNft
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={fetchExistingNftData}
                    disabled={!tokenId || isLoadingNft}
                  >
                    {isLoadingNft ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Fetching NFT Data...
                      </div>
                    ) : "Fetch NFT Data"}
                  </button>
                </div>
                
                {existingNftData && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">NFT Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">
                          Name
                        </label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                          {existingNftData.name}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">
                          Description
                        </label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[60px]">
                          {existingNftData.description}
                        </div>
                      </div>
                      
                      {existingNftData.attributes && existingNftData.attributes.length > 0 && (
                        <div>
                          <label className="block text-gray-600 text-sm font-medium mb-2">
                            Attributes
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {existingNftData.attributes.map((attr, index) => (
                              <div key={index} className="bg-gray-50 rounded-md p-2 border border-gray-200">
                                <span className="text-xs text-gray-500">{attr.trait_type}:</span>
                                <span className="text-sm ml-1 font-medium">{attr.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* NFT Preview */}
              <div className="w-full md:w-1/3">
                <div className="sticky top-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">NFT Preview</h3>
                    
                    {isLoadingNft ? (
                      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="animate-spin h-10 w-10 text-purple-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500">Loading NFT data...</p>
                      </div>
                    ) : existingNftData ? (
                      <div>
                        <img 
                          src={existingNftData.image} 
                          alt={existingNftData.name} 
                          className="w-full h-64 object-contain rounded-lg bg-gray-50 border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x400?text=NFT+Image+Not+Available";
                          }}
                        />
                        <div className="mt-3">
                          <div className="text-lg font-bold text-gray-800">{existingNftData.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{existingNftData.description}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-center">Enter Token ID and click "Fetch NFT Data" to preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2: // Listing
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Step 2: Listing Details</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Form */}
              <div className="w-full md:w-2/3">
                <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
                  <div>
                    <label className="block text-gray-600 text-sm font-medium mb-2">
                      Listing Price (ETH) <span className="text-xs text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter listing price in ETH"
                      value={listingPrice}
                      onChange={e => setListingPrice(e.target.value)}
                      min="0"
                      step="0.001"
                      disabled={isListing || isLoadingNft}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Your NFT will be listed for sale on the marketplace at this price.
                    </p>
                  </div>
                </div>
                
                {/* Wallet Connection Reminder */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Wallet Connection Required</h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        <p>
                          {isConnected 
                            ? `Your wallet is connected as ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`
                            : 'Please connect your wallet using the button at the top to list your NFT.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Marketplace explainer */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-md font-medium text-purple-600 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Marketplace Information
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    When you list your NFT, it will be immediately available for sale on our marketplace.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3">Price Breakdown:</div>
                    
                    <div className="text-sm">
                      <div className="flex justify-between mb-2">
                        <span>Listing Price:</span>
                        <span>{listingPrice ? `${listingPrice} ETH` : '0 ETH'}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Marketplace Fee (2.5%):</span>
                        <span className="text-red-500">
                          {listingPrice ? `-${(parseFloat(listingPrice) * 0.025).toFixed(4)} ETH` : '0 ETH'}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium text-gray-800 pt-2 border-t border-gray-300 mt-2">
                        <span>You'll Receive:</span>
                        <span>{listingPrice ? `${(parseFloat(listingPrice) * 0.975).toFixed(4)} ETH` : '0 ETH'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Summary */}
              <div className="w-full md:w-1/3">
                <div className="sticky top-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">NFT Summary</h3>
                    
                    {existingNftData && (
                      <>
                        <div className="mb-3">
                          <img 
                            src={existingNftData.image} 
                            alt={existingNftData.name} 
                            className="w-full rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/400x400?text=NFT+Image+Not+Available";
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-gray-500 text-sm">Name:</span>
                            <div className="font-medium text-gray-800">{existingNftData.name}</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 text-sm">Contract:</span>
                            <div className="font-medium text-gray-800 text-xs break-all">{predefinedContractAddress}</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 text-sm">Token ID:</span>
                            <div className="font-medium text-gray-800">{tokenId}</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 text-sm">Listing Price:</span>
                            <div className="font-medium text-gray-800">{listingPrice ? `${listingPrice} ETH` : 'Not set'}</div>
                          </div>
                          
                          <div className="pt-4 mt-2 border-t border-gray-200">
                            <span className="text-gray-500 text-sm">Transaction Status:</span>
                            <div className="font-medium text-gray-800 mt-1">
                              {isListing ? (
                                <span className="flex items-center text-amber-600">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  {listingProgress.message}
                                </span>
                              ) : listingHash ? (
                                <div>
                                  <span className="flex items-center text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Transaction submitted
                                  </span>
                                  <a 
                                    href={`https://etherscan.io/tx/${listingHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-600 hover:underline block mt-1"
                                  >
                                    View on Etherscan
                                  </a>
                                </div>
                              ) : (
                                <span>Ready to list</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

// Content for mint+list mode
const renderMintStepContent = () => {
  // Use the existing step content from the original component
  switch (currentStep) {
    case 1: // Upload
      return (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Step 1: Upload Your NFT</h2>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Image Upload */}
            <div className="w-full md:w-1/2">
              <div 
                {...getRootProps()} 
                className={`w-full aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all relative ${
                  image ? 'border-purple-500' : hoveringImage ? 'border-purple-400 bg-gray-50' : 'border-gray-300 bg-gray-50'
                }`}
                onMouseEnter={() => setHoveringImage(true)}
                onMouseLeave={() => setHoveringImage(false)}
              >
                <input {...getInputProps()} />
                
                {imagePreview ? (
                  <div className="w-full h-full relative group">
                    <img
                      className="w-full h-full object-contain rounded-xl bg-white" // White background
                      src={`https://gateway.pinata.cloud/ipfs/${ipfsImageHash}`} // Use IPFS gateway URL directly
                      alt="NFT preview"
                      onError={(e) => {
                        console.error("IPFS image failed to load", e);
                        // Try alternative gateway as fallback
                        e.target.src = `https://ipfs.io/ipfs/${ipfsImageHash}`;
                        // If that fails too, use the local preview
                        e.target.onerror = () => {
                          e.target.src = imagePreview;
                          e.target.onerror = null;
                        };
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-xl flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 text-lg mb-2">Drop your file here or</p>
                    <button 
                      type="button" 
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // This will find the input element within the dropzone and click it
                        const input = document.querySelector('input[type=file]');
                        if (input) input.click();
                      }}
                    >
                      Browse Files
                    </button>
                    <p className="text-gray-500 text-sm mt-4">JPG, PNG, BMP, GIF • Max 15MB</p>
                    <p className="text-gray-500 text-sm mt-2">Automatically uploads to IPFS</p>
                  </div>
                )}
                
                {/* Uploading indicator */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <svg className="animate-spin h-10 w-10 text-purple-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-white font-medium">Uploading to IPFS...</span>
                    </div>
                  </div>
                )}
              </div>
            
              {/* IPFS Upload Status */}
              {ipfsHash && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md border border-gray-200">
                  <div className="flex items-center text-sm text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 000-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Upload complete
                  </div>
                  <div className="mt-1 text-xs text-gray-600 break-all">
                    <span className="font-semibold">IPFS Hash:</span> {ipfsHash}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    <span className="font-semibold">IPFS URL:</span>{' '}
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      View on IPFS Gateway
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Collection Selection */}
            <div className="w-full md:w-1/2">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-3 text-gray-800">Collection</h3>
                
                {!isCreatingCollection ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-gray-600 text-sm font-medium">
                        Select Collection
                      </label>
                      <button 
                        className="text-sm text-purple-600 hover:text-purple-800"
                        onClick={() => setIsCreatingCollection(true)}
                      >
                        + Create New
                      </button>
                    </div>
                    <div className="relative">
                      <select 
                        className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        disabled={isMinting || isUploading}
                      >
                        <option value="" disabled>Choose Collection</option>
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.collectionName}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {selectedCollection && imagePreview && (
                      <div className="mt-6">
                        <div className="text-sm text-gray-600 mb-2">Preview:</div>
                        <div className="bg-gray-50 rounded-lg p-3 flex items-center border border-gray-200">
                          <div className="w-12 h-12 rounded-md overflow-hidden mr-3 bg-gray-100 flex-shrink-0">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden">
                                <img 
                                  src={`https://gateway.pinata.cloud/ipfs/${collections.find(c => c.id.toString() === selectedCollection)?.logoImageHash}`} 
                                  alt="Collection" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <span className="text-xs text-gray-500 ml-1">
                                {collections.find(c => c.id.toString() === selectedCollection)?.collectionName}
                              </span>
                            </div>
                            <div className="text-sm font-medium mt-1 text-gray-800">Ready to proceed</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Collection creation form
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-600 text-sm font-medium mb-2">
                        Collection Name <span className="text-xs text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter collection name"
                        value={newCollectionName}
                        onChange={e => setNewCollectionName(e.target.value)}
                        maxLength={40}
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <button 
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
                        onClick={() => setIsCreatingCollection(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-md transition-colors ${
                          newCollectionName.trim() !== '' 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={handleCreateCollection}
                        disabled={newCollectionName.trim() === ''}
                      >
                        Create Collection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    
    case 2: // Basic Details
      return (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Step 2: Basic Details</h2>
          <div className="flex flex-col md:flex-row gap-8">
            {/* NFT Details Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-medium mb-4 text-gray-800">NFT Information</h3>
                
                {/* NFT Name */}
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    NFT Name <span className="text-xs text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter NFT name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={isMinting || isUploading}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give your NFT a descriptive name
                  </p>
                </div>
                
                {/* NFT Symbol */}
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Symbol <span className="text-xs text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter symbol (e.g. BTC, ETH)"
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    disabled={isMinting || isUploading}
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Short identifier for your NFT (usually 3-5 characters)
                  </p>
                </div>
                
                {/* Description */}
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Description <span className="text-xs text-red-500">*</span>
                  </label>
                  <textarea
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] resize-y"
                    placeholder="Describe your NFT..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={isMinting || isUploading}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Detailed description of your NFT and its uniqueness
                  </p>
                </div>
                
                {/* Supply */}
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Supply
                  </label>
                  <input
                    type="number"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1"
                    value={supply}
                    onChange={e => setSupply(e.target.value)}
                    disabled={isMinting || isUploading}
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of copies of this NFT to mint
                  </p>
                </div>
              </div>
              
              {/* NFT Type */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-800">NFT Type</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {['Art', 'Collectible', 'Domain', 'Music', 'Video', 'Virtual World'].map((type) => (
                    <div 
                      key={type}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                        nftType === type 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                      onClick={() => !isMinting && !isUploading && setNftType(type)}
                    >
                      <div className="font-medium text-gray-800">{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Preview Panel */}
            <div className="w-full md:w-1/3">
              <div className="sticky top-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-4">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">NFT Preview</h3>
                  
                  {imagePreview ? (
                    <div>
                      <div className="w-full rounded-lg overflow-hidden mb-3 bg-gray-50 border border-gray-200">
                        <img 
                          src={imagePreview}
                          alt="NFT Preview" 
                          className="w-full object-contain" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-bold text-lg text-gray-800 break-words">
                          {name || 'Untitled NFT'}
                        </div>
                        
                        {selectedCollection && (
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden mr-1">
                              <img 
                                src={`https://gateway.pinata.cloud/ipfs/${collections.find(c => c.id.toString() === selectedCollection)?.logoImageHash}`} 
                                alt="Collection" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <span>
                              {collections.find(c => c.id.toString() === selectedCollection)?.collectionName}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-600 mt-2 break-words">
                          {description || 'No description provided.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">No image uploaded yet</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Completion Status</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${image ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={image ? 'text-green-600' : 'text-gray-500'}>Image uploaded</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${selectedCollection ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={selectedCollection ? 'text-green-600' : 'text-gray-500'}>Collection selected</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${name && symbol && description ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={name && symbol && description ? 'text-green-600' : 'text-gray-500'}>Required details completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 3: // Advanced Settings
      return (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4">Step 3: Advanced Settings</h2>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Advanced Settings Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Advanced Settings</h3>
                
                {/* Royalty */}
                <div className="mb-6">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Royalty (%)
                  </label>
                  <input
                    type="number"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="5"
                    value={royalty}
                    onChange={e => setRoyalty(e.target.value)}
                    disabled={isMinting || isUploading}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of secondary sales you'll receive as royalty
                  </p>
                </div>
                
                {/* Unlockable Content Toggle */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-600 text-sm font-medium">
                      Unlockable Content
                    </label>
                    <div className="flex items-center">
                      <div 
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                          hasUnlockableContent ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                        onClick={() => !isMinting && !isUploading && setHasUnlockableContent(!hasUnlockableContent)}
                      >
                        <div 
                          className={`bg-white h-4 w-4 rounded-full shadow-md transform transition-transform ${
                            hasUnlockableContent ? 'translate-x-6' : ''
                          }`} 
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Include content that only becomes available after purchase
                  </p>
                </div>
                
                {/* Unlockable Content Field (conditionally shown) */}
                {hasUnlockableContent && (
                  <div className="mb-6">
                    <label className="block text-gray-600 text-sm font-medium mb-2">
                      Unlockable Content Details
                    </label>
                    <textarea
                      className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] resize-y"
                      placeholder="Enter details that will be available to the buyer after purchase..."
                      value={unlockableContent}
                      onChange={e => setUnlockableContent(e.target.value)}
                      disabled={isMinting || isUploading}
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This content will be revealed only to the owner of the NFT
                    </p>
                  </div>
                )}
              </div>
              
              {/* Additional Properties */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Additional Properties</h3>
                
                {/* Age */}
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    disabled={isMinting || isUploading}
                    min="0"
                  />
                </div>
                
                {/* Revenue */}
                <div className="mb-4">
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Revenue (USD/year)
                  </label>
                  <input
                    type="number"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    value={revenue}
                    onChange={e => setRevenue(e.target.value)}
                    disabled={isMinting || isUploading}
                    min="0"
                  />
                </div>
                
                {/* Net Profit */}
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Net Profit (USD/year)
                  </label>
                  <input
                    type="number"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    value={netProfit}
                    onChange={e => setNetProfit(e.target.value)}
                    disabled={isMinting || isUploading}
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            {/* Preview/Help Panel */}
            <div className="w-full md:w-1/3">
              <div className="sticky top-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-4">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">Metadata Preview</h3>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs text-gray-700 overflow-x-auto">
                    <pre>
                      {JSON.stringify(
                        {
                          name: name || 'Untitled NFT',
                          symbol: symbol || 'SYMBOL',
                          description: description ? (description.length > 50 
                            ? description.substring(0, 50) + '...' 
                            : description
                        ) : 'No description provided',
                          image: `ipfs://${ipfsImageHash || 'hash_placeholder'}`,
                          attributes: [
                            { trait_type: 'Asset Type', value: nftType || 'Art' },
                            { trait_type: 'Age', value: age || '0' },
                            { display_type: 'number', trait_type: 'Supply', value: supply || '1' },
                            { display_type: 'number', trait_type: 'Royalty', value: royalty || '0' }
                          ],
                          properties: {
                            revenue: revenue || '0',
                            netProfit: netProfit || '0',
                            hasUnlockableContent: hasUnlockableContent,
                            unlockableContent: hasUnlockableContent ? 'Hidden until purchase' : ''
                          }
                        }, 
                        null, 
                        2
                      )}
                    </pre>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Help
                  </h3>
                  
                  <div className="text-sm text-gray-600 space-y-3">
                    <p>
                      <strong>Royalties</strong> allow you to earn a percentage of the sale price each time your NFT is sold on secondary markets.
                    </p>
                    <p>
                      <strong>Unlockable content</strong> is private information that only becomes visible to the owner after purchase.
                    </p>
                    <p>
                      All additional properties help make your NFT more discoverable and informative for potential buyers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 4: // Listing
      return (
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Step 4: Listing Details</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Listing Form */}
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-800">Listing Price</h3>
                
                <div>
                  <label className="block text-gray-600 text-sm font-medium mb-2">
                    Price (ETH) <span className="text-xs text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="block w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter listing price in ETH"
                    value={listingPrice}
                    onChange={e => setListingPrice(e.target.value)}
                    min="0"
                    step="0.001"
                    disabled={isMinting || isUploading}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Set the price at which your NFT will be listed for sale.
                  </p>
                </div>
              </div>
              
              {/* Wallet Connection Reminder */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Wallet Connection Required</h3>
                    <div className="mt-1 text-sm text-yellow-700">
                      <p>
                        {isConnected 
                          ? `Your wallet is connected as ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`
                          : 'Please connect your wallet using the button at the top to mint and list your NFT.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Marketplace explainer */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-md font-medium text-purple-600 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Marketplace Information
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  When you mint and list your NFT, it will be immediately available for sale on our marketplace.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">Price Breakdown:</div>
                  
                  <div className="text-sm">
                    <div className="flex justify-between mb-2">
                      <span>Listing Price:</span>
                      <span>{listingPrice ? `${listingPrice} ETH` : '0 ETH'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Marketplace Fee (2.5%):</span>
                      <span className="text-red-500">
                        {listingPrice ? `-${(parseFloat(listingPrice) * 0.025).toFixed(4)} ETH` : '0 ETH'}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-800 pt-2 border-t border-gray-300 mt-2">
                      <span>You'll Receive:</span>
                      <span>{listingPrice ? `${(parseFloat(listingPrice) * 0.975).toFixed(4)} ETH` : '0 ETH'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary */}
            <div className="w-full md:w-1/3">
              <div className="sticky top-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium mb-3 text-gray-800">NFT Summary</h3>
                  
                  {imagePreview ? (
                    <>
                      <div className="mb-3">
                        <img 
                          src={imagePreview} 
                          alt={name} 
                          className="w-full rounded-lg"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-500 text-sm">Name:</span>
                          <div className="font-medium text-gray-800">{name || 'Untitled NFT'}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 text-sm">Type:</span>
                          <div className="font-medium text-gray-800">{nftType || 'Art'}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 text-sm">Collection:</span>
                          <div className="font-medium text-gray-800">
                            {selectedCollection 
                              ? collections.find(c => c.id.toString() === selectedCollection)?.collectionName
                              : 'No collection'
                            }
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 text-sm">Royalty:</span>
                          <div className="font-medium text-gray-800">{royalty ? `${royalty}%` : '0%'}</div>
                        </div>
                        
                        <div>
                          <span className="text-gray-500 text-sm">Listing Price:</span>
                          <div className="font-medium text-gray-800">{listingPrice ? `${listingPrice} ETH` : 'Not set'}</div>
                        </div>
                        
                        <div className="pt-4 mt-2 border-t border-gray-200">
                          <span className="text-gray-500 text-sm">Transaction Status:</span>
                          <div className="font-medium text-gray-800 mt-1">
                            {isMinting ? (
                              <span className="flex items-center text-amber-600">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {mintingProgress.message}
                              </span>
                            ) : mintHash ? (
                              <div>
                                <span className="flex items-center text-green-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Transaction submitted
                                </span>
                                <a 
                                  href={`https://etherscan.io/tx/${mintHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-600 hover:underline block mt-1"
                                >
                                  View on Etherscan
                                </a>
                              </div>
                            ) : (
                              <span>Ready to mint</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-center">No image uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

  // Render step indicator based on mode
  const renderStepIndicator = () => {
    return mode === 'mint' ? renderMintStepIndicator() : renderListStepIndicator();
  };

  return (
    <div className="min-h-screen bg-white p-6 text-gray-800">
      <div className="max-w-6xl mx-auto mt-[100px]">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-200">
          <div className="p-6 bg-purple-50 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              {mode === 'mint' ? 'Create New NFT' : 'List Existing NFT'}
            </h1>
            <p className="text-gray-600 mt-2">
              {mode === 'mint' 
                ? 'Complete all steps to mint your unique digital asset' 
                : 'List your NFT on the marketplace for others to buy'
              }
            </p>
            
            {/* Mode Toggle */}
            <div className="flex mt-4 bg-white rounded-md shadow-sm p-1 w-fit">
              <button
                className={`px-4 py-2 text-sm rounded-md ${
                  mode === 'mint'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleModeToggle('mint')}
              >
                Mint & List
              </button>
              <button
                className={`px-4 py-2 text-sm rounded-md ${
                  mode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => handleModeToggle('list')}
              >
                List Only
              </button>
            </div>
          </div>
          
          {/* Wallet Connection Status */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {renderWalletStatus()}
              </div>

            </div>
          </div>
          
          <div className="p-6">
            {renderStepIndicator()}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-200">
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
          
          {success && (
            <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600">
              {success}
            </div>
          )}
          
          <div className="p-6">
            {renderStepContent()}
          </div>
          
          {/* Progress Indicator */}
          {(isMinting || isListing) && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" 
                    style={{ 
                      width: `${
                        mode === 'mint' 
                          ? (mintingProgress.step / 5) * 100 
                          : (listingProgress.step / 3) * 100
                      }%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">
                    {mode === 'mint' ? mintingProgress.message : listingProgress.message}
                  </span>
                </div>
                <div className="text-gray-500">
                  {mode === 'mint' 
                    ? `Step ${mintingProgress.step} of 5` 
                    : `Step ${listingProgress.step} of 3`
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center">
            <button 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition-colors border border-gray-300"
              onClick={goToPreviousStep}
              disabled={currentStep === 1 || isMinting || isListing || isUploading || isLoadingNft}
            >
              Previous
            </button>

            {currentStep < getTotalSteps() ? (
              <button 
                className={`px-4 py-2 rounded-md transition-colors ${
                  isNextButtonDisabled()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                onClick={goToNextStep}
                disabled={isNextButtonDisabled()}
              >
                Next
              </button>
            ) : (
              <button 
                className={`px-6 py-3 rounded-md transition-all duration-300 flex items-center ${
                  (mode === 'mint' ? listingValid : existingNftValid && listingValid) &&
                  !isMinting && !isListing && !isUploading && !isLoadingNft && isConnected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={
                  (mode === 'mint' ? !listingValid : !existingNftValid || !listingValid) ||
                  isMinting || isListing || isUploading || isLoadingNft || !isConnected
                }
                onClick={mode === 'mint' ? mintNFT : listExistingNFT}
              >
                {mode === 'mint' ? (
                  isMinting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting NFT...
                    </>
                  ) : (
                    <>
                      Mint & List NFT
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )
                ) : (
                  isListing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Listing NFT...
                    </>
                  ) : (
                    <>
                      List NFT
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;