import { useState, useRef, useEffect } from 'react';
import { Send, Maximize2, Minimize2, Sparkles, Plus } from 'lucide-react';
import { Message } from '../../types';
import { getMessages, sendMessage } from '../../services/messageService';

interface ChatInterfaceProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  highlightedMessageId?: string | null;
  onCreateCardFromMessage?: (messageId: string) => void;
}

export function ChatInterface({ isExpanded, onToggleExpand, highlightedMessageId, onCreateCardFromMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const highlightedMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (highlightedMessageId && highlightedMessageRef.current) {
      highlightedMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedMessageId, messages]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const loadedMessages = await getMessages();
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Fallback to initial message if server is not available
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m here to help you organize your index cards. You can ask me to summarize, reorganize, or provide insights about your notes.',
            timestamp: new Date(),
          },
        ]);
      }
    };
    loadMessages();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send user message to server and get response
      const newMessages = await sendMessage('user', input);
      setMessages((prev) => [...prev, ...newMessages]);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
      // Optionally show an error message to the user
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h2 className="font-semibold text-gray-800">LLM Assistant</h2>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title={isExpanded ? 'Minimize chat' : 'Maximize chat'}
        >
          {isExpanded ? (
            <Minimize2 className="w-4 h-4 text-gray-600" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            ref={highlightedMessageId === message.id ? highlightedMessageRef : null}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 relative ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              } ${highlightedMessageId === message.id ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}`}
            >
              {onCreateCardFromMessage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateCardFromMessage(message.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Create card from this message"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            onClick={() => setInput('Please clarify: ')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <Sparkles className="w-3 h-3" />
            Clarify
          </button>
          <button
            onClick={() => setInput('Help me understand: ')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Sparkles className="w-3 h-3" />
            Understand
          </button>
          <button
            onClick={() => setInput('Summarize my cards')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200"
          >
            <Sparkles className="w-3 h-3" />
            Summarize
          </button>
          <button
            onClick={() => setInput('Organize my cards by: ')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Sparkles className="w-3 h-3" />
            Organize
          </button>
        </div>
      </div>
    </div>
  );
}