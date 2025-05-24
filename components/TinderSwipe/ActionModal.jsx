import React from 'react';

const ActionModal = ({ isOpen, onClose, onMakeOffer, onInvest, onSaveForLater, nft }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden transition transform animate-scale-in shadow-2xl">
        {/* Header with NFT preview */}
        <div className="p-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white relative">
          <button 
            className="absolute top-3 right-3 text-white hover:text-gray-200 transition"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${nft.url})` }}></div>
            <div>
              <h3 className="text-xl font-bold">{nft.name}</h3>
              <p className="text-white text-opacity-80">Age: {nft.age}</p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <button 
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transform hover:scale-105 transition"
              onClick={onMakeOffer}
            >
              Make an Offer
            </button>
            
            <button 
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transform hover:scale-105 transition"
              onClick={onInvest}
            >
              Invest
            </button>
            
            <button 
              className="border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-50 transition"
              onClick={onSaveForLater}
            >
              Save for Later
            </button>
          </div>
        </div>
        
        {/* NFT details */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">NFT Details</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Description:</span>
              <span className="text-gray-900 text-right max-w-xs">{nft.description}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Revenue:</span>
              <span className="text-green-600 font-medium">${nft.revenue.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Net Income:</span>
              <span className="text-green-600 font-medium">${nft.netIncome.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;