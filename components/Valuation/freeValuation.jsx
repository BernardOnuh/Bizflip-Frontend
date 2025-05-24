import React, { useState, useRef, useMemo, useEffect } from 'react';
import { io } from 'socket.io-client';

const FreeValuation = () => {
  const socket = useMemo(
    () =>
      io(process.env.NEXT_PUBLIC_SERVER, {
        transports: ['websocket'],
      }),
    []
  );

  const startChatOptions = useMemo(() => [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ]);

  const [botStartTime, setBotTime] = useState(new Date());
  const [chatStarted, setChatStarted] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [textMessage, setTextMessage] = useState('');
  const [questionId, setQuestionId] = useState(0);
  const [isInputDisabled, setInputDisabled] = useState(true);
  const inputFile = useRef(null);
  const lastBubbleRef = useRef(null);
  const userInputFieldRef = useRef(null);

  // Custom formatDate function to replace the imported one
  const formatDateCustom = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const onButtonClick = () => {
    inputFile.current.click();
  };

  const formatQuestionMessage = (data, prevMessages) => {
    switch (data.type) {
      case 'text':
        setOptions([]);
        setInputDisabled(false);
        break;
      case 'option':
        setInputDisabled(true);
        setOptions(data.options);
        break;
      case 'failed':
        let lastMsg = prevMessages.findLast((msg) => msg.from === 'bot');
        return lastMsg
          ? [
              {
                from: 'bot',
                questionId: data.questionId,
                message: data.message,
                createdAt: new Date(),
              },
              { ...lastMsg, createdAt: new Date() },
            ]
          : {
              from: 'bot',
              questionId: data.questionId,
              message: data.message,
              createdAt: new Date(),
            };
      case 'start-valuation':
        let email;
        if (email) {
          socket.emit('initValuationProcess', { email });
          setInputDisabled(true);
          setOptions([]);
          setChatEnded(true);
          return {
            from: 'bot',
            questionId: data.questionId,
            message: data.message,
            createdAt: new Date(),
          };
        } else {
          setOptions([]);
          setInputDisabled(false);
          setQuestionId(998);
          return [
            {
              from: 'bot',
              questionId: data.questionId,
              message: data.message,
              createdAt: new Date(),
            },
            {
              from: 'bot',
              questionId: 998,
              message:
                'Your valuation is ready...!! Please enter your email address to complete your valuation.',
              createdAt: new Date(),
            },
          ];
        }
      case 'end':
        setInputDisabled(true);
        setOptions([]);
        setChatEnded(true);
    }
    setQuestionId(data.questionId);
    return {
      from: 'bot',
      questionId: data.questionId,
      message: data.message,
      createdAt: new Date(),
    };
  };

  const handleStartChat = (option) => {
    setChatStarted(true);
    if (option.value === 'yes') {
      setMessages((prev) =>
        [].concat(prev, {
          from: 'user',
          questionId: 0,
          value: option.value,
          message: option.label,
          createdAt: new Date(),
        })
      );
      socket.emit('joinValuation', {}, (data) => {
        setMessages((prev) => [].concat(prev, formatQuestionMessage(data)));
      });
    } else {
      setMessages((prev) =>
        [].concat(
          prev,
          {
            from: 'user',
            questionId: 0,
            index: 0,
            value: option.value,
            message: option.label,
            createdAt: new Date(),
          },
          {
            from: 'bot',
            questionId: 0,
            index: 0,
            value: 'end',
            message:
              'No problems. Feel free to come back at another time. Take care.',
            createdAt: new Date(),
          }
        )
      );
    }
  };

  useEffect(() => {
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    // Focus on the last message and input field
    if (lastBubbleRef.current) {
      lastBubbleRef.current.blur();
      lastBubbleRef.current.focus({
        focusVisible: true,
      });
    }
    
    if (userInputFieldRef.current) {
      userInputFieldRef.current.focus({
        focusVisible: true,
      });
    }
  }, [options, messages]);

  const userFeedback = (value) => {
    setTextMessage('');
    value = value ?? '';
    if (questionId === 998) {
      setMessages((prev) => {
        return [].concat(prev, {
          from: 'user',
          questionId,
          message: value,
          createdAt: new Date(),
        });
      });
      if (
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i.test(
          value
        )
      )
        socket.emit('initValuationProcess', { email: value }, () => {
          setInputDisabled(true);
          setOptions([]);
          setChatEnded(true);
        });
      else
        setMessages((prev) =>
          [].concat(prev, {
            from: 'bot',
            questionId,
            message:
              "Please enter a valid email address. Let's try that again...",
            createdAt: new Date(),
          })
        );
    } else {
      socket.emit('answer', { value, questionId }, (data) => {
        if (data?.type !== 'failed')
          setAnswers((prev) => [...prev, { questionId, value }]);
        setMessages((prev) =>
          [].concat(
            prev,
            {
              from: 'user',
              questionId,
              message: value,
              createdAt: new Date(),
            },
            formatQuestionMessage(data, prev)
          )
        );
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      userFeedback(e.target.value);
    }
  };

  const onResetChatButtonClick = () => {
    socket.emit('endValuation', {}, (data) => {
      if (data.done) {
        setBotTime(new Date());
        setMessages([]);
        setAnswers([]);
        setOptions([]);
        setChatStarted(false);
      }
    });
  };

  useEffect(() => {
    socket.on('valuationMessage', (data) => {
      setMessages((prev) =>
        [].concat(
          prev,
          data.messages?.map?.((msg) => ({
            from: 'bot',
            questionId: null,
            message: msg.message,
            createdAt: new Date(),
          })) || []
        )
      );
      setQuestionId(null);
      setOptions([]);
    });
    return () => {
      socket.off('valuationMessage');
    };
  }, []);

  return (
    <div className="rounded-b-lg bg-white shadow overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Get a FREE Online Asset Valuation</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onResetChatButtonClick}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Reset conversation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="text-gray-500 hover:text-gray-700 transition-colors" title="Close conversation">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-gray-100 h-80 overflow-y-auto p-4">
        <ul className="space-y-4">
          {/* Initial bot message */}
          <li className="flex flex-col">
            <span className="text-xs text-gray-500">{formatDateCustom(botStartTime)}</span>
            <div className="flex items-start mt-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                <span className="text-white text-xs font-bold">BF</span>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
                <p className="text-gray-800">
                  Welcome. To provide an accurate valuation of your asset we need
                  to ask you some questions about your asset? Are you ready?
                </p>
              </div>
            </div>
            {!chatStarted && (
              <div className="flex flex-wrap gap-2 mt-3 ml-10">
                {startChatOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStartChat(option)}
                    className="px-4 py-2 border border-blue-600 rounded-full text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </li>

          {/* Chat messages */}
          {messages.map((message, idx) => (
            <li key={idx} className={`flex flex-col ${message.from === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500">
                {formatDateCustom(message.createdAt)}
              </span>
              <div className="flex items-start mt-1">
                {message.from === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">BF</span>
                  </div>
                )}
                <div 
                  className={`rounded-lg p-3 shadow-sm max-w-[80%] ${
                    message.from === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <p>{message.message}</p>
                </div>
              </div>
            </li>
          ))}

          {/* Options for the user */}
          {options.length > 0 && (
            <li className="ml-10">
              <div className="flex flex-wrap gap-2 mt-2">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => userFeedback(option.value)}
                    className="px-4 py-2 border border-blue-600 rounded-full text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </li>
          )}
          <div ref={lastBubbleRef} id="last-bubble" tabIndex={-1}></div>
        </ul>
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex items-center">
        <input
          id="user-input-field"
          ref={userInputFieldRef}
          type="text"
          disabled={isInputDisabled}
          className={`flex-1 px-4 py-2 border ${isInputDisabled ? 'bg-gray-100 text-gray-500' : 'bg-white'} border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          placeholder={isInputDisabled ? "Please select an option..." : "Type your message..."}
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          id="file"
          ref={inputFile}
          className="hidden"
        />
        <button
          onClick={onButtonClick}
          className="ml-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Add attachment"
          disabled={isInputDisabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FreeValuation;