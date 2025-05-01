export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  brand: {
    _id: string;
    name: string;
  };
  modelName: string;
  images: string[];
  rating: number;
  stock: number;
  specifications: Array<{
    name: string;
    value: string;
    unit?: string;
  }>;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  specifications: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox';
    options: string[];
    required: boolean;
    unit?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Brand {
  _id: string;
  name: string;
  logo: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}
