
import { Product, Category, CartItem } from "@/types";

// Categories
export const categories: Category[] = [
  {
    id: "1",
    name: "Laptops",
    slug: "laptops",
    image: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Desktops",
    slug: "desktops",
    image: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Components",
    slug: "components",
    image: "/placeholder.svg"
  },
  {
    id: "4",
    name: "Peripherals",
    slug: "peripherals",
    image: "/placeholder.svg"
  },
  {
    id: "5",
    name: "Accessories",
    slug: "accessories",
    image: "/placeholder.svg"
  }
];

// Products
export const products: Product[] = [
  {
    id: "1",
    name: "NeuraBook Pro",
    description: "Powerful laptop for professionals with high-end specifications.",
    price: 1299.99,
    category: "laptops",
    image: "/placeholder.svg",
    rating: 4.5,
    stock: 15,
    featured: true,
    specs: {
      processor: "Intel Core i7-12700H",
      ram: "16GB DDR5",
      storage: "512GB NVMe SSD",
      display: "15.6\" 2K IPS",
      graphics: "NVIDIA RTX 3060 6GB"
    }
  },
  {
    id: "2",
    name: "NeuraTower Gaming",
    description: "High-performance gaming desktop with RGB lighting.",
    price: 1899.99,
    category: "desktops",
    image: "/placeholder.svg",
    rating: 4.7,
    stock: 8,
    featured: true,
    specs: {
      processor: "AMD Ryzen 9 5900X",
      ram: "32GB DDR4",
      storage: "1TB NVMe SSD + 2TB HDD",
      graphics: "NVIDIA RTX 4070 12GB",
      cooling: "Liquid Cooling"
    }
  },
  {
    id: "3",
    name: "NeuraBook Air",
    description: "Ultrathin and lightweight laptop for everyday use.",
    price: 899.99,
    category: "laptops",
    image: "/placeholder.svg",
    rating: 4.2,
    stock: 22,
    specs: {
      processor: "Intel Core i5-1135G7",
      ram: "8GB DDR4",
      storage: "256GB NVMe SSD",
      display: "13.3\" FHD IPS",
      graphics: "Intel Iris Xe Graphics"
    }
  },
  {
    id: "4",
    name: "NeuraStation Workstation",
    description: "Professional desktop for content creation and heavy workloads.",
    price: 2299.99,
    category: "desktops",
    image: "/placeholder.svg",
    rating: 4.9,
    stock: 5,
    featured: true,
    specs: {
      processor: "Intel Core i9-12900K",
      ram: "64GB DDR5",
      storage: "2TB NVMe SSD + 4TB HDD",
      graphics: "NVIDIA RTX 4080 16GB",
      cooling: "Advanced Liquid Cooling"
    }
  },
  {
    id: "5",
    name: "NeuraTower Essential",
    description: "Budget-friendly desktop for everyday computing needs.",
    price: 699.99,
    category: "desktops",
    image: "/placeholder.svg",
    rating: 4.0,
    stock: 18,
    specs: {
      processor: "AMD Ryzen 5 5600G",
      ram: "16GB DDR4",
      storage: "512GB NVMe SSD",
      graphics: "AMD Radeon Graphics",
      cooling: "Air Cooling"
    }
  },
  {
    id: "6",
    name: "NeuraBook Gaming",
    description: "Powerful gaming laptop with high refresh rate display.",
    price: 1599.99,
    category: "laptops",
    image: "/placeholder.svg",
    rating: 4.6,
    stock: 10,
    featured: true,
    specs: {
      processor: "AMD Ryzen 7 7800X",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      display: "17.3\" QHD 165Hz",
      graphics: "NVIDIA RTX 4070 8GB Mobile"
    }
  },
  {
    id: "7",
    name: "NeuraRGB Keyboard",
    description: "Mechanical gaming keyboard with customizable RGB lighting.",
    price: 129.99,
    category: "peripherals",
    image: "/placeholder.svg",
    rating: 4.4,
    stock: 30,
    specs: {
      type: "Mechanical",
      switches: "Cherry MX Brown",
      lighting: "RGB",
      connectivity: "USB-C",
      layout: "Full size"
    }
  },
  {
    id: "8",
    name: "NeuraPrecision Mouse",
    description: "High-precision gaming mouse with adjustable DPI.",
    price: 79.99,
    category: "peripherals",
    image: "/placeholder.svg",
    rating: 4.3,
    stock: 25,
    specs: {
      sensor: "16000 DPI Optical",
      buttons: "8 Programmable",
      lighting: "RGB",
      connectivity: "USB / Wireless",
      weight: "Adjustable"
    }
  }
];

// Helper functions to simulate API calls
export const getCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(categories), 300);
  });
};

export const getProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(products), 300);
  });
};

export const getProductsByCategorySlug = (slug: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    const filteredProducts = products.filter(product => product.category === slug);
    setTimeout(() => resolve(filteredProducts), 300);
  });
};

export const getProductById = (id: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    const product = products.find(product => product.id === id);
    setTimeout(() => resolve(product), 300);
  });
};

export const getFeaturedProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    const featuredProducts = products.filter(product => product.featured);
    setTimeout(() => resolve(featuredProducts), 300);
  });
};

// Cart functions
let cart: CartItem[] = [];

export const getCart = (): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...cart]), 300);
  });
};

export const addToCart = (product: Product, quantity: number = 1): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    
    setTimeout(() => resolve([...cart]), 300);
  });
};

export const updateCartItem = (productId: string, quantity: number): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        cart = cart.filter(item => item.product.id !== productId);
      } else {
        cart[itemIndex].quantity = quantity;
      }
    }
    
    setTimeout(() => resolve([...cart]), 300);
  });
};

export const removeFromCart = (productId: string): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    cart = cart.filter(item => item.product.id !== productId);
    setTimeout(() => resolve([...cart]), 300);
  });
};

export const clearCart = (): Promise<CartItem[]> => {
  return new Promise((resolve) => {
    cart = [];
    setTimeout(() => resolve([...cart]), 300);
  });
};

// AI PC Builder recommendation function
export const getAiRecommendations = (budget: number, purpose: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    // In a real app, this would call an AI model
    // For now, just return some products based on simple logic
    let recommendedProducts: Product[] = [];
    
    if (purpose === "gaming") {
      if (budget >= 1500) {
        recommendedProducts = products.filter(p => 
          (p.category === "desktops" || p.category === "laptops") && 
          p.price <= budget && 
          p.specs?.graphics?.toString().includes("RTX")
        );
      } else {
        recommendedProducts = products.filter(p => 
          (p.category === "desktops" || p.category === "laptops") && 
          p.price <= budget
        );
      }
    } else if (purpose === "productivity") {
      recommendedProducts = products.filter(p => 
        (p.category === "desktops" || p.category === "laptops") && 
        p.price <= budget &&
        Number(p.specs?.ram?.toString().split("GB")[0]) >= 16
      );
    } else {
      // General purpose
      recommendedProducts = products.filter(p => 
        (p.category === "desktops" || p.category === "laptops") && 
        p.price <= budget
      );
    }
    
    setTimeout(() => resolve(recommendedProducts.slice(0, 3)), 800);
  });
};
