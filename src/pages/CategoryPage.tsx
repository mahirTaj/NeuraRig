import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsByCategorySlug, getCategories } from '@/services/data-service';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 3000]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => getProductsByCategorySlug(slug || ''),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categoryName = categories?.find(c => c.slug === slug)?.name || 'Products';

  // Get min and max prices from products
  const minPrice = products?.reduce((min, product) => Math.min(min, product.price), 0) || 0;
  const maxPrice = products?.reduce((max, product) => Math.max(max, product.price), 3000) || 3000;

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

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 1);
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 1);
    setPriceRange([priceRange[0], value]);
  };

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
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={handleMinPriceChange}
                    className="w-24"
                    min={minPrice}
                    max={priceRange[1] - 1}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={handleMaxPriceChange}
                    className="w-24"
                    min={priceRange[0] + 1}
                    max={maxPrice}
                  />
                </div>
                <div className="px-2">
                  <Slider
                    min={minPrice}
                    max={maxPrice}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="relative flex w-full touch-none select-none items-center"
                  >
                    <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
                      <div 
                        className="absolute h-full bg-primary"
                        style={{
                          left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                          right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                        }}
                      />
                    </div>
                    <div
                      className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      style={{
                        left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                    <div
                      className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                      style={{
                        left: `${((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </Slider>
                </div>
              </div>
            </div>

            <div className="mb-6">
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

        {/* Products Grid */}
        <div className="lg:w-3/4">
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
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more products.
              </p>
              <Button onClick={() => setPriceRange([minPrice, maxPrice])}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
