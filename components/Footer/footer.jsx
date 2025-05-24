import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BsDiscord,
  BsTwitter,
  BsInstagram,
  BsReddit,
  BsYoutube,
} from 'react-icons/bs';
import { FaTiktok } from 'react-icons/fa';
import Image from 'next/image';
import logo from '../../public/images/imgs/logo.png';

const Footer = ({ border }) => {
  const router = useRouter();

  const handleViewCategory = id => {
    router.push('/explore');
  };

  return (
    <div className="w-full box-border bg-gradient-to-b from-[#1868b7] to-[#0d4b89] font-roboto shadow-lg">
      {/* Visual divider at the top */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400"></div>
      
      <div className="max-w-[1200px] w-[90%] mx-auto py-10">
        
        {/* Footer Social Section */}
        <div className="flex items-start border-b border-blue-400 pb-12 md:flex-row flex-col gap-8">
          <div className="md:w-1/2 w-full">
            <div>
              <form
                action="https://forms.zohopublic.com/bizfip/form/EmailSubscription/formperma/jJmYBW8BqrpFC0rrMXBsRuk4VcVjrCoasmaIN3_LG9Q/htmlRecords/submit"
                name="form"
                id="form"
                method="POST"
                acceptCharset="UTF-8"
                encType="multipart/form-data"
              >
                <input type="hidden" name="zf_referrer_name" value="" />
                <input type="hidden" name="zf_redirect_url" value="" />
                <input type="hidden" name="zc_gad" value="" />
                <h2 className="md:text-3xl text-2xl text-white font-extrabold tracking-wide pb-6">
                  <span className="border-b-4 border-blue-400 pb-2">Stay in the loop</span>
                </h2>

                <div className="flex md:flex-row flex-col items-start md:items-center">
                  <div className="relative w-full md:w-auto">
                    <input
                      name="Email"
                      type="text"
                      className="w-full md:w-[320px] outline-none h-[50px] rounded-lg border-2 border-blue-300 py-2 pl-4 pr-10 box-border text-base shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                      placeholder="Enter Email Address"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                  </div>
                  <button className="w-full md:w-[168px] h-[50px] rounded-lg font-bold text-lg bg-blue-500 hover:bg-blue-600 shadow-lg flex items-center justify-center cursor-pointer text-white border-none md:ml-4 mt-4 md:mt-0 transition duration-300 transform hover:scale-105">
                    Sign up
                  </button>
                </div>
                <p className="font-roboto py-5 w-full md:w-[90%] text-blue-100 text-base leading-relaxed">
                  Join our mailing list to stay in the loop with bizflip newest
                  feature releases, new listings and insider tips and tricks.
                </p>
              </form>
            </div>
          </div>
          <div className="md:ml-auto bg-blue-600/30 p-6 rounded-lg shadow-md backdrop-blur-sm w-full md:w-auto">
            <h3 className="text-[22px] text-white font-bold mb-4 border-b-2 border-blue-400 pb-2 inline-block">Join the community</h3>
            <div className="flex gap-5 mt-4 flex-wrap justify-center md:justify-start">
              <Link
                href="https://discord.gg/9v2fmYqbYd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[32px] hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
              >
                <BsDiscord />
              </Link>
              <Link
                href="https://twitter.com/bizflipmarket"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[32px] hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
              >
                <BsTwitter />
              </Link>
              <Link
                href="https://www.instagram.com/bizflip.io/?next=%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[32px] hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
              >
                <BsInstagram />
              </Link>
              <Link
                href="https://www.Reddit.com/r/bizflip/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[32px] hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
              >
                <BsReddit />
              </Link>
              <Link
                href="https://m.youtube.com/channel/UCaDnvGeQQFyIboVxEfIcKfQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[32px] hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
              >
                <BsYoutube />
              </Link>
              <Link
                href="https://www.tiktok.com/@bizflip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-[32px] hover:text-blue-300 transition-colors duration-300 transform hover:scale-110"
              >
                <FaTiktok />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Footer Categories Section */}
        <div className="flex justify-between border-b border-blue-400 py-12 flex-wrap gap-y-8">
          <div className="md:w-[35%] w-full pr-5">
            <div className="flex items-center mb-6">
              <Image src={logo} alt="logo" className="h-[100px] w-[100px] rounded-xl shadow-lg mr-4" />
              <h3 className="text-white font-bold text-2xl">bizflip.io</h3>
            </div>
            <p className="text-blue-100 leading-relaxed">
              The world&apos;s first and best web3 based solution for asset
              acquisition. Join a community of dreamers, innovators and doers.
              From builders to investors, bring your dreams to fruition. Tap &
              swipe on assets available. You never know when you&apos;ll find the
              next hidden gem. Bizflip allows users to list assets in e-commerce,
              brick and mortar, dapps &amp; so much more.
            </p>
          </div>
          
          <div className="md:w-auto w-1/3 sm:w-1/4">
            <h4 className="text-white font-extrabold text-lg md:text-xl mb-4 border-b-2 border-blue-400 pb-2 inline-block">My Account</h4>
            <ul className="list-none pl-0 space-y-3">
              <li className="text-blue-100 cursor-pointer hover:text-white transition-colors duration-200 flex items-center">
                <span className="text-blue-400 mr-2">›</span>
                <span>Profile</span>
              </li>
              <li className="text-blue-100 cursor-pointer hover:text-white transition-colors duration-200 flex items-center">
                <span className="text-blue-400 mr-2">›</span>
                <span>Settings</span>
              </li>
            </ul>
          </div>
          
          <div className="md:w-auto w-1/3 sm:w-1/4">
            <h4 className="text-white font-extrabold text-lg md:text-xl mb-4 border-b-2 border-blue-400 pb-2 inline-block">Resources</h4>
            <ul className="list-none pl-0 space-y-3">
              <li className="text-blue-100 cursor-pointer hover:text-white transition-colors duration-200 flex items-center">
                <span className="text-blue-400 mr-2">›</span>
                <span>Help center</span>
              </li>
              <li className="text-blue-100 cursor-pointer hover:text-white transition-colors duration-200 flex items-center">
                <span className="text-blue-400 mr-2">›</span>
                <span>Blog</span>
              </li>
            </ul>
          </div>
          
          <div className="md:w-auto w-1/3 sm:w-1/4">
            <h4 className="text-white font-extrabold text-lg md:text-xl mb-4 border-b-2 border-blue-400 pb-2 inline-block">Company</h4>
            <ul className="list-none pl-0 space-y-3">
              <li className="text-blue-100 cursor-pointer hover:text-white transition-colors duration-200 flex items-center">
                <span className="text-blue-400 mr-2">›</span>
                <Link href="/about" className="text-blue-100 hover:text-white no-underline transition-colors duration-200">About</Link>
              </li>
              <li className="text-blue-100 cursor-pointer hover:text-white transition-colors duration-200 flex items-center">
                <span className="text-blue-400 mr-2">›</span>
                <span>Careers</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Services Section */}
        <div className="flex items-center justify-between mt-8 md:flex-row flex-col">
          <div>
            <p className="text-blue-100 text-sm md:text-base md:text-left text-center font-medium">
              © 2024 The Smile Guys Inc, All Rights Reserved.
            </p>
          </div>
          <div className="flex md:mt-0 mt-4 space-x-6">
            <Link href="/privacy-policy" passHref className="text-blue-100 hover:text-white text-sm md:text-base font-medium transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" passHref className="text-blue-100 hover:text-white text-sm md:text-base font-medium transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;