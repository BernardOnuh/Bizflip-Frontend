import { createChatBotMessage } from 'react-chatbot-kit';
import { FaRobot } from 'react-icons/fa';

const botName = "BizFlip Bot";

const config = {
  botName: botName,
  initialMessages: [createChatBotMessage(`Hi! I'm ${botName}. How can I help you today?`)],
  customComponents: {
    // Custom icon for the bot
    botAvatar: (props) => <FaRobot {...props} />,
  },
};

export default config;
