import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getProducts, getBrands, createBrand, updateBrand, deleteBrand, createCategory, updateCategory, deleteCategory, createProduct, updateProduct, deleteProductImage } from '@/services/data-service';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { ImageIcon, Trash2, Search, Pencil } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import AdminOrderManagement from '@/components/AdminOrderManagement';
import AdminUserManagement from '@/components/AdminUserManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const { toast } = useToast();
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    brand: '',
    stock: '',
    images: [] as File[],
    existingImages: [] as string[],
    rating: 0,
    specs: {} as Record<string, any>,
    featured: false
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: null as File | null,
    specifications: [] as Array<{
      name: string;
      type: 'text' | 'number' | 'select' | 'checkbox';
      options: string[];
      required: boolean;
      unit?: string;
    }>
  });

  const [brandForm, setBrandForm] = useState({
    name: '',
    logo: null as File | null
  });

  const { data: categories, refetch: refetchCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    onSuccess: (data) => {
      console.log('Categories loaded:', data);
    },
    onError: (error) => {
      console.error('Error loading categories:', error);
    }
  });

  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: brands, refetch: refetchBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to create a product",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (productForm.images.length === 0) {
        toast({
          title: "Error",
          description: "At least one image is required",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Get the selected category to access its specifications
      const selectedCategory = categories?.find(c => c._id === productForm.category);
      if (!selectedCategory) {
        toast({
          title: "Error",
          description: "Please select a valid category",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Format specifications according to the schema
      const formattedSpecifications = selectedCategory.specifications.map(spec => ({
        name: spec.name,
        value: productForm.specs[spec.name] || '',
        unit: spec.unit || undefined
      }));

      const productData = {
        name: productForm.name,
        brand: productForm.brand,
        modelName: productForm.modelName || productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock: parseInt(productForm.stock),
        images: productForm.images,
        specifications: formattedSpecifications,
        featured: productForm.featured
      };

      await createProduct(productData);

      toast({
        title: "Success",
        description: "Product created successfully",
        duration: 3000,
      });
      setProductForm({
        name: '',
        price: '',
        description: '',
        category: '',
        brand: '',
        stock: '',
        images: [],
        existingImages: [],
        rating: 0,
        specs: {},
        featured: false
      });
      refetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to create a category",
        duration: 3000,
      });
      return;
    }

    try {
      const slug = categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, '-');
      
      // Validate specifications
      const validSpecifications = categoryForm.specifications.map(spec => {
        if (!spec.name || !spec.type) {
          throw new Error('All specifications must have a name and type');
        }
        return {
          name: spec.name,
          type: spec.type,
          options: spec.type === 'select' ? spec.options : [],
          required: spec.required || false,
          unit: spec.type === 'number' ? spec.unit || '' : ''
        };
      });

      console.log('Submitting category with data:', {
        name: categoryForm.name,
        slug,
        specifications: validSpecifications
      });

      const newCategory = await createCategory({
        name: categoryForm.name,
        image: categoryForm.image,
        specifications: validSpecifications
      });

      toast({
        title: "Success",
        description: "Category created successfully",
        duration: 3000,
      });

      setCategoryForm({
        name: '',
        slug: '',
        image: null,
        specifications: []
      });
      refetchCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      const errorMessage = error.message || "Failed to create category";
      toast({
        title: "Error",
        description: errorMessage,
        duration: 3000,
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a product",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      await axios.delete(`http://localhost:5000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast({
        title: "Success",
        description: "Product deleted successfully",
        duration: 3000,
      });
      refetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || "Failed to delete product";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to delete a category",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast({
        title: "Success",
        description: "Category deleted successfully",
        duration: 3000,
      });
      refetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || "Failed to delete category";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product._id);
    
    // Convert specifications array to object format for the form
    const specsObject = {};
    if (product.specifications && Array.isArray(product.specifications)) {
      product.specifications.forEach(spec => {
        specsObject[spec.name] = spec.value;
      });
    }
    
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category._id,
      brand: product.brand._id,
      stock: product.stock.toString(),
      images: [],
      existingImages: product.images,
      rating: product.rating || 0,
      specs: specsObject,
      featured: product.featured || false
    });
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category._id);
    setCategoryForm({
      name: category.name || '',
      slug: category.slug || '',
      image: null,
      specifications: category.specifications || []
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to update a product",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (productForm.images.length === 0 && productForm.existingImages.length === 0) {
        toast({
          title: "Error",
          description: "At least one image is required",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Get the selected category to access its specifications
      const selectedCategory = categories?.find(c => c._id === productForm.category);
      if (!selectedCategory) {
        toast({
          title: "Error",
          description: "Category not found",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Convert specs object to array format required by the API
      const formattedSpecifications = selectedCategory.specifications.map(spec => ({
        name: spec.name,
        value: productForm.specs[spec.name] || '',
        unit: spec.unit || undefined
      }));

      const productData = {
        name: productForm.name,
        brand: productForm.brand,
        modelName: productForm.modelName || productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category: productForm.category,
        stock: parseInt(productForm.stock),
        images: productForm.images,
        existingImages: productForm.existingImages,
        specifications: formattedSpecifications,
        featured: productForm.featured
      };

      await updateProduct(editingProduct, productData);

      toast({
        title: "Success",
        description: "Product updated successfully",
        duration: 3000,
      });

      setProductForm({
        name: '',
        price: '',
        description: '',
        category: '',
        brand: '',
        stock: '',
        images: [],
        existingImages: [],
        rating: 0,
        specs: {},
        featured: false
      });
      setEditingProduct(null);
      refetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleImageDelete = async (productId: string, imageIndex: number) => {
    try {
      await deleteProductImage(productId, imageIndex);
      
      // Update the form state if we're editing this product
      if (editingProduct === productId) {
        setProductForm(prev => ({
          ...prev,
          existingImages: prev.existingImages.filter((_, i) => i !== imageIndex)
        }));
      }

      toast({
        title: "Success",
        description: "Image deleted successfully",
        duration: 3000,
      });
      
      refetchProducts();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token || !editingCategory) {
        toast({
          title: "Error",
          description: "You must be logged in to update a category",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('slug', categoryForm.slug.toLowerCase().replace(/\s+/g, '-'));
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }
      formData.append('specifications', JSON.stringify(categoryForm.specifications));

      const response = await axios.put(`http://localhost:5000/api/categories/${editingCategory}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Category updated successfully",
          duration: 3000,
        });
        setEditingCategory(null);
        setCategoryForm({
          name: '',
          slug: '',
          image: null,
          specifications: []
        });
        refetchCategories();
      }
    } catch (error: any) {
      console.error('Error updating category:', error);
      const errorMessage = error.response?.data?.message || "Failed to update category";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Show loading toast
      toast({
        title: "Processing",
        description: "Creating brand...",
        duration: 3000,
      });
      
      // Validate brand name
      if (!brandForm.name.trim()) {
        toast({
          title: "Error",
          description: "Brand name is required",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      console.log('Submitting brand:', brandForm.name, 'with logo:', !!brandForm.logo);
      
      await createBrand({
        name: brandForm.name,
        logo: brandForm.logo
      });

      toast({
        title: "Success",
        description: "Brand created successfully",
        duration: 3000,
      });
      setBrandForm({
        name: '',
        logo: null
      });
      refetchBrands();
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      await deleteBrand(brandId);
      toast({
        title: "Success",
        description: "Brand deleted successfully",
        duration: 3000,
      });
      refetchBrands();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete brand",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand._id);
    setBrandForm({
      name: brand.name || '',
      logo: null
    });
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingBrand) return;

      await updateBrand(editingBrand, {
        name: brandForm.name,
        logo: brandForm.logo
      });

      toast({
        title: "Success",
        description: "Brand updated successfully",
        duration: 3000,
      });
      setEditingBrand(null);
      setBrandForm({
        name: '',
        logo: null
      });
      refetchBrands();
    } catch (error: any) {
      console.error('Error updating brand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update brand",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const filteredProducts = products?.filter(product => {
    if (!product) return false;
    const searchTerm = productSearch.toLowerCase();
    return (
      (product.name?.toLowerCase() || '').includes(searchTerm) ||
      (product.description?.toLowerCase() || '').includes(searchTerm) ||
      (product.category?.name?.toLowerCase() || '').includes(searchTerm)
    );
  }) || [];

  const filteredCategories = categories?.filter(category => {
    if (!category) return false;
    const searchTerm = categorySearch.toLowerCase();
    return (
      (category.name?.toLowerCase() || '').includes(searchTerm) ||
      (category.slug?.toLowerCase() || '').includes(searchTerm)
    );
  }) || [];

  const filteredBrands = brands?.filter(brand => {
    if (!brand) return false;
    const searchTerm = brandSearch.toLowerCase();
    return (brand.name?.toLowerCase() || '').includes(searchTerm);
  }) || [];

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={editingProduct ? handleUpdateProduct : handleProductSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter product name" 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="Enter price" 
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter product description" 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={productForm.category}
                      onValueChange={(value) => setProductForm({...productForm, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select 
                      value={productForm.brand}
                      onValueChange={(value) => setProductForm({...productForm, brand: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands?.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                    min="0"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Featured Product</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Product Images</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setProductForm(prev => ({
                        ...prev,
                        images: [...prev.images, ...files]
                      }));
                    }}
                    className="cursor-pointer"
                  />
                  
                  {/* Preview of new images to be uploaded */}
                  {productForm.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {productForm.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display existing images when editing */}
                  {editingProduct && productForm.existingImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {productForm.existingImages.map((imagePath, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`http://localhost:5000${imagePath}`}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageDelete(editingProduct, index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Label>Specifications</Label>
                  {productForm.category && categories?.find(c => c._id === productForm.category)?.specifications.map((spec, index) => (
                    <div key={index} className="space-y-2">
                      <Label>{spec.name}{spec.required && ' *'}</Label>
                      {spec.type === 'text' && (
                        <Input
                          value={productForm.specs[spec.name] || ''}
                          onChange={(e) => setProductForm({
                            ...productForm,
                            specs: { ...productForm.specs, [spec.name]: e.target.value }
                          })}
                          required={spec.required}
                        />
                      )}
                      {spec.type === 'number' && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={productForm.specs[spec.name] || ''}
                            onChange={(e) => setProductForm({
                              ...productForm,
                              specs: { ...productForm.specs, [spec.name]: e.target.value }
                            })}
                            required={spec.required}
                          />
                          {spec.unit && (
                            <div className="flex items-center px-3 border rounded-md bg-muted">
                              {spec.unit}
                            </div>
                          )}
                        </div>
                      )}
                      {spec.type === 'select' && (
                        <Select
                          value={productForm.specs[spec.name] || ''}
                          onValueChange={(value) => setProductForm({
                            ...productForm,
                            specs: { ...productForm.specs, [spec.name]: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {spec.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {spec.type === 'checkbox' && (
                        <Checkbox
                          checked={productForm.specs[spec.name] || false}
                          onCheckedChange={(checked) => setProductForm({
                            ...productForm,
                            specs: { ...productForm.specs, [spec.name]: checked }
                          })}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingProduct ? 'Update Product' : 'Add Product'}</Button>
                  {editingProduct && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: '',
                          price: '',
                          description: '',
                          category: '',
                          brand: '',
                          stock: '',
                          images: [],
                          existingImages: [],
                          rating: 0,
                          specs: {},
                          featured: false
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Products List</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product._id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-500">${product.price}</p>
                        <p className="text-sm text-gray-500">{product.brand?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <img 
                      src={`http://localhost:5000${product.images[0]}`} 
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={editingCategory ? handleUpdateCategory : handleCategorySubmit}>
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input 
                    id="categoryName" 
                    placeholder="Enter category name" 
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categorySlug">Slug</Label>
                  <Input 
                    id="categorySlug" 
                    placeholder="Enter category slug" 
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryImage">Category Image</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="categoryImage" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCategoryForm({...categoryForm, image: e.target.files[0]});
                        }
                      }}
                    />
                    {categoryForm.image ? (
                      <img 
                        src={URL.createObjectURL(categoryForm.image)} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : categories?.find(c => c._id === editingCategory)?.image && (
                      <img 
                        src={categories.find(c => c._id === editingCategory)?.image} 
                        alt="Current" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Specifications</Label>
                  {categoryForm.specifications.map((spec, index) => (
                    <div key={index} className="border p-4 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={spec.name}
                            onChange={(e) => {
                              const newSpecs = [...categoryForm.specifications];
                              newSpecs[index].name = e.target.value;
                              setCategoryForm({...categoryForm, specifications: newSpecs});
                            }}
                            placeholder="Specification name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={spec.type}
                            onValueChange={(value) => {
                              const newSpecs = [...categoryForm.specifications];
                              newSpecs[index].type = value as 'text' | 'number' | 'select' | 'checkbox';
                              setCategoryForm({...categoryForm, specifications: newSpecs});
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {spec.type === 'number' && (
                        <div className="space-y-2">
                          <Label>Unit (e.g., GB, MHz, W)</Label>
                          <Input
                            value={spec.unit || ''}
                            onChange={(e) => {
                              const newSpecs = [...categoryForm.specifications];
                              newSpecs[index].unit = e.target.value;
                              setCategoryForm({...categoryForm, specifications: newSpecs});
                            }}
                            placeholder="Enter unit"
                          />
                        </div>
                      )}
                      {spec.type === 'select' && (
                        <div className="space-y-2">
                          <Label>Options (comma-separated)</Label>
                          <Input
                            value={spec.options.join(', ')}
                            onChange={(e) => {
                              const newSpecs = [...categoryForm.specifications];
                              newSpecs[index].options = e.target.value.split(',').map(opt => opt.trim());
                              setCategoryForm({...categoryForm, specifications: newSpecs});
                            }}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={spec.required}
                          onCheckedChange={(checked) => {
                            const newSpecs = [...categoryForm.specifications];
                            newSpecs[index].required = checked as boolean;
                            setCategoryForm({...categoryForm, specifications: newSpecs});
                          }}
                        />
                        <Label htmlFor={`required-${index}`}>Required</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newSpecs = [...categoryForm.specifications];
                            newSpecs.splice(index, 1);
                            setCategoryForm({...categoryForm, specifications: newSpecs});
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCategoryForm({
                        ...categoryForm,
                        specifications: [
                          ...categoryForm.specifications,
                          { name: '', type: 'text', options: [], required: false }
                        ]
                      });
                    }}
                  >
                    Add Specification
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingCategory ? 'Update Category' : 'Add Category'}</Button>
                  {editingCategory && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({
                          name: '',
                          slug: '',
                          image: null,
                          specifications: []
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Categories List</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {isLoadingCategories ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-48 bg-gray-200 rounded mt-4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                  <Card key={category._id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.slug}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteCategory(category._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-full h-48 object-cover rounded mt-2"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={editingBrand ? handleUpdateBrand : handleBrandSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input 
                    id="brandName" 
                    placeholder="Enter brand name" 
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({...brandForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandLogo">Brand Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="brandLogo" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setBrandForm({...brandForm, logo: e.target.files[0]});
                        }
                      }}
                    />
                    {brandForm.logo ? (
                      <img 
                        src={URL.createObjectURL(brandForm.logo)} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : brands?.find(b => b._id === editingBrand)?.logo && (
                      <img 
                        src={brands.find(b => b._id === editingBrand)?.logo} 
                        alt="Current" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {editingBrand ? "Upload a new logo or keep the current one" : "Logo is optional. A default logo will be used if none is provided."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingBrand ? 'Update Brand' : 'Add Brand'}</Button>
                  {editingBrand && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setEditingBrand(null);
                        setBrandForm({
                          name: '',
                          logo: null
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Brands List</h2>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrands.map((brand) => (
                <Card key={brand._id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{brand.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditBrand(brand)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteBrand(brand._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="w-full h-48 object-contain rounded mt-2"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <AdminOrderManagement />
        </TabsContent>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 