import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, X, Bot, Loader2, RefreshCcw } from 'lucide-react';
import { getProductRecommendations, testGroqApiConnection } from '@/services/chatbot-service';
import { SelectedPart } from '@/pages/PcBuilderPage';
import ReactMarkdown from 'react-markdown';

interface PcBuilderChatbotProps {
  selectedParts: {[key: string]: SelectedPart};
}

interface Message {
  isUser: boolean;
  content: string;
  timestamp: Date;
}

const PcBuilderChatbot = ({ selectedParts }: PcBuilderChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      isUser: false,
      content: "Hi there! I'm your NeuraRig AI assistant. I can help you choose the right components for your PC build. What kind of PC are you looking to build?",
      timestamp: new Date(),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiTested, setApiTested] = useState(false);
  const [apiWorking, setApiWorking] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the messages on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Test the API connection on first open
  useEffect(() => {
    if (isOpen && !apiTested) {
      testApiConnection();
    }
  }, [isOpen, apiTested]);

  const testApiConnection = async () => {
    try {
      setApiTested(true);
      setIsLoading(true);
      
      // Add a testing message
      setMessages(prev => [
        ...prev, 
        {
          isUser: false,
          content: "Testing connection to recommendation service...",
          timestamp: new Date(),
        }
      ]);
      
      // Test the connection
      await testGroqApiConnection();
      
      // Update status and add success message
      setApiWorking(true);
      setMessages(prev => [
        ...prev, 
        {
          isUser: false,
          content: "Connected successfully to recommendation service! How can I help you today?",
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Error testing API connection:', error);
      
      // Update status and add error message
      setApiWorking(false);
      setMessages(prev => [
        ...prev, 
        {
          isUser: false,
          content: "I'm having trouble connecting to the recommendation service. Some features may be limited. You can still ask questions and I'll do my best to help.",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userInput.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      isUser: true,
      content: userInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Get response from chatbot service
      const response = await getProductRecommendations(userInput, selectedParts);
      
      // Add assistant message
      const assistantMessage: Message = {
        isUser: false,
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // If we got a successful response, mark the API as working
      setApiWorking(true);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Add error message
      const errorMessage: Message = {
        isUser: false,
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Mark the API as not working
      setApiWorking(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-neura-600 hover:bg-neura-700"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}

        {/* Chat window */}
        {isOpen && (
          <Card className="w-80 md:w-96 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-neura-600" />
                <CardTitle className="text-base">Recommendation Assistant</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                {!apiWorking && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={testApiConnection}
                    className="h-8 w-8 text-yellow-500 hover:text-yellow-600"
                    disabled={isLoading}
                    title="Retry connection"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-2">
              <div className="h-80 overflow-y-auto space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-neura-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      <div
                        className={`text-xs opacity-70 mt-1 text-right ${
                          message.isUser ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  placeholder="Ask about component recommendations..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || userInput.trim() === ''} 
                  size="icon"
                  className="bg-neura-600 hover:bg-neura-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
};

export default PcBuilderChatbot; 