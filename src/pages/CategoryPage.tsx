import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsByCategorySlug, getCategories } from '@/services/data-service';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => getProductsByCategorySlug(slug || ''),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categoryName = categories?.find(c => c.slug === slug)?.name || 'Products';

  // Filter and sort logic
  const filteredProducts = products?.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  ) || [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (!slug) {
    return (
      <div className="container px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{categoryName}</h1>
      <div className="text-sm breadcrumbs mb-6">
        <ul className="flex gap-2 text-muted-foreground">
          <li><Link to="/" className="hover:text-neura-600">Home</Link></li>
          <li><Link to="/categories" className="hover:text-neura-600">Categories</Link></li>
          <li className="text-foreground">{categoryName}</li>
        </ul>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex justify-between"
          >
            <span>Filters & Sorting</span>
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg border p-4 sticky top-24">
            <h2 className="font-semibold mb-4">Filters</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <div className="px-2">
                <Slider
                  defaultValue={[0, 3000]}
                  min={0}
                  max={3000}
                  step={100}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value)}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Sort By</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortBy === 'default'} 
                    onChange={() => setSortBy('default')} 
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Default</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortBy === 'price-low'} 
                    onChange={() => setSortBy('price-low')} 
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Price: Low to High</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortBy === 'price-high'} 
                    onChange={() => setSortBy('price-high')} 
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Price: High to Low</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sort" 
                    checked={sortBy === 'rating'} 
                    onChange={() => setSortBy('rating')} 
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Top Rated</span>
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">In Stock</h3>
              <div className="flex items-center space-x-2">
                <Checkbox id="in-stock" />
                <label
                  htmlFor="in-stock"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show only in-stock items
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="lg:w-3/4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
              <Button onClick={() => setPriceRange([0, 3000])}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
