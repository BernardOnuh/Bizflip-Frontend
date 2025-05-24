import axios from 'axios';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleMessage = async (message) => {
    try {
      const response = await axios.post('/api/chat', { message });
      const botMessage = this.createChatBotMessage(response.data);
      this.setState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }));
    } catch (error) {
      console.error('Error fetching chat response:', error);
    }
  };
}

export default ActionProvider;
