import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './botConfig';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import { AiOutlineClose, AiOutlineMessage } from 'react-icons/ai';

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '20px',
          padding:'10px',
          zIndex: 1000,
          background:'#007bff',
          color: '#fff',
          borderRadius: '50%',
          border: '100px',
          cursor: 'pointer',
        }}
      >
        {isOpen ? <AiOutlineClose size={30} /> : <AiOutlineMessage size={30} />}
      </button>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '150px',
            right: '20px',
            zIndex: 999,
            width: '300px',
            height: '400px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
        </div>
      )}
    </div>
  );
};

export default Chat;
