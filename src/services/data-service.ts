import axios from 'axios';
import { Product, Category, CartItem, Brand, Order } from "@/types";

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
    // Add a cache-busting parameter to avoid browser caching
    const timestamp = new Date().getTime();
    const response = await api.get(`/products/featured?_=${timestamp}`);
    console.log('Featured products fetched:', response.data.length);
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

// Search products within a specific category
export const searchProductsInCategory = async (query: string, categorySlug: string): Promise<Product[]> => {
  try {
    // First get all products in the category
    const categoryProducts = await getProductsByCategorySlug(categorySlug);
    
    // Then filter them client-side based on the search query
    const searchTerms = query.toLowerCase().split(' ');
    
    return categoryProducts.filter(product => {
      const searchableText = `${product.name} ${product.description} ${product.modelName || ''}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  } catch (error) {
    console.error('Error searching products in category:', error);
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
    // Use the my-orders endpoint which is designed to get the current user's orders
    const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const ordersData = await response.json();
      // Transform the data to match the frontend Order interface
      return ordersData.map((order: any) => ({
        id: order._id,
        userId: order.user,
        date: order.createdAt || order.date,
        total: order.total,
        items: order.items.map((item: any) => ({
          name: item.product ? item.product.name : 'Unknown Product',
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        status: order.status
      }));
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
    
    // Convert client order format to server format
    const serverOrderFormat = {
      items: order.items.map(item => ({
        product: item.productId || item.id, // Ensure product ID is properly set
        quantity: item.quantity,
        price: item.price
      })),
      total: order.total,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      status: order.status || 'processing'
    };
    
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(serverOrderFormat)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId: string, userId: string): Promise<Order[]> => {
  try {
    console.log(`Attempting to cancel order: ${orderId} for user: ${userId}`);
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required to cancel order');
    }
    
    // Use Axios for this request which might handle CORS better
    const cancelEndpoint = `${API_BASE_URL}/orders/${orderId}/cancel`;
    console.log(`Sending request to: ${cancelEndpoint}`);
    
    // Try with axios
    try {
      const response = await axios.patch(
        cancelEndpoint,
        {}, // empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Cancel order response:', response.data);
      console.log('Order cancelled successfully, fetching updated orders');
      // After cancelling, fetch the updated orders
      return await getOrders();
    } catch (axiosError) {
      console.error('Axios error cancelling order:', axiosError);
      
      // Try with fetch as fallback
      console.log('Trying with fetch as fallback');
      const fetchResponse = await fetch(cancelEndpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`Fetch response status: ${fetchResponse.status}`);
      
      if (!fetchResponse.ok) {
        if (fetchResponse.status === 403) {
          throw new Error('You do not have permission to cancel this order');
        } else if (fetchResponse.status === 404) {
          throw new Error('Order not found');
        } else {
          const errorText = await fetchResponse.text();
          console.error('Server error response:', errorText);
          throw new Error('Failed to cancel order: ' + errorText);
        }
      }
      
      console.log('Order cancelled successfully via fetch, fetching updated orders');
      return await getOrders();
    }
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
    console.log('Creating brand with data:', brandData.name, 'Logo provided:', !!brandData.logo);
    
    const formData = new FormData();
    formData.append('name', brandData.name.trim());
    
    if (brandData.logo) {
      formData.append('logo', brandData.logo);
    }

    // Log the form data keys being sent
    const formDataKeys: string[] = [];
    formData.forEach((value, key) => {
      formDataKeys.push(key);
    });
    console.log('Form data keys being sent:', formDataKeys);

    const response = await axios.post(BRANDS_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Brand creation successful, response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating brand:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('Server response:', error.response.data);
      
      // Extract the error message from the response if available
      const errorMessage = error.response.data.message || 'Failed to create brand';
      throw new Error(errorMessage);
    }
    
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

// Admin functions

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<Order> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.patch(
      `${API_BASE_URL}/orders/${orderId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    throw error;
  }
};

// User management functions

export const getUsers = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.patch(
      `${API_BASE_URL}/users/${userId}/role`, 
      { role },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/users/${userId}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    if (axios.isAxiosError(error)) {
      console.error('Error details:', error.response?.data);
    }
    throw error;
  }
};
