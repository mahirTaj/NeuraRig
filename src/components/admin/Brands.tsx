import { useState, useEffect } from 'react';
import { createBrand, updateBrand, deleteBrand, getBrands } from '@/services/data-service';
import { Brand } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: null as File | null
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await updateBrand(editingBrand._id, formData);
      } else {
        await createBrand(formData);
      }
      setShowModal(false);
      setEditingBrand(null);
      setFormData({ name: '', logo: null });
      loadBrands();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save brand');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await deleteBrand(id);
        loadBrands();
      } catch (error) {
        setError('Failed to delete brand');
      }
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Brands</h1>
        <button
          onClick={() => {
            setEditingBrand(null);
            setFormData({ name: '', logo: null });
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={20} />
          Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <div key={brand._id} className="border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{brand.name}</h3>
                <p className="text-sm text-gray-500">{brand.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBrand(brand);
                    setFormData({ name: brand.name, logo: null });
                    setShowModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(brand._id)}
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
              {editingBrand ? 'Edit Brand' : 'Add Brand'}
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
                <label className="block text-sm font-medium mb-2">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
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
                  {editingBrand ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands; 