import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { components } from 'react-select';
import ReactSelect from 'react-select';
import Footer from '../Footer/footer';

const QnA = () => {
  const questionRef = useRef(null);
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [answer1, setAnswer1] = useState([]);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [answer3, setAnswer3] = useState('');
  const { address } = useAccount();
  const [animationClass, setAnimationClass] = useState('animate-question-right');
  const [isInputInvalid, setIsInputInvalid] = useState(false);

  const steps = [
    {
      label: 'What type of assets are you interested in?',
      subtitle: 'Select one or more options that match your investment goals'
    },
    {
      label: 'What price range are you looking to acquire at?',
      subtitle: 'Enter your minimum and maximum budget in USD'
    },
    {
      label: 'Do you promise to act in good faith?',
      subtitle: 'We require all users to commit to honest and ethical transactions'
    },
  ];

  const assetTypes = [
    { value: 0, label: 'Blockchain' },
    { value: 1, label: 'Brick & Mortar' },
    { value: 2, label: 'Ecommerce' },
    { value: 3, label: 'Hybrid' },
  ];

  const validateStep = () => {
    if (activeStep === 0 && answer1.length === 0) {
      setIsInputInvalid(true);
      return false;
    }
    if (activeStep === 1 && (!min || !max)) {
      setIsInputInvalid(true);
      return false;
    }
    if (activeStep === 2 && !answer3) {
      setIsInputInvalid(true);
      return false;
    }
    setIsInputInvalid(false);
    return true;
  };

  const handleNext = () => {
    if (!address) {
      // Show connect wallet modal or some indication to the user
      alert('Please connect your wallet');
      return;
    }

    // Validation
    if (!validateStep()) {
      return;
    }

    // Check if the answer is "No" and handle accordingly
    if (activeStep === 2) {
      if (answer3 === 'No') {
        alert('You must agree to act in good faith to proceed.');
        return;
      }
      router.push('/nft-swipe');
      return;
    }

    // Animate transition
    setAnimationClass('animate-question-gone-right');
    setTimeout(() => {
      setActiveStep(prevStep => prevStep + 1);
      setAnimationClass('animate-question-left');
      
      setTimeout(() => {
        setAnimationClass('animate-question-right');
      }, 50);
    }, 400);
  };

  const handleBack = () => {
    setAnimationClass('animate-question-gone-left');
    setTimeout(() => {
      setActiveStep(prevStep => prevStep - 1);
      setAnimationClass('animate-question-right');
      setIsInputInvalid(false);
    }, 400);
  };

  const Option = (props) => (
    <div>
      <components.Option {...props}>
        <label className="flex items-center p-2 cursor-pointer">
          <div className={`w-5 h-5 mr-3 border-2 rounded ${props.isSelected ? 'bg-[#3F5EFB] border-[#3F5EFB]' : 'border-gray-300'} flex items-center justify-center`}>
            {props.isSelected && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
          <span className="text-white text-base">{props.label}</span>
        </label>
      </components.Option>
    </div>
  );

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: isInputInvalid && activeStep === 0 ? '#ef4444' : 'rgba(255, 255, 255, 0.3)',
      borderRadius: '0.75rem',
      padding: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#3F5EFB'
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1F2937',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      padding: '0.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'rgba(63, 94, 251, 0.2)' : 'transparent',
      color: 'white',
      borderRadius: '0.5rem',
      margin: '0.25rem 0',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(63, 94, 251, 0.8)',
      borderRadius: '9999px',
      padding: '0 0.25rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      fontSize: '0.9rem',
      fontWeight: 500,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        borderRadius: '50%',
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.95rem',
    }),
    input: (provided) => ({
      ...provided,
      color: 'white',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.6)',
    }),
  };

  return (
    <div className="absolute w-full h-screen top-0 pt-[75px] box-border">
      <div className="bg-gradient-to-br from-[#fc466b] to-[#3f5efb] min-h-[calc(100vh-80px)] pb-12 relative z-10">
        {/* Card container with glass effect */}
        <div className="w-11/12 max-w-4xl mx-auto pt-8 pb-12">
          {/* Progress bar */}
          <div className="mb-12 px-6">
            <div className="w-full max-w-3xl mx-auto">
              <div className="bg-white/10 h-3 rounded-full relative mb-8">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${index <= activeStep ? 'bg-gradient-to-r from-white/90 to-white/70 text-[#3f5efb]' : 'bg-white/20'}`}
                    >
                      {index < activeStep ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        <span className="text-base font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-white/70 max-w-[80px] text-center hidden md:block ${index === activeStep ? 'font-medium text-white' : ''}`}>
                      {step.subtitle.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content card with glass effect */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-8 mx-auto border border-white/20">
            {/* Main content */}
            <div className="flex flex-col items-center">
              <div className="w-full text-center">
                <div ref={questionRef} className={`${animationClass} min-h-[320px]`}>
                  <h2 className="font-bold text-white text-2xl md:text-3xl mb-3">
                    {steps[activeStep].label}
                  </h2>
                  <p className="text-white/80 text-base md:text-lg mb-8">
                    {steps[activeStep].subtitle}
                  </p>
                  
                  <div className="w-full max-w-md mx-auto">
                    {activeStep === 0 ? (
                      <div className="min-w-[300px] w-full">
                        <ReactSelect
                          options={assetTypes}
                          isMulti
                          closeMenuOnSelect={false}
                          hideSelectedOptions={false}
                          components={{ Option }}
                          onChange={(e) => {
                            setAnswer1(e);
                            setIsInputInvalid(false);
                          }}
                          allowSelectAll={true}
                          value={answer1}
                          styles={customSelectStyles}
                          placeholder="Select asset types..."
                        />
                        {isInputInvalid && (
                          <p className="text-red-300 text-sm mt-2 text-left">
                            Please select at least one asset type
                          </p>
                        )}
                      </div>
                    ) : activeStep === 1 ? (
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80">$</div>
                            <input
                              name="minValue"
                              type="text"
                              className={`w-full h-[56px] rounded-xl border ${isInputInvalid && !min ? 'border-red-500' : 'border-white/30'} px-10 py-3 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg`}
                              placeholder="Min value"
                              value={min}
                              onChange={(e) => {
                                setMin(e.target.value);
                                if (e.target.value && max) setIsInputInvalid(false);
                              }}
                            />
                          </div>
                          {isInputInvalid && !min && <p className="text-red-300 text-sm mt-1 text-left">Required</p>}
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80">$</div>
                            <input
                              name="maxValue"
                              type="text"
                              className={`w-full h-[56px] rounded-xl border ${isInputInvalid && !max ? 'border-red-500' : 'border-white/30'} px-10 py-3 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg`}
                              placeholder="Max value"
                              value={max}
                              onChange={(e) => {
                                setMax(e.target.value);
                                if (min && e.target.value) setIsInputInvalid(false);
                              }}
                            />
                          </div>
                          {isInputInvalid && !max && <p className="text-red-300 text-sm mt-1 text-left">Required</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left w-full">
                        <div 
                          className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${answer3 === 'Yes' ? 'bg-white/20 border-2 border-white' : 'bg-white/10 border border-white/30'} ${isInputInvalid ? 'border-red-400' : ''}`}
                          onClick={() => {
                            setAnswer3('Yes');
                            setIsInputInvalid(false);
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${answer3 === 'Yes' ? 'border-white' : 'border-white/50'}`}>
                            {answer3 === 'Yes' && <div className="w-3 h-3 rounded-full bg-white"></div>}
                          </div>
                          <div>
                            <span className="text-white font-medium">Yes</span>
                            <p className="text-white/70 text-sm mt-1">I promise to act in good faith</p>
                          </div>
                        </div>
                        <div 
                          className={`flex items-center p-4 rounded-xl cursor-pointer transition-all ${answer3 === 'No' ? 'bg-white/20 border-2 border-white' : 'bg-white/10 border border-white/30'} ${isInputInvalid ? 'border-red-400' : ''}`}
                          onClick={() => {
                            setAnswer3('No');
                            setIsInputInvalid(false);
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${answer3 === 'No' ? 'border-white' : 'border-white/50'}`}>
                            {answer3 === 'No' && <div className="w-3 h-3 rounded-full bg-white"></div>}
                          </div>
                          <div>
                            <span className="text-white font-medium">No</span>
                            <p className="text-white/70 text-sm mt-1">I cannot make this promise</p>
                          </div>
                        </div>
                        {isInputInvalid && (
                          <p className="text-red-300 text-sm mt-1">Please make a selection</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-center items-center gap-4 mt-10">
                {activeStep !== 0 && (
                  <button
                    onClick={handleBack}
                    className="w-[168px] h-[50px] rounded-xl font-semibold text-base flex items-center justify-center cursor-pointer border border-white/30 bg-white/10 text-white hover:bg-white/20 transition duration-300 shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="w-[168px] h-[50px] rounded-xl font-semibold text-base flex items-center justify-center cursor-pointer bg-white text-[#3f5efb] hover:bg-opacity-90 transition duration-300 shadow-lg hover:shadow-xl"
                >
                  {activeStep === 2 ? 'Submit' : (
                    <>
                      Next
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Tailwind keyframes for animations */}
      <style jsx global>{`
        @keyframes question-left {
          from { transform: translateX(-80px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes question-right {
          from { transform: translateX(80px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes question-gone-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(80px); opacity: 0; }
        }
        
        @keyframes question-gone-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-80px); opacity: 0; }
        }
        
        .animate-question-left {
          animation: question-left 0.4s forwards;
        }
        
        .animate-question-right {
          animation: question-right 0.4s forwards;
        }
        
        .animate-question-gone-right {
          animation: question-gone-right 0.4s forwards;
        }
        
        .animate-question-gone-left {
          animation: question-gone-left 0.4s forwards;
        }
      `}</style>
    </div>
  );
};

export default QnA;