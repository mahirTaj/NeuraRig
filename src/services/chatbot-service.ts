// Service for interacting with GROQ API for product recommendations
import axios from 'axios';

// Define the interface for chat messages
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Define the interface for GROQ API response
interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// API key for GROQ
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Create an axios instance with default settings
const groqAxios = axios.create({
  baseURL: GROQ_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Accept': 'application/json',
  },
  timeout: 30000 // 30 second timeout
});

/**
 * Fallback responses for when the API is not available
 * These are basic recommendations based on common PC builds
 */
const fallbackResponses: Record<string, string> = {
  gaming: `For gaming PCs, I recommend:
  
  - CPU: AMD Ryzen 7 5800X or Intel Core i7-12700K
  - GPU: NVIDIA RTX 3080 or AMD Radeon RX 6800 XT
  - RAM: 16GB or 32GB DDR4-3600 MHz (2x8GB or 2x16GB)
  - Storage: 1TB NVMe SSD + 2TB HDD for game library
  
  This setup will handle most modern games at 1440p or 4K with high frame rates.`,
  
  budget: `For a budget PC build, consider:
  
  - CPU: AMD Ryzen 5 5600G or Intel Core i5-12400
  - GPU: NVIDIA GTX 1660 Super or AMD RX 6600
  - RAM: 16GB DDR4-3200 MHz (2x8GB)
  - Storage: 500GB NVMe SSD
  
  This setup provides good performance for 1080p gaming and everyday tasks while staying affordable.`,
  
  workstation: `For a workstation/content creation PC, I suggest:
  
  - CPU: AMD Ryzen 9 5950X or Intel Core i9-12900K
  - GPU: NVIDIA RTX 3090 or AMD Radeon Pro W6800
  - RAM: 64GB DDR4-3600 MHz (4x16GB)
  - Storage: 2TB NVMe SSD + 4TB HDD for project files
  
  This configuration will handle demanding workloads like video editing, 3D rendering, and software development.`,
  
  streaming: `For a streaming/content creation PC, I recommend:
  
  - CPU: AMD Ryzen 7 5800X3D or Intel Core i7-12700K
  - GPU: NVIDIA RTX 3070 Ti or AMD RX 6800
  - RAM: 32GB DDR4-3600 MHz (2x16GB)
  - Storage: 1TB NVMe SSD + 2TB HDD for recordings
  
  This setup will handle gaming while simultaneously encoding your stream.`,
  
  office: `For an office/productivity PC, consider:
  
  - CPU: AMD Ryzen 5 5600G or Intel Core i5-12400
  - GPU: Integrated graphics or NVIDIA GTX 1650
  - RAM: 16GB DDR4-3200 MHz (2x8GB)
  - Storage: 500GB NVMe SSD
  
  This configuration is perfect for web browsing, office applications, and light multitasking.`,
  
  default: `I can recommend PC components based on your needs. What will you be using your PC for? Gaming, content creation, office work, or something else? 
  
  Also, do you have a specific budget in mind?`
};

/**
 * Get a fallback response based on keywords in the user query
 * @param query The user's query
 * @returns A fallback recommendation
 */
const getFallbackRecommendation = (query: string): string => {
  query = query.toLowerCase();
  
  if (query.includes('gaming') || query.includes('game') || query.includes('fps')) {
    return fallbackResponses.gaming;
  }
  
  if (query.includes('budget') || query.includes('cheap') || query.includes('affordable')) {
    return fallbackResponses.budget;
  }
  
  if (query.includes('work') || query.includes('render') || query.includes('3d') || 
      query.includes('video') || query.includes('editing')) {
    return fallbackResponses.workstation;
  }
  
  if (query.includes('stream') || query.includes('content') || query.includes('youtube') || 
      query.includes('twitch')) {
    return fallbackResponses.streaming;
  }
  
  if (query.includes('office') || query.includes('productivity') || query.includes('browsing') || 
      query.includes('email')) {
    return fallbackResponses.office;
  }
  
  return fallbackResponses.default;
};

/**
 * Test function to verify API connectivity
 * This can be called from the browser console to check if the API is working
 */
export const testGroqApiConnection = async (): Promise<void> => {
  try {
    console.log('Testing GROQ API connection...');
    
    const response = await groqAxios.post('', {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "API connection successful".'
        }
      ]
    });
    
    console.log('GROQ API test successful!', {
      id: response.data.id,
      model: response.data.model,
      response: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('GROQ API test failed:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // Re-throw the error so the caller knows the test failed
    throw error;
  }
};

/**
 * Try to handle CORS issues by using a proxy if direct API calls fail
 */
const makeGroqRequestWithFallback = async (
  messages: ChatMessage[]
): Promise<string> => {
  try {
    // First try direct API call
    const response = await groqAxios.post('', {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: messages
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Direct API call failed, checking if CORS is the issue:', error);
    
    if (axios.isAxiosError(error) && (
        error.code === 'ERR_NETWORK' || 
        error.message.includes('CORS') || 
        error.response?.status === 0
    )) {
      console.log('Detected potential CORS issue, using local fallbacks');
      
      // If it's a CORS error, use fallback responses
      const userMessage = messages.find(m => m.role === 'user');
      if (userMessage) {
        return getFallbackRecommendation(userMessage.content);
      }
    }
    
    // Re-throw for other error handling
    throw error;
  }
};

/**
 * Generate product recommendations based on user requirements
 * @param userQuery The user's question/requirements for PC build
 * @param selectedComponents Currently selected components (optional)
 * @returns Chatbot response with recommendations
 */
export const getProductRecommendations = async (
  userQuery: string,
  selectedComponents: Record<string, any> = {}
): Promise<string> => {
  try {
    // Create context from selected components for better recommendations
    let componentContext = '';
    
    if (Object.keys(selectedComponents).length > 0) {
      componentContext = 'Currently selected components:\n';
      
      for (const [category, part] of Object.entries(selectedComponents)) {
        componentContext += `- ${category.toUpperCase()}: ${part.product.name} ($${part.product.price})\n`;
      }
    }

    // Create system message with instructions for the AI
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a helpful PC building assistant that provides detailed recommendations for computer components.
      Focus on suggesting specific products that would work well for different use cases (gaming, content creation, office work, etc.).
      Be specific about component specifications and why they would work well for the user's needs.
      Keep your responses concise but informative and always explain your recommendations.
      Only recommend components that make sense for the user's budget and needs.
      If the user has already selected some components, make recommendations that are compatible with those.`
    };

    // Create user message with query and context
    const userMessage: ChatMessage = {
      role: 'user',
      content: `${userQuery}\n\n${componentContext}`
    };

    // Log the request for debugging
    console.log('Preparing GROQ API request:', {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [systemMessage, userMessage]
    });

    // Make request with CORS handling
    const response = await makeGroqRequestWithFallback([systemMessage, userMessage]);
    return response;
  } catch (error) {
    console.error('Error getting recommendations from GROQ:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 429) {
        return 'I apologize, but the recommendation service is currently rate limited. Please try again in a few moments.';
      }
      
      if (error.code === 'ECONNABORTED') {
        return 'The recommendation service took too long to respond. Please try again with a simpler query.';
      }
    }
    
    // If the API call fails, use local fallback recommendations
    console.log('Using fallback recommendations');
    return getFallbackRecommendation(userQuery);
  }
}; 