import React from 'react';

const CustomChatInput = ({ placeholder, ...props }) => {
  console.log('Rendering CustomChatInput with props:', props); // Debugging line
  return (
    <input
      className="react-chatbot-kit-chat-input__input"
      placeholder={placeholder}
      style={{ color: 'black', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
      {...props}
    />
  );
};

export default CustomChatInput;
