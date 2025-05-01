import axios from 'axios';
import { Product, Category, CartItem, Brand } from "@/types";

export const API_BASE_URL = 'http://localhost:5000/api';
const API_URL = API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const BRANDS_API_URL = `${API_BASE_URL}/brands`;

// Helper functions with MongoDB API integration
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    return [];
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    return [];
  }
};

export const getProductsByCategorySlug = async (slug: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/products/category/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    return null;
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    return [];
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Cart operations
export const getCart = async (): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
};

export const addToCart = async (product: Product, quantity: number = 1): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: product._id,
        quantity
      })
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to add item to cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (productId: string, quantity: number): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update cart item');
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (productId: string): Promise<CartItem[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to remove item from cart');
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Order functions
interface Order {
  id: string;
  userId: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  paymentMethod: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export const getOrders = async (userId?: string): Promise<Order[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders${userId ? `?userId=${userId}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const addOrder = async (order: Order): Promise<Order[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(order)
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to add order');
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string, userId: string): Promise<Order[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to cancel order');
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const createProduct = async (productData: any) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('brand', productData.brand);
    formData.append('modelName', productData.modelName);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    formData.append('stock', productData.stock.toString());
    
    // Handle multiple images
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((image: File) => {
        formData.append('images', image);
      });
    }

    if (productData.specifications) {
      formData.append('specifications', JSON.stringify(productData.specifications.map((spec: any) => ({
        name: spec.name,
        value: spec.value,
        unit: spec.unit
      }))));
    }

    const response = await axios.post(`${API_BASE_URL}/products`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status !== 201) {
      throw new Error('Failed to create product');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: {
  name?: string;
  brand?: string;
  modelName?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: File[];
  existingImages?: string[];
  specifications?: Array<{
    name: string;
    value: string;
    unit?: string;
  }>;
}): Promise<Product> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    if (product.name) formData.append('name', product.name);
    if (product.brand) formData.append('brand', product.brand);
    if (product.modelName) formData.append('modelName', product.modelName);
    if (product.description) formData.append('description', product.description);
    if (product.price) formData.append('price', product.price.toString());
    if (product.category) formData.append('category', product.category);
    if (product.stock) formData.append('stock', product.stock.toString());
    
    // Handle multiple images
    if (product.images && product.images.length > 0) {
      product.images.forEach((image: File) => {
        formData.append('images', image);
      });
    }
    
    if (product.existingImages) {
      formData.append('existingImages', JSON.stringify(product.existingImages));
    }

    if (product.specifications) {
      formData.append('specifications', JSON.stringify(product.specifications));
    }

    const response = await axios.put(`${API_BASE_URL}/products/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to update product');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const createCategory = async (category: { 
  name: string; 
  image?: File;
  specifications?: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox';
    options: string[];
    required: boolean;
    unit?: string;
  }>;
}): Promise<Category> => {
  try {
    const formData = new FormData();
    formData.append('name', category.name);
    
    if (!category.image) {
      throw new Error('Image is required');
    }
    formData.append('image', category.image);

    if (category.specifications && category.specifications.length > 0) {
      formData.append('specifications', JSON.stringify(category.specifications));
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('Sending category data:', {
      name: category.name,
      hasImage: !!category.image,
      specificationsCount: category.specifications?.length || 0
    });

    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, data: { 
  name: string; 
  image?: File;
  specifications?: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox';
    options: string[];
    required: boolean;
    unit?: string;
  }>;
}) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.image) {
      formData.append('image', data.image);
    }
    if (data.specifications) {
      formData.append('specifications', JSON.stringify(data.specifications));
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update category');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Brand operations
export const getBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axios.get(BRANDS_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

export const createBrand = async (brandData: { name: string; logo: File | null }): Promise<Brand> => {
  try {
    const formData = new FormData();
    formData.append('name', brandData.name);
    if (brandData.logo) {
      formData.append('logo', brandData.logo);
    }

    const response = await axios.post(BRANDS_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error;
  }
};

export const updateBrand = async (brandId: string, brandData: { name: string; logo: File | null }): Promise<Brand> => {
  try {
    const formData = new FormData();
    formData.append('name', brandData.name);
    if (brandData.logo) {
      formData.append('logo', brandData.logo);
    }

    const response = await axios.put(`${BRANDS_API_URL}/${brandId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
};

export const deleteBrand = async (brandId: string): Promise<void> => {
  try {
    await axios.delete(`${BRANDS_API_URL}/${brandId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};

export const deleteProductImage = async (productId: string, imageIndex: number): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.delete(`${API_BASE_URL}/products/${productId}/images/${imageIndex}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status !== 200) {
      throw new Error('Failed to delete image');
    }
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};
