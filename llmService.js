const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class LLMService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateResponse(userMessage, context = {}) {
    try {
      // Create a prompt that includes conversation history and current cards
      let conversationContext = '';
      if (context.messages && context.messages.length > 0) {
        conversationContext = '\n\nPrevious conversation:\n' +
          context.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      }

      let cardsContext = '';
      if (context.cards && context.cards.length > 0) {
        cardsContext = '\n\nCurrent cards in workspace:\n' +
          context.cards.map((card, index) =>
            `Card ${index + 1}: "${card.title}" - ${card.content.substring(0, 100)}${card.content.length > 100 ? '...' : ''}`
          ).join('\n');
      }

      const systemPrompt = `You are an friendly and knowledgeable AI assistant to help user to clear their thoughts and organize them.

Current user message: "${userMessage}"${conversationContext}${cardsContext}

Please provide a helpful, concise response that takes into account both the conversation history and the current cards in the workspace.`;

      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback response if API fails
      return `I understand you said: "${userMessage}". Sorry I cannot process your request due to a technical issue.`;
    }
  }

  async generateCardSuggestions(content, existingCards = [], conversationContext = []) {
    try {
      let contextStr = '';
      if (conversationContext.length > 0) {
        contextStr = '\n\nRecent conversation:\n' +
          conversationContext.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n');
      }

      const prompt = `Based on this card content: "${content}"
      
And these existing cards: ${JSON.stringify(existingCards, null, 2)}${contextStr}

Suggest:
1. A good title for this card
2. Any connections or relationships to existing cards
3. Potential categories or tags

Keep suggestions concise and actionable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating card suggestions:', error);
      return 'Unable to generate suggestions at this time.';
    }
  }
}

module.exports = new LLMService();