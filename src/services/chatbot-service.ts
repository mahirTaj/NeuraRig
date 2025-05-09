// Service for interacting with GROQ API for product recommendations
import axios from 'axios';
import { getProducts } from '@/services/data-service';
import { Product } from '@/types';

// Define the interface for chat messages
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
  timeout: 25000 // 25 second timeout
});

// Cache for product data to reduce database calls
let productCache: {
  products: Product[];
  timestamp: number;
} | null = null;

// Cache for API responses to reduce API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();

/**
 * Fetch all products with caching
 */
const getAllProducts = async (): Promise<Product[]> => {
  // Check if we have a fresh cache (less than 5 minutes old)
  const now = Date.now();
  if (productCache && (now - productCache.timestamp < 5 * 60 * 1000)) {
    console.log('Using cached product data');
    return productCache.products;
  }
  
  // Otherwise fetch fresh products
  console.log('Fetching fresh product data');
  try {
    const products = await getProducts();
    
    // Update cache
    productCache = {
      products,
      timestamp: now
    };
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Fall back to cached data if available, even if older than 5 minutes
    if (productCache) {
      console.log('Falling back to older cached product data');
      return productCache.products;
    }
    
    throw error;
  }
};

/**
 * Format product data to be more readable for GROQ API
 */
const formatProductsForAI = (products: Product[]): string => {
  // Group products by category
  const productsByCategory: Record<string, Product[]> = {};
  
  products.forEach(product => {
    const category = typeof product.category === 'string' 
      ? product.category 
      : product.category.toString();
    
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    
    productsByCategory[category].push(product);
  });
  
  // Format the output
  let formattedOutput = "AVAILABLE PRODUCTS IN INVENTORY:\n\n";
  
  for (const [category, categoryProducts] of Object.entries(productsByCategory)) {
    formattedOutput += `${category.toUpperCase()} PRODUCTS:\n`;
    
    categoryProducts.forEach(product => {
      // Ensure consistent formatting for easy extraction by the chatbot component
      formattedOutput += `- ID: ${product._id}, Name: ${product.name}, Price: $${product.price}\n`;
    });
    
    formattedOutput += '\n';
  }
  
  return formattedOutput;
};

/**
 * Retry logic for API calls with exponential backoff
 */
const retryApiCall = async <T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt the call
      return await fn();
    } catch (error) {
      console.error(`API call failed (attempt ${attempt + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delayMs = baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
};

/**
 * Test function to verify API connectivity
 */
export const testGroqApiConnection = async (): Promise<void> => {
  try {
    console.log('Testing GROQ API connection...');
    
    // Use retry logic for test connection
    await retryApiCall(async () => {
      const response = await groqAxios.post('', {
        model: 'llama3-8b-8192', // Smaller, more reliable model for testing
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, respond with a short message confirming API is working.' }
        ],
        temperature: 0.1,
        max_tokens: 50
      });
      
      console.log('GROQ API test successful!', {
        model: response.data.model,
        response: response.data.choices[0].message.content.substring(0, 50) + '...'
      });
      
      return response;
    }, 3);  // 3 retries max
    
  } catch (error) {
    console.error('GROQ API test failed after retries:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    throw error;
  }
};

/**
 * Get recommendations using ALL available products in inventory
 */
export const getProductRecommendations = async (
  userQuery: string,
  selectedComponents: Record<string, any> = {}
): Promise<string> => {
  try {
    // Generate a cache key based on the query and selected components
    const componentString = JSON.stringify(selectedComponents);
    const cacheKey = `${userQuery}-${componentString}`;
    
    // Check cache first
    const now = Date.now();
    const cachedResponse = responseCache.get(cacheKey);
    if (cachedResponse && (now - cachedResponse.timestamp < 5 * 60 * 1000)) {
      console.log('Using cached response for query');
      return cachedResponse.response;
    }
    
    // Fetch all products
    const allProducts = await getAllProducts();
    console.log(`Using ${allProducts.length} products from inventory for recommendations`);
    
    // Create context from selected components
    let componentContext = '';
    if (Object.keys(selectedComponents).length > 0) {
      componentContext = 'CURRENTLY SELECTED COMPONENTS:\n';
      for (const [category, part] of Object.entries(selectedComponents)) {
        componentContext += `- ${category.toUpperCase()}: ${part.product.name} ($${part.product.price})\n`;
      }
      componentContext += '\n';
    }
    
    // Format all products into a string for the API
    const inventoryContext = formatProductsForAI(allProducts);
    
    // Create system prompt
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are a PC building assistant for an online computer parts store called NeuraRig.
      
      IMPORTANT FORMATTING INSTRUCTIONS:
      1. ONLY recommend components that are specifically listed in the inventory provided.
      2. DO NOT invent or suggest products that aren't explicitly listed in the available inventory.
      3. FORMAT ALL RECOMMENDATIONS using this EXACT template for each product:
         "For [CATEGORY], I recommend:
         Name: [EXACT PRODUCT NAME], 
         ID: [PRODUCT ID], 
         Price: $[PRICE]
         [Brief reason for recommendation]"
      4. ALWAYS group recommendations by component category (CPU, GPU, RAM, etc.)
      5. ALWAYS include the ID, exact name, and price for each product
      6. Only suggest components that are compatible with what the user has already selected.
      7. If the inventory doesn't have a suitable component for a certain need, clearly acknowledge that limitation.
      
      The user will provide their query followed by their currently selected components (if any) and then the full inventory list.`
    };

    // Create user message with query and ALL contexts
    const userMessage: ChatMessage = {
      role: 'user',
      content: `${userQuery}\n\n${componentContext}\n\n${inventoryContext}`
    };

    try {
      // Use retry logic for API calls
      const apiResponse = await retryApiCall(async () => {
        console.log('Sending request to GROQ API with retry logic...');
        return await groqAxios.post('', {
          model: 'llama3-8b-8192', // More reliable model
          messages: [systemMessage, userMessage],
          temperature: 0.2, // Lower temperature for more focused recommendations
          max_tokens: 800,
          top_p: 0.9
        });
      }, 3); // 3 retries
      
      const responseContent = apiResponse.data.choices[0].message.content;
      console.log('GROQ API response received successfully');
      
      // Cache the successful response
      responseCache.set(cacheKey, {
        response: responseContent,
        timestamp: now
      });
      
      return responseContent;
      
    } catch (error) {
      console.error('GROQ API call failed even with retries:', error);
      
      // Create a fallback response using the available products
      let fallbackResponse = "I'm having difficulty connecting to our recommendation service right now, but I can still help you choose components from our inventory:\n\n";
      
      // Filter products based on the user query
      const queryLower = userQuery.toLowerCase();
      
      // Check for category-specific requests
      if (queryLower.includes('cpu') || queryLower.includes('processor')) {
        const cpus = allProducts.filter(p => 
          (typeof p.category === 'string' && p.category.toLowerCase().includes('processor')) || 
          p.name.toLowerCase().includes('cpu') ||
          p.name.toLowerCase().includes('processor')
        );
        
        if (cpus.length > 0) {
          fallbackResponse += "CPUs available in our inventory:\n";
          cpus.slice(0, 5).forEach(cpu => {
            fallbackResponse += `- ${cpu.name} ($${cpu.price})\n`;
          });
        }
      } 
      else if (queryLower.includes('gpu') || queryLower.includes('graphics')) {
        const gpus = allProducts.filter(p => 
          (typeof p.category === 'string' && p.category.toLowerCase().includes('graphics')) || 
          p.name.toLowerCase().includes('gpu') ||
          p.name.toLowerCase().includes('graphics')
        );
        
        if (gpus.length > 0) {
          fallbackResponse += "GPUs available in our inventory:\n";
          gpus.slice(0, 5).forEach(gpu => {
            fallbackResponse += `- ${gpu.name} ($${gpu.price})\n`;
          });
        }
      }
      else if (queryLower.includes('gaming') || queryLower.includes('game')) {
        // Suggest gaming components
        const gamingCPUs = allProducts.filter(p => 
          ((typeof p.category === 'string' && p.category.toLowerCase().includes('processor')) || 
           p.name.toLowerCase().includes('cpu')) && 
          p.price > 200 // Gaming CPUs tend to be more expensive
        );
        
        const gamingGPUs = allProducts.filter(p => 
          ((typeof p.category === 'string' && p.category.toLowerCase().includes('graphics')) || 
           p.name.toLowerCase().includes('gpu')) && 
          p.price > 300 // Gaming GPUs tend to be more expensive
        );
        
        fallbackResponse += "For gaming PCs, consider these components from our inventory:\n\n";
        
        if (gamingCPUs.length > 0) {
          fallbackResponse += "CPUs suitable for gaming:\n";
          gamingCPUs.slice(0, 3).forEach(cpu => {
            fallbackResponse += `- ${cpu.name} ($${cpu.price})\n`;
          });
          fallbackResponse += "\n";
        }
        
        if (gamingGPUs.length > 0) {
          fallbackResponse += "GPUs for gaming performance:\n";
          gamingGPUs.slice(0, 3).forEach(gpu => {
            fallbackResponse += `- ${gpu.name} ($${gpu.price})\n`;
          });
        }
      }
      else {
        // Generic recommendations for top products in each category
        const categories = [...new Set(allProducts.map(p => 
          typeof p.category === 'string' ? p.category : p.category.toString()
        ))];
        
        fallbackResponse += "Here are some products from our inventory:\n\n";
        
        for (const category of categories.slice(0, 3)) {
          const categoryProducts = allProducts.filter(p => 
            (typeof p.category === 'string' ? p.category : p.category.toString()) === category
          );
          
          if (categoryProducts.length > 0) {
            fallbackResponse += `${category}:\n`;
            categoryProducts.slice(0, 3).forEach(product => {
              fallbackResponse += `- ${product.name} ($${product.price})\n`;
            });
            fallbackResponse += "\n";
          }
        }
      }
      
      fallbackResponse += "\nYou can browse our categories for more options or ask about specific components.";
      
      // Cache even the fallback response to reduce strain
      responseCache.set(cacheKey, {
        response: fallbackResponse,
        timestamp: now
      });
      
      return fallbackResponse;
    }
  } catch (error) {
    console.error('Fatal error in product recommendations:', error);
    return "I'm currently having trouble accessing our product inventory. Please try again in a moment or browse our website categories directly to see what's available.";
  }
}; 