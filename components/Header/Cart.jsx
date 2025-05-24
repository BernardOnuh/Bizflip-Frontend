
import React from 'react';

const Cart = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-[#1a1c1e] shadow-xl overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center">
            <h2 className="text-white text-lg font-medium">Your cart</h2>
            <button className="ml-2 text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col justify-center items-center p-8 text-gray-400 h-64">
          <p className="text-center">Add items to get started.</p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#1a1c1e] border-t border-gray-700">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
            Complete purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;