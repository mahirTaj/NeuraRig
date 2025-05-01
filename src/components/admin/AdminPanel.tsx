import Products from './Products';
import Categories from './Categories';
import Brands from './Brands';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded ${
            activeTab === 'products' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded ${
            activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2 rounded ${
            activeTab === 'brands' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Brands
        </button>
      </div>

      {activeTab === 'products' && <Products />}
      {activeTab === 'categories' && <Categories />}
      {activeTab === 'brands' && <Brands />}
    </div>
  );
};

export default AdminPanel; 