import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ChatMessage, sendChatMessage } from '../../services/chatService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hola, soy el asistente de AgroDiversificación. ¿En qué puedo ayudarte con tus cultivos?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim() === '' || isLoading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await sendChatMessage([...messages, userMessage]);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta nuevamente.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card title="Asistente Agrícola">
      <div className="flex flex-col h-[500px]">
        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] p-3 rounded-lg
                    ${message.role === 'user' 
                      ? 'bg-blue-100 text-blue-900 rounded-br-none' 
                      : 'bg-green-100 text-green-900 rounded-bl-none'}
                  `}
                >
                  <div className="flex items-center mb-1">
                    {message.role === 'user' ? (
                      <>
                        <span className="font-medium">Tú</span>
                        <User className="h-4 w-4 ml-1" />
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Asistente</span>
                        <Bot className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || inputValue.trim() === ''} 
            className="rounded-l-none py-3 px-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Ejemplos de preguntas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInputValue('¿Qué cultivo es mejor para un suelo con pH 6.2 y temperatura de 24°C?')}
              className="text-sm text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            >
              ¿Qué cultivo es mejor para un suelo con pH 6.2 y temperatura de 24°C?
            </button>
            <button
              type="button"
              onClick={() => setInputValue('¿Cómo afecta la precipitación anual al cultivo de papaya?')}
              className="text-sm text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            >
              ¿Cómo afecta la precipitación anual al cultivo de papaya?
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;