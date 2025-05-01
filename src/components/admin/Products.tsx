import { useState, useEffect } from 'react';
import { createProduct, updateProduct, deleteProduct, getProducts, getCategories, getBrands } from '@/services/data-service';
import { Product, Category, Brand } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    modelName: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: null as File | null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData, brandsData] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        brand: formData.brand,
        modelName: formData.modelName,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
      } else {
        await createProduct(productData);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        modelName: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null
      });
      loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadData();
      } catch (error) {
        setError('Failed to delete product');
      }
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              brand: '',
              modelName: '',
              description: '',
              price: '',
              category: '',
              stock: '',
              image: null
            });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={`http://localhost:5000${product.images[0]}`}
                alt={product.name}
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.brand.name}</p>
                <p className="text-sm text-gray-500">{product.category.name}</p>
                <p className="text-lg font-bold">${product.price}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setFormData({
                      name: product.name,
                      brand: product.brand._id,
                      modelName: product.modelName,
                      description: product.description,
                      price: product.price.toString(),
                      category: product.category._id,
                      stock: product.stock.toString(),
                      image: null
                    });
                    setShowModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Model Name</label>
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 