import React, { useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../Footer/footer';
import FreeValuation from './freeValuation.jsx';

const ValuationContext = createContext();

const valuationList = [
  {
    id: '1',
    img: 'https://cdn-icons-png.flaticon.com/128/546/546310.png',
    title: 'Instant Results',
    data: 'Get immediate insights about your asset value based on current market conditions.',
  },
  {
    id: '2',
    img: 'https://cdn-icons-png.flaticon.com/128/5435/5435272.png',
    title: 'Expert Analysis',
    data: 'Our valuation considers thousands of similar assets and real market transactions.',
  },
  {
    id: '3',
    img: 'https://cdn-icons-png.flaticon.com/128/709/709510.png',
    title: 'Selling Guidance',
    data: 'Learn how to maximize your selling potential with our market recommendations.',
  },
];

const faqs = [
  {
    id: '1',
    question: 'Do I have to pay for this evaluation?',
    answer:
      'Our evaluation tool is free to use, you can use the tool as many times as you like. If you`d like a fee based custom detailed evaluation, you can reach out to <a href="mailto:support@bizflip.io" class="text-purple-600 hover:underline">support@bizflip.io</a>',
  },
  {
    id: '2',
    question: 'Is the bizflip valuation accurate?',
    answer:
      'Yes. Bizflip has more historical sales data than anyone else. If the information you provide is accurate, your bizflip valuation will be a good indicator of your assets monetary value.',
  },
  {
    id: '3',
    question: 'How do we come up with the valuation?',
    answer:
      'Bizflip uses your inputs and compares data to 1000 of similar assets that have sold publicity. We look at modeling, category, age, and many other factors. We will also consider how many buyers are interested in assets like yours along with proprietary processes to provide you with the best opinion of value of your asset.',
  },
  {
    id: '4',
    question: 'How do I sell my asset?',
    answer:
      'If you wish to list your asset for sale or chat with us about your asset, you can either start selling here or send a note to our team at <a href="mailto:support@bizflip.io" class="text-purple-600 hover:underline">support@bizflip.io</a>. We will be happy to provide some additional guidance.',
  },
];

const ValuationProvider = ({ children }) => {
  const [sellUrl, setSellUrl] = useState('');
  const [activeTab, setActiveTab] = useState('free-valuation');

  return (
    <ValuationContext.Provider value={{ sellUrl, setSellUrl, activeTab, setActiveTab }}>
      {children}
    </ValuationContext.Provider>
  );
};

const ValuationPage = () => {
  const router = useRouter();
  const { sellUrl, setSellUrl, activeTab, setActiveTab } = useContext(ValuationContext);

  const onSubmit = (e) => {
    e.preventDefault();
    router.push('sell/generic');
  };

  return (
    <div className="relative w-full min-h-screen pt-[70px]">
      <div className="bg-gradient-to-br from-[#fc466b] to-[#3f5efb] min-h-[calc(100vh-70px)] pb-12 relative z-10">
        <div className="max-w-6xl mx-auto w-11/12 py-10">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              HOW MUCH IS YOUR ASSET WORTH?
            </h1>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Free evaluation.</h2>
                <p className="text-white/90 text-lg">
                  BizFlip makes it simple and effective to sell your asset.
                  Flexibility, choice and access to the world's largest
                  network of online asset buyers.
                </p>
              </div>
              
              {/* Tabs */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 md:gap-0 border-b border-white/20">
                  {[
                    { label: 'Free Valuation', value: 'free-valuation' },
                    { label: 'Sell Directly', value: 'sell-directly' },
                    { label: 'Sell with a Broker', value: 'sell-with-a-broker' },
                  ].map((tab, i) => (
                    <button
                      key={`tab-${i}`}
                      className={`px-4 py-3 font-semibold text-sm rounded-t-lg transition-all duration-200 
                      ${activeTab === tab.value 
                        ? 'bg-white text-[#3f5efb] -mb-px' 
                        : 'bg-transparent text-white hover:bg-white/10'}`}
                      onClick={() => setActiveTab(tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                <div className="bg-white rounded-b-lg shadow-md p-6">
                  {activeTab === 'sell-directly' ? (
                    <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="url"
                          name="url"
                          placeholder="e.g. mywebsite.com"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3f5efb]"
                          value={sellUrl}
                          onChange={(e) => setSellUrl(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Use Play Store or App Store URL for mobile apps.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={!sellUrl}
                        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                          sellUrl 
                            ? 'bg-gradient-to-r from-[#3f5efb] to-[#fc466b] hover:shadow-lg transform hover:-translate-y-1' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Continue →
                      </button>
                    </form>
                  ) : activeTab === 'free-valuation' ? (
                    <FreeValuation />
                  ) : (
                    <div className="py-16 text-center">
                      <div className="text-xl text-gray-600 font-semibold">Coming Soon</div>
                      <p className="mt-2 text-gray-500">We're working on this feature. Check back later!</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Features */}
              <div className="flex flex-wrap gap-6 justify-center mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Lowest fees in the market</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Sell in under 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">Free Escrow service</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Valuation Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto my-16">
        {valuationList.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-6 shadow-lg transform transition hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-[#fc466b] to-[#3f5efb] rounded-xl p-3 mb-4 relative">
              <Image 
                src={item.img} 
                alt={item.title} 
                fill 
                className="object-contain filter invert p-3"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.data}</p>
          </div>
        ))}
      </div>
          
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl mx-auto mb-16 hidden">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="inline-block px-4 py-1 bg-gray-200 rounded-full text-sm font-semibold text-gray-700 mb-3">
                  package II
                </div>
                <p className="text-gray-700">
                  Get extensive custom valuation with deep market research on what similar assets like yours have sold for, included is a broker's opinion of value tailored for your specific assets.
                </p>
              </div>
              <Link href="/contactUs" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3f5efb] to-[#fc466b] text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all">
                Contact Us
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{faq.question}</h3>
                    <div className="text-gray-600 prose prose-sm" dangerouslySetInnerHTML={{ __html: faq.answer }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

const Valuation = () => (
  <ValuationProvider>
    <ValuationPage />
  </ValuationProvider>
);

export default Valuation;