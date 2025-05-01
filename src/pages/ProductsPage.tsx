import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '@/services/data-service';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ProductsPage = () => {
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Get min and max prices from products
  const minPrice = products?.reduce((min, product) => Math.min(min, product.price), 0) || 0;
  const maxPrice = products?.reduce((max, product) => Math.max(max, product.price), 3000) || 3000;

  // Filter and sort logic
  const filteredProducts = products?.filter(product => 
    product.price >= priceRange[0] && 
    product.price <= priceRange[1] &&
    (searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  if (error) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load products. Please try refreshing the page or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setShowFilters(false)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Search</h3>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Price Range</h3>
                <Slider
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Sort By</h3>
                <div className="space-y-2">
                  <Button
                    variant={sortBy === 'default' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSortBy('default')}
                  >
                    Default
                  </Button>
                  <Button
                    variant={sortBy === 'price-low' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSortBy('price-low')}
                  >
                    Price: Low to High
                  </Button>
                  <Button
                    variant={sortBy === 'price-high' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSortBy('price-high')}
                  >
                    Price: High to Low
                  </Button>
                  <Button
                    variant={sortBy === 'rating' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSortBy('rating')}
                  >
                    Rating
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Products</h1>
            <Button 
              variant="outline" 
              className="md:hidden"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-lg"></div>
                  <div className="h-4 bg-gray-100 rounded mt-4"></div>
                  <div className="h-4 bg-gray-100 rounded mt-2 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more products.
              </p>
              <Button onClick={() => {
                setPriceRange([minPrice, maxPrice]);
                setSearchQuery('');
              }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 