import React from 'react';
import Link from 'next/link';
import Footer from '../Footer/footer';

const dummyBrokerList = [
  {
  
    name: 'bizflip',
    specialist: 'E-Commerce asset digital assets, saas, digital businesses',
    address: 'United States',
    desc: 'We now offer our very own representation as well, premier premium service for all our users Representing businesses of all shapes and sizes.',
    id: '1',
    link: '/contactUs',
  },
  {
    name: 'VR Business Brokers',
    price: '$150,000 - $5,000,000',
    specialist: 'Brick & Mortar Assets',
    address: 'United States',
    desc: 'Schedule an appointment with VR Business Broker of Charlotte Today',
    id: '2',
    link: 'https://www.vrbbcharlotte.com',
  },
  {
    name: 'Website Properties',
    price: '$250,000 - $5,000,000',
    specialist: 'E-Commerce, SaaS, Services, Marketplace, Advertising',
    address: 'United States',
    desc: 'Website Properties is the oldest and trusted digital business brokerage in North America, helping owners of digitally native and tech enabled businesses create their successful exit over 20 years.',
    id: '3',
    link: 'https://websiteproperties.com',
  },
];

const BrokerPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FC466B] to-[#3F5EFB] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            PICK A BIZFLIP AFFILIATED BROKER TO GET STARTED
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-lg">
            Take the stress out of selling. Using a broker to help sell your
            asset is a great option for those who are time-poor or simply
            don&apos;t know where to start. A broker will present your asset
            in the best light possible to maximize your sale price.
          </p>
        </div>

        <div className="space-y-6">
          {dummyBrokerList.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row"
            >
              <div className="flex-grow p-6 md:w-2/3">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-600 mb-4">{item.address}</p>
                
                <div className="mb-4">
                  <span className="font-semibold">Specialties: </span>
                  <span className="text-gray-600">{item.specialist}</span>
                </div>
                
                {item.price && (
                  <div className="mb-4">
                    <span className="font-semibold">Price Range: </span>
                    <span className="text-gray-600">{item.price}</span>
                  </div>
                )}
                
                <p className="text-gray-700 italic">
                  {item.desc}
                </p>
              </div>
              
              <div className="flex items-center justify-end p-6 md:w-1/3 bg-gray-50">
                {item.id === '1' ? (
                  <Link 
                    href={item.link} 
                    className="group flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
                  >
                    Learn more
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </Link>
                ) : (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
                  >
                    Learn more
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrokerPage;