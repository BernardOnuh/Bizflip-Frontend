import React, { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const CustomWallet = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Handle clicks outside of the menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated');
                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button 
                                        className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-full text-sm font-medium transition-colors" 
                                        onClick={openConnectModal} 
                                        type="button"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }
                            if (chain.unsupported) {
                                return (
                                    <button 
                                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full text-sm font-medium transition-colors" 
                                        onClick={openChainModal} 
                                        type="button"
                                    >
                                        Wrong network
                                    </button>
                                );
                            }
                            return (
                                <div className="relative" ref={menuRef}>
                                    {/* User Profile Button */}
                                    <button 
                                        className="inline-flex items-center text-sm font-medium text-white rounded-full bg-[#1a1c1e] hover:bg-gray-700 p-2 transition-colors"
                                        onClick={toggleMenu} 
                                        type="button"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {/* User Menu Dropdown */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1c1e] border border-gray-700 rounded-lg shadow-lg z-50">
                                            <div className="py-2">
                                                <Link href="/profile">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                        Profile
                                                    </div>
                                                </Link>
                                                <Link href="/watchlist">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Watchlist
                                                    </div>
                                                </Link>
                                                <Link href="/deals">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        Deals
                                                    </div>
                                                </Link>
                                                <Link href="/studio">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                        </svg>
                                                        Studio
                                                    </div>
                                                </Link>
                                            </div>
                                            
                                            <div className="border-t border-gray-700 py-2">
                                                <Link href="/settings">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                        </svg>
                                                        Settings
                                                    </div>
                                                </Link>
                                                <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                    </svg>
                                                    Language
                                                    <span className="ml-2 text-gray-400">en &gt;</span>
                                                </div>
                                                <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                                    </svg>
                                                    Night Mode
                                                    <div className="ml-auto">
                                                        <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center">
                                                            <div className="w-4 h-4 bg-white rounded-full ml-auto mr-0.5"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="border-t border-gray-700 py-2">
                                                <Link href="/learn">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                                            </svg>
                                                        Learn
                                                    </div>
                                                </Link>
                                                <Link href="/help-center">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                        Help center
                                                    </div>
                                                </Link>
                                                <Link href="/support">
                                                    <div className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                        </svg>
                                                        Support
                                                    </div>
                                                </Link>
                                            </div>
                                            
                                            <div className="py-1 border-t border-gray-700">
                                                <button 
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700" 
                                                    onClick={openAccountModal}
                                                >
                                                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                                    </svg>
                                                    Disconnect
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};

export default CustomWallet;