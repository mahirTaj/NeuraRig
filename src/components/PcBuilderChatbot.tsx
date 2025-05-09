import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, X, Bot, Loader2, RefreshCcw, Plus } from 'lucide-react';
import { getProductRecommendations, testGroqApiConnection } from '@/services/chatbot-service';
import { SelectedPart } from '@/pages/PcBuilderPage';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { getProductById } from '@/services/data-service';
import { Product } from '@/types';

interface PcBuilderChatbotProps {
  selectedParts: {[key: string]: SelectedPart};
  onSelectPart: (category: string, product: Product) => void;
}

interface Message {
  isUser: boolean;
  content: string;
  timestamp: Date;
}

const PcBuilderChatbot = ({ selectedParts, onSelectPart }: PcBuilderChatbotProps) => {
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
  
  // State to track extracted product IDs from recommendations
  const [extractedProducts, setExtractedProducts] = useState<{
    id: string;
    category: string;
    name: string;
  }[]>([]);

  // Track products we're currently loading
  const [loadingProducts, setLoadingProducts] = useState<{[id: string]: boolean}>({});

  // Extract product IDs from a chat message
  const extractProductIds = (content: string) => {
    // Various patterns to detect product IDs
    const patterns = [
      /ID:\s*([a-zA-Z0-9]+)/ig,                      // Standard format: ID: 123abc...
      /Product ID[:\s]+([a-zA-Z0-9]+)/ig,            // Alt format: Product ID: 123abc...
      /(?:^|\s)([a-f0-9]{24})(?:\s|$)/ig,            // Raw MongoDB ObjectId format
      /\(ID:?\s*([a-zA-Z0-9]+)\)/ig,                 // Parenthesized format: (ID: 123abc...)
      /ID\s+([a-zA-Z0-9]{24})/ig                     // Space separator: ID 123abc...
    ];
    
    // Find all potential product IDs
    let allMatches: string[] = [];
    patterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].length > 5) { // Basic validation for ID length
          allMatches.push(match[1]);
        }
      });
    });
    
    // Remove duplicates
    allMatches = [...new Set(allMatches)];
    
    // Category detection based on content sections
    const categoryPatterns = [
      { regex: /\b(?:cpu|processor)\b/i, category: 'cpu' },
      { regex: /\b(?:gpu|graphics(?:\s+card)?)\b/i, category: 'gpu' },
      { regex: /\b(?:motherboard|mobo)\b/i, category: 'motherboard' },
      { regex: /\b(?:ram|memory)\b/i, category: 'ram' },
      { regex: /\b(?:storage|ssd|hdd|drive)\b/i, category: 'storage' },
      { regex: /\b(?:power\s+supply|psu)\b/i, category: 'psu' },
      { regex: /\b(?:case|chassis|casing)\b/i, category: 'case' },
      { regex: /\b(?:cooling|cooler|fan)\b/i, category: 'cooling' }
    ];
    
    // Split into paragraphs to better understand context
    const paragraphs = content.split(/\n\s*\n/);
    const products: {id: string; category: string; name: string}[] = [];
    
    // Process each product ID found
    allMatches.forEach(id => {
      // Find the paragraph containing this ID
      const paragraphWithId = paragraphs.find(p => p.includes(id));
      if (!paragraphWithId) return;
      
      // Determine category from paragraph
      let category = '';
      for (const pattern of categoryPatterns) {
        if (pattern.regex.test(paragraphWithId)) {
          category = pattern.category;
          break;
        }
      }
      
      // If we couldn't find a category from the paragraph,
      // check surrounding paragraphs for category headers
      if (!category) {
        const idIndex = paragraphs.findIndex(p => p.includes(id));
        if (idIndex > 0) {
          // Check previous paragraph for category
          for (const pattern of categoryPatterns) {
            if (pattern.regex.test(paragraphs[idIndex - 1])) {
              category = pattern.category;
              break;
            }
          }
        }
      }
      
      // Extract name from the paragraph
      let name = 'Product';
      
      // Try to find product name patterns
      const namePatterns = [
        /Name:\s*([^,\n]+)/i,           // Standard format: Name: Product Name
        /(\w[\w\s-]+)\s+\(ID/i,         // Name followed by ID in parentheses
        /recommend(?:ing)?\s+the\s+([^,\n]+)/i, // "I recommend the Product Name"
        /suggest(?:ing)?\s+the\s+([^,\n]+)/i    // "I suggest the Product Name"
      ];
      
      for (const pattern of namePatterns) {
        const match = pattern.exec(paragraphWithId);
        if (match && match[1]) {
          name = match[1].trim();
          break;
        }
      }
      
      // If we don't have a category but have found a product name,
      // try to infer category from the name
      if (!category && name !== 'Product') {
        const nameLower = name.toLowerCase();
        for (const pattern of categoryPatterns) {
          if (pattern.regex.test(nameLower)) {
            category = pattern.category;
            break;
          }
        }
      }
      
      // Only add products that have both a valid ID and category
      if (category && id.length > 5) {
        products.push({
          id,
          category,
          name
        });
      }
    });
    
    // Ensure we don't add duplicate products
    return products.filter((product, index, self) => 
      index === self.findIndex((p) => p.id === product.id)
    );
  };

  // Add a product to the build by ID
  const addProductToBuild = async (productId: string, category: string) => {
    try {
      // Mark this product as loading
      setLoadingProducts(prev => ({ ...prev, [productId]: true }));
      
      // Fetch the product details
      const product = await getProductById(productId);
      
      if (product) {
        // Add it to the build
        onSelectPart(category, product);
        
        // Add confirmation message
        setMessages(prev => [...prev, {
          isUser: false,
          content: `I've added the ${product.name} to your build as your ${category.toUpperCase()}.`,
          timestamp: new Date()
        }]);
      } else {
        console.error('Product not found:', productId);
        setMessages(prev => [...prev, {
          isUser: false,
          content: `Sorry, I couldn't add that product to your build. It might be out of stock or unavailable.`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error adding product to build:', error);
      setMessages(prev => [...prev, {
        isUser: false,
        content: `There was an error adding the product to your build. Please try again or add it manually.`,
        timestamp: new Date()
      }]);
    } finally {
      // Done loading
      setLoadingProducts(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Process the assistant's response to extract products
  const processResponse = (content: string) => {
    const products = extractProductIds(content);
    setExtractedProducts(products);
    console.log('Extracted products:', products);
    return content;
  };

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
      
      // Add a timeout for the test
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        await testGroqApiConnection();
        clearTimeout(timeoutId);
        
        // Update status and add success message
        setApiWorking(true);
        setMessages(prev => [
          ...prev, 
          {
            isUser: false,
            content: "Connected successfully to recommendation service! I can now suggest components from our inventory. How can I help you today?",
            timestamp: new Date(),
          }
        ]);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Error testing API connection:', error);
      
      // Update status and add error message
      setApiWorking(false);
      setMessages(prev => [
        ...prev, 
        {
          isUser: false,
          content: "I'm having trouble connecting to our recommendation service, but I can still help you choose from our inventory. What type of PC are you looking to build?",
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
    
    // Clear previous product recommendations
    setExtractedProducts([]);
    
    try {
      // Add a timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      
      try {
        // Get response from chatbot service with selected parts context
        const response = await getProductRecommendations(userInput, selectedParts);
        clearTimeout(timeoutId);
        
        // Process the response to extract product IDs
        const processedResponse = processResponse(response);
        
        // Add assistant message
        const assistantMessage: Message = {
          isUser: false,
          content: processedResponse,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // If we got a successful response, mark the API as working
        setApiWorking(true);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Add fallback message
      const errorMessage: Message = {
        isUser: false,
        content: 'I could not connect to our recommendation service, but I can still help with basic information. Could you try a more specific question about components you\'re interested in?',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Only mark the API as not working if it's a connection error
      if (error.name === 'AbortError' || 
          (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.message.includes('timeout')))) {
        setApiWorking(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Custom renderer for the chat message content to add "Add to Build" buttons
  const renderChatMessage = (content: string) => {
    // First render the markdown
    const markdownContent = <ReactMarkdown>{content}</ReactMarkdown>;
    
    // If no products found, just return the markdown
    if (extractedProducts.length === 0) {
      return markdownContent;
    }
    
    // Create a map of categories and their products
    const productsByCategory: Record<string, Array<{id: string, name: string}>> = {};
    extractedProducts.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = [];
      }
      productsByCategory[product.category].push({
        id: product.id,
        name: product.name
      });
    });
    
    return (
      <div>
        {markdownContent}
        
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-sm font-semibold mb-2">Quick add to your build:</p>
          
          {Object.entries(productsByCategory).map(([category, products]) => (
            <div key={category} className="mb-2">
              <p className="text-xs text-gray-500 uppercase mb-1">{category}:</p>
              <div className="flex flex-wrap gap-2">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    size="sm"
                    variant="outline"
                    className="flex items-center text-xs"
                    onClick={() => addProductToBuild(product.id, category)}
                    disabled={loadingProducts[product.id]}
                  >
                    {loadingProducts[product.id] ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="mr-1 h-3 w-3" />
                    )}
                    {product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
                        {message.isUser ? (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        ) : (
                          renderChatMessage(message.content)
                        )}
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