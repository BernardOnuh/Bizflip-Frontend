import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  // State management
  const [open, setOpen] = useState(false);
  const [showSecondNavbar, setShowSecondNavbar] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  // Auth context
  const { isAuthenticated, authMessage, signAndVerify, logout, loading, error } = useAuth();
  
  // Refs for handling click outside
  const profileMenuRef = useRef(null);
  const cartRef = useRef(null);
  
  // Toggle functions
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleCart = () => setShowCart(!showCart);
  const toggleDrawer = () => setOpen(!open);
  
  // Handle scroll for sticky navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowSecondNavbar(scrollY > 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle clicks outside profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="cart"]')) {
        setShowCart(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <>
      <div className="w-full mx-auto relative bg-gradient-to-r from-[#041c33] to-[#04253f] z-[100]">
        {/* Accent line at the top of the header */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600"></div>
        
        <nav className={`fixed w-full bg-gradient-to-r from-[#041c33] to-[#04253f] px-2 sm:px-4 md:px-6 lg:px-8 xl:px-16 mx-auto ${showSecondNavbar ? 'shadow-lg shadow-black/20' : ''} transition-all duration-300`}>
          {/* Content wrapper for large screens */}
          <div className="max-w-[1920px] mx-auto">
            <div className="flex flex-wrap items-center justify-between mx-auto py-3 md:py-4">
              {/* Logo Section */}
              <Link href="/" passHref>
                <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse cursor-pointer group">
                  <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 shadow-lg transition-all duration-300 group-hover:scale-105">
                    <Image src="/logo/icon.png" width={45} height={45} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full" />
                  </div>
                  <span className="self-center font-[800] text-base sm:text-lg lg:text-xl whitespace-nowrap text-white group-hover:text-blue-300 transition-colors duration-300">bizflip.io</span>
                </div>
              </Link>

              {/* Main Navigation - Desktop */}
              <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-4">
                <Link href="/get-valuation" passHref>
                  <div className="text-white font-[700] text-sm lg:text-base xl:text-lg cursor-pointer hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    Get Valuation
                  </div>
                </Link>
                <Link href="/sell" passHref>
                  <div className="text-white font-[700] text-sm lg:text-base xl:text-lg cursor-pointer hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    Sell Now
                  </div>
                </Link>
                <Link href="/bizflip-broker" passHref>
                  <div className="text-white font-[700] text-sm lg:text-base xl:text-lg cursor-pointer hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-300">
                    Bizflip Broker
                  </div>
                </Link>
              </div>

              {/* Right Section - Connect Wallet/Profile & Cart */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted,
                  }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;
                    
                    return (
                      <div className="flex items-center gap-2 sm:gap-4">
                        {!connected && (
                          <button
                            onClick={openConnectModal}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full py-1.5 px-3 sm:py-2 sm:px-4 lg:py-2.5 lg:px-6 text-xs sm:text-sm lg:text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            Connect Wallet
                          </button>
                        )}
                        
                        {connected && (
                          <>
                            {/* Show Sign Message button if auth message exists and not authenticated */}
                            {authMessage && !isAuthenticated && (
                              <button
                                onClick={signAndVerify}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full py-1.5 px-3 sm:py-2 sm:px-4 lg:py-2.5 lg:px-6 text-xs sm:text-sm lg:text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-70"
                              >
                                {loading ? 'Signing...' : 'Sign Message'}
                              </button>
                            )}

                            {/* ETH Balance Display */}
                            <div className="hidden md:flex items-center text-white">
                              <div className="flex items-center mr-2 bg-white/10 rounded-full px-4 py-1.5">
                                <span className="text-sm lg:text-base xl:text-lg font-[700] mr-2 truncate max-w-[120px] lg:max-w-none text-blue-300">
                                  {account.displayBalance ? 
                                    account.displayBalance : 
                                    '0.000001 ETH'}
                                </span>
                              </div>
                            </div>

                            {/* Profile Button */}
                            <div className="relative" ref={profileMenuRef}>
                              <button 
                                onClick={toggleProfileMenu}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 sm:p-2 lg:p-2.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                                aria-label="profile"
                              >
                                {/* This would typically be a user avatar or profile icon */}
                                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-white flex items-center justify-center">
                                  <span className="text-xs lg:text-sm font-black text-purple-600">
                                    {account.displayName ? account.displayName.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                              </button>
                              
                              {/* Profile Menu Dropdown */}
                              {isProfileMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-60 sm:w-64 lg:w-72 bg-gradient-to-b from-[#0c2b4a] to-[#081c32] border border-blue-400/20 rounded-lg shadow-xl z-50 backdrop-blur-sm">
                                  <div className="p-3 lg:p-4 border-b border-blue-400/20">
                                    <div className="text-sm lg:text-base font-[700] text-white truncate">
                                      {account.displayName ? account.displayName : '0x1234...5678'}
                                    </div>
                                    <div className="text-xs lg:text-sm text-blue-300 truncate">
                                      {account.displayBalance ? account.displayBalance : '0.000001 ETH'}
                                    </div>
                                  </div>
                                  
                                  <div className="py-2">
                                    <Link href="/profile">
                                      <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                        <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        Profile
                                      </div>
                                    </Link>
                                    <Link href="/watchlist">
                                      <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                        <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        Watchlist
                                      </div>
                                    </Link>
                                    <Link href="/deals">
                                      <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                        <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        Deals
                                      </div>
                                    </Link>
                                    <Link href="/studio">
                                      <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                        <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        Studio
                                      </div>
                                    </Link>
                                  </div>
                                  
                                  <div className="border-t border-blue-400/20 py-2">
                                    <Link href="/settings">
                                      <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                        <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                        Settings
                                      </div>
                                    </Link>
                                    <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                      <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                      </svg>
                                      Language
                                      <span className="ml-2 text-blue-300">en &gt;</span>
                                    </div>
                                    <div className="flex items-center px-4 py-2 text-sm lg:text-base text-white hover:bg-blue-500/10 cursor-pointer transition-colors duration-200">
                                      <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                      </svg>
                                      Night Mode
                                      <div className="ml-auto">
                                        <div className="w-10 h-5 lg:w-12 lg:h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center">
                                          <div className="w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full ml-auto mr-0.5 shadow-md"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="py-1 border-t border-blue-400/20">
                                    <button 
                                      className="flex items-center w-full px-4 py-2 text-sm lg:text-base text-red-400 hover:bg-red-500/10 transition-colors duration-200" 
                                      onClick={() => {
                                        logout(); // Custom logout function
                                        setIsProfileMenuOpen(false);
                                      }}
                                    >
                                      <svg className="w-5 h-5 mr-3 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                      </svg>
                                      Disconnect
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
                
                {/* Cart Button */}
                <button 
                  onClick={toggleCart} 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 sm:p-2 lg:p-2.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg relative"
                  aria-label="cart"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                  </svg>
                  {/* Cart items indicator */}
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">0</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={toggleDrawer}
                  className="inline-flex items-center p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 justify-center text-white rounded-lg md:hidden hover:bg-white/10 focus:outline-none transition-colors duration-200"
                  aria-label="menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Mobile Drawer */}
        <div className={`fixed inset-0 z-50 ${open ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={toggleDrawer}
          ></div>
          
          {/* Drawer Panel */}
          <div
            className={`fixed right-0 top-0 h-full w-64 sm:w-72 md:w-80 bg-gradient-to-b from-[#0c2b4a] to-[#081c32] shadow-2xl transform transition-transform ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button 
                className="text-white hover:text-blue-300 transition-colors duration-200" 
                onClick={toggleDrawer}
                aria-label="close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Wallet Display */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                
                return (
                  <div className="px-4 mb-6">
                    {!connected ? (
                      <button
                        onClick={openConnectModal}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg text-sm font-bold shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-400/20">
                          <div className="text-sm font-[700] text-white truncate">
                            {account.displayName}
                          </div>
                          <div className="text-xs text-blue-300 mt-1">
                            {account.displayBalance}
                          </div>
                        </div>
                        
                        {/* Sign Message Button for Mobile */}
                        {!isAuthenticated && authMessage && (
                          <button
                            onClick={signAndVerify}
                            disabled={loading}
                            className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg text-sm font-bold shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70"
                          >
                            {loading ? 'Signing...' : 'Sign Message'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
            
            {/* Menu Items */}
            <nav className="px-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/get-valuation" passHref>
                    <div className="flex items-center text-white hover:text-blue-300 hover:bg-white/5 p-3 rounded-lg cursor-pointer transition-colors duration-200" onClick={toggleDrawer}>
                      <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-[700] text-base">Get Valuation</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/sell" passHref>
                    <div className="flex items-center text-white hover:text-blue-300 hover:bg-white/5 p-3 rounded-lg cursor-pointer transition-colors duration-200" onClick={toggleDrawer}>
                      <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      <span className="font-[700] text-base">Sell Now</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/bizflip-broker" passHref>
                    <div className="flex items-center text-white hover:text-blue-300 hover:bg-white/5 p-3 rounded-lg cursor-pointer transition-colors duration-200" onClick={toggleDrawer}>
                      <svg className="w-5 h-5 mr-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      <span className="font-[700] text-base">Bizflip Broker</span>
                    </div>
                  </Link>
                </li>
              </ul>
            </nav>
            
            {/* Bottom links */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-400/20">
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.162 5.65593C21.3985 5.99362 20.589 6.2154 19.76 6.31393C20.6337 5.79136 21.2877 4.96894 21.6 4C20.78 4.48 19.881 4.82 18.944 5C18.3146 4.34151 17.4804 3.89489 16.5709 3.74451C15.6615 3.59413 14.7279 3.74842 13.9153 4.18338C13.1026 4.61834 12.4564 5.30961 12.0771 6.14972C11.6978 6.98983 11.6067 7.93171 11.82 8.829C10.1551 8.74566 8.52832 8.31353 7.04328 7.56067C5.55823 6.80781 4.24812 5.75105 3.19799 4.459C2.82628 5.09745 2.63095 5.82323 2.63199 6.562C2.63199 8.012 3.36999 9.293 4.49199 10.043C3.828 10.0221 3.17862 9.84278 2.59799 9.52V9.572C2.59819 10.5376 2.93236 11.4735 3.54384 12.221C4.15532 12.9684 5.00647 13.4814 5.95299 13.673C5.33661 13.84 4.6903 13.8646 4.06299 13.745C4.30897 14.5762 4.80826 15.3031 5.48706 15.8241C6.16585 16.345 6.9903 16.6338 7.83799 16.65C6.18431 17.9779 4.1469 18.6913 2.04999 18.69C1.6979 18.6898 1.34614 18.6689 0.998993 18.627C3.12648 20.0261 5.6083 20.7622 8.13499 20.76C15.19 20.76 19.057 14.889 19.057 9.82C19.057 9.649 19.053 9.475 19.043 9.306C19.8597 8.71105 20.5622 7.98631 21.099 7.169C20.3564 7.50532 19.5673 7.73371 18.759 7.846L22.162 5.65593Z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
              onClick={toggleCart}
            ></div>
            
            {/* Cart Panel */}
            <div className="fixed right-0 top-0 h-full w-[85%] sm:w-80 md:w-96 lg:w-[420px] bg-gradient-to-b from-[#0c2b4a] to-[#081c32] shadow-2xl overflow-y-auto" ref={cartRef}>
              <div className="flex justify-between items-center p-4 lg:p-5 border-b border-blue-400/20">
                <h2 className="text-white text-base sm:text-lg lg:text-xl font-bold flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                  </svg>
                  Your cart
                </h2>
                <button
                  onClick={toggleCart}
                  className="text-white hover:text-blue-300 transition-colors duration-200"
                  aria-label="close cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-7 lg:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col justify-center items-center p-8 lg:p-10 text-gray-400 h-64 lg:h-72">
                <svg className="w-16 h-16 text-blue-400 opacity-30 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                </svg>
                <p className="text-center text-base lg:text-lg text-blue-100">Your cart is empty</p>
                <p className="text-center text-sm text-blue-200/60 mt-2">Add items to get started.</p>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 bg-gradient-to-r from-[#0c2b4a] to-[#081c32] border-t border-blue-400/20">
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 lg:py-4 rounded-lg font-bold text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Complete purchase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}