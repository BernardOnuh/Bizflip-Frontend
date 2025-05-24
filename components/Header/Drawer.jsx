import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CustomWallet from './CustomWallet';

const Drawer = ({ open, setOpen }) => {
  const closeDrawer = () => setOpen(false);
  const router = useRouter();

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'visible' : 'invisible'}`}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeDrawer}
      ></div>
      
      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-72 bg-[#0D1421] shadow-xl transform transition-transform ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button 
            className="text-gray-400 hover:text-white" 
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Search */}
        <div className="px-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-2 pl-10 text-sm text-white border border-gray-600 rounded-lg bg-[#1a263c] focus:outline-none" 
              placeholder="Search..." 
            />
          </div>
        </div>
        
        {/* Wallet Section */}
        <div className="px-4 mb-6">
          <CustomWallet />
        </div>
        
        {/* Menu Items */}
        <nav className="px-4">
          <ul className="space-y-4">
            <li>
              <Link href="/get-a-valuation" passHref>
                <div className="flex items-center text-white hover:text-blue-400 cursor-pointer" onClick={closeDrawer}>
                  <span className="font-medium">Get a Valuation</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/sell" passHref>
                <div className="flex items-center text-white hover:text-blue-400 cursor-pointer" onClick={closeDrawer}>
                  <span className="font-medium">Sell Now</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/bizflip-broker" passHref>
                <div className="flex items-center text-white hover:text-blue-400 cursor-pointer" onClick={closeDrawer}>
                  <span className="font-medium">Bizflip Broker</span>
                </div>
              </Link>
            </li>
            <li>
              <Link href="/roadmap" passHref>
                <div className="flex items-center text-white hover:text-blue-400 cursor-pointer" onClick={closeDrawer}>
                  <span className="font-medium">Roadmap</span>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-4">
            <Link href="/settings" passHref>
              <div className="flex items-center text-white hover:text-blue-400 cursor-pointer" onClick={closeDrawer}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Settings</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;