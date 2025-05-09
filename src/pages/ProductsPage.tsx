import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, searchProducts } from '@/services/data-service';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter, Search, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Product } from '@/types';
import React from 'react';

interface SpecFilterState {
  [key: string]: string[] | null;
}

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQueryParam = queryParams.get('search') || '';
  const categoryParam = queryParams.get('category') || '';
  
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [searchQuery, setSearchQuery] = useState(searchQueryParam);
  const [isSearching, setIsSearching] = useState(false);
  const [specFilters, setSpecFilters] = useState<SpecFilterState>({});
  const [expandedSpecSections, setExpandedSpecSections] = useState<{[key: string]: boolean}>({});
  const [debugMode, setDebugMode] = useState<boolean>(false);

  // Decide which query to use based on whether we're searching
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products', searchQueryParam, categoryParam],
    queryFn: async () => {
      if (searchQueryParam) {
        setIsSearching(true);
        return searchProducts(searchQueryParam);
      } else {
        setIsSearching(false);
        return getProducts();
      }
    }
  });

  // Add sample specifications to products if they don't have any (for testing)
  const productsWithSpecs = React.useMemo(() => {
    if (!products) return [];
    
    if (debugMode) {
      console.log('Products from API:', products);
      
      // Test product has specifications defined correctly
      const testProduct = products[0];
      if (testProduct) {
        console.log('Test product:', testProduct.name);
        console.log('Has specifications property?', 'specifications' in testProduct);
        console.log('Is array?', Array.isArray((testProduct as any).specifications));
        console.log('Length:', (testProduct as any).specifications?.length || 0);
      }
    }

    // Define test specifications
    const laptopSpecs = [
      { name: 'Processor Type', value: 'Apple M3' },
      { name: 'Generation', value: 'M Series' },
      { name: 'RAM', value: '16GB' },
      { name: 'Storage', value: '256GB SSD' },
      { name: 'Graphics Memory', value: 'Shared' },
      { name: 'Display Size (Inch)', value: '13.6' }
    ];

    // Get all the categories
    const allCategories = products.reduce((cats: Set<string>, product: any) => {
      if (product.category?.name) {
        cats.add(product.category.name);
      }
      return cats;
    }, new Set<string>());

    console.log('Available categories:', Array.from(allCategories));

    // Check for existing specifications
    const specCount = products.reduce((count, product) => {
      if ((product as any).specifications && Array.isArray((product as any).specifications) && (product as any).specifications.length > 0) {
        return count + (product as any).specifications.length;
      }
      return count;
    }, 0);

    console.log('Total specifications count in API data:', specCount);

    // If we're searching, preserve the real specifications from the API 
    // rather than using mock data to maintain accurate filtering
    if (searchQueryParam) {
      console.log('Search query detected, preserving original product specifications');
      return products;
    }

    if (specCount === 0 || debugMode) {
      // If no specs or in debug mode, add mock specs based on categories
      console.log('Adding sample specifications to products for testing');

      // Sample specs for different product types
      const sampleSpecs: Record<string, Array<{name: string, value: string}>> = {
        Laptop: laptopSpecs,
        Desktop: [
          { name: 'Processor Type', value: 'Intel Core i7' },
          { name: 'Generation', value: '12th Gen' },
          { name: 'RAM', value: '32GB' },
          { name: 'Storage', value: '1TB SSD' },
          { name: 'Graphics Card', value: 'NVIDIA RTX 3080' },
        ],
        GPU: [
          { name: 'GPU Model', value: 'NVIDIA RTX 4070' },
          { name: 'Memory', value: '12GB GDDR6X' },
          { name: 'Memory Bus', value: '192-bit' },
        ],
        RAM: [
          { name: 'Capacity', value: '16GB' },
          { name: 'Type', value: 'DDR4' },
          { name: 'Speed', value: '3200MHz' },
        ],
        Storage: [
          { name: 'Capacity', value: '1TB' },
          { name: 'Type', value: 'SSD' },
          { name: 'Interface', value: 'NVMe' },
        ]
      };

      // Generate some variety in the specs
      const ramValues = ['8GB', '16GB', '32GB', '64GB'];
      const cpuTypes = ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3'];
      const storageValues = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'];
      const displaySizes = ['13.3', '14', '15.6', '16', '17.3'];

      // Apply specifications to products
      return products.map((product, index) => {
        // Determine which type of product this is to apply appropriate specs
        let specType = 'Laptop'; // Default
        let specs = [...laptopSpecs]; // Start with default laptop specs
        
        const productAny = product as any;
        if (productAny.category?.name) {
          const categoryName = productAny.category.name;
          if (categoryName.includes('GPU')) specType = 'GPU';
          else if (categoryName.includes('RAM')) specType = 'RAM';  
          else if (categoryName.includes('Storage')) specType = 'Storage';
          else if (categoryName.includes('Desktop')) specType = 'Desktop';
        }
        
        if (debugMode) {
          console.log(`Applying ${specType} specs to product ${product.name}`);
        }
        
        // Add variety to specs based on product index to test filtering
        if (specType === 'Laptop' || specType === 'Desktop') {
          const ramIndex = index % ramValues.length;
          const cpuIndex = index % cpuTypes.length;
          const storageIndex = index % storageValues.length;
          const displayIndex = index % displaySizes.length;
          
          specs = specs.map(spec => {
            if (spec.name === 'RAM') {
              return { ...spec, value: ramValues[ramIndex] };
            } else if (spec.name === 'Processor Type') {
              return { ...spec, value: cpuTypes[cpuIndex] };
            } else if (spec.name === 'Storage') {
              return { ...spec, value: storageValues[storageIndex] };
            } else if (spec.name === 'Display Size (Inch)') {
              return { ...spec, value: displaySizes[displayIndex] };
            }
            return spec;
          });
        }
        
        return {
          ...product,
          specifications: sampleSpecs[specType] || specs
        };
      });
    }
    
    return products;
  }, [products, debugMode]);

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(searchQueryParam);
  }, [searchQueryParam]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  // Get min and max prices from products
  const minPrice = products?.reduce((min, product) => Math.min(min, product.price), 0) || 0;
  const maxPrice = products?.reduce((max, product) => Math.max(max, product.price), 3000) || 3000;

  useEffect(() => {
    // Set price range based on products
    if (products?.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, products]);

  // Extract unique specifications from all products
  const extractSpecifications = () => {
    if (!productsWithSpecs || productsWithSpecs.length === 0) {
      console.log('No products available for spec extraction');
      return {};
    }
    
    const specs: {[key: string]: Set<string>} = {};
    
    if (debugMode) {
      console.log('Extracting specs from products:', productsWithSpecs.length);
      console.log('Sample product specifications:', (productsWithSpecs[0] as any)?.specifications);
    }
    
    productsWithSpecs.forEach(product => {
      if (!(product as any).specifications || !Array.isArray((product as any).specifications)) {
        if (debugMode) {
          console.log('Product has no valid specifications:', product._id, product.name);
        }
        return;
      }
      
      (product as any).specifications.forEach((spec: any) => {
        if (!specs[spec.name]) {
          specs[spec.name] = new Set();
        }
        specs[spec.name].add(spec.value);
      });
    });
    
    // Convert Sets to sorted arrays
    const result: {[key: string]: string[]} = {};
    Object.keys(specs).forEach(key => {
      result[key] = Array.from(specs[key]).sort();
    });
    
    if (debugMode) {
      console.log('Extracted unique specs:', result);
    }
    return result;
  };

  const uniqueSpecs = extractSpecifications();
  
  if (debugMode) {
    console.log('Unique specs for filtering:', uniqueSpecs, 'Count:', Object.keys(uniqueSpecs).length);
  }

  // Toggle spec filter section expand/collapse
  const toggleSpecSection = (specName: string) => {
    setExpandedSpecSections(prev => ({
      ...prev,
      [specName]: !prev[specName]
    }));
  };

  // Handle spec filter changes
  const handleSpecFilterChange = (specName: string, specValue: string) => {
    setSpecFilters(prev => {
      const currentValues = prev[specName] || [];
      
      if (currentValues.includes(specValue)) {
        // Remove value if already selected
        const newValues = currentValues.filter(v => v !== specValue);
        return {
          ...prev,
          [specName]: newValues.length > 0 ? newValues : null
        };
      } else {
        // Add value if not selected
        return {
          ...prev,
          [specName]: [...currentValues, specValue]
        };
      }
    });
  };

  // Check if a product matches the spec filters
  const matchesSpecFilters = (product: Product): boolean => {
    const activeFilters = Object.entries(specFilters).filter(([_, values]) => values && values.length > 0);
    
    if (activeFilters.length === 0) return true;
    
    return activeFilters.every(([specName, allowedValues]) => {
      if (!allowedValues || allowedValues.length === 0) return true;
      
      const productSpec = (product as any).specifications?.find((s: any) => s.name === specName);
      return productSpec && allowedValues.includes(productSpec.value);
    });
  };

  // Clear all spec filters
  const clearSpecFilters = () => {
    setSpecFilters({});
  };

  // Filter and sort logic
  const filteredProducts = productsWithSpecs?.filter(product => 
    product.price >= priceRange[0] && 
    product.price <= priceRange[1] &&
    matchesSpecFilters(product) &&
    (!searchQuery || 
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
        return ((b as any).rating || 0) - ((a as any).rating || 0);
      default:
        return 0;
    }
  });

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(specFilters).filter(values => values && values.length > 0).length;
  };

  // Toggle debug mode (only visible in development)
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
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
    <div className="container py-12 px-4">
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleDebugMode}
          >
            {debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
          </Button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`w-full md:w-1/4 ${showFilters ? 'fixed inset-0 bg-white z-50 p-6 overflow-auto' : 'hidden md:block'}`}>
          {showFilters && (
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Search</h3>
              <form onSubmit={handleSearch}>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
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
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={sortBy === 'default' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('default')}
                  className="w-full"
                >
                  Default
                </Button>
                <Button 
                  variant={sortBy === 'price-low' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('price-low')}
                  className="w-full"
                >
                  Price (Low)
                </Button>
                <Button 
                  variant={sortBy === 'price-high' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('price-high')}
                  className="w-full"
                >
                  Price (High)
                </Button>
                <Button 
                  variant={sortBy === 'rating' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('rating')}
                  className="w-full"
                >
                  Rating
                </Button>
              </div>
            </div>

            {/* Specifications Filters */}
            {Object.keys(uniqueSpecs).length > 0 && (
              <>
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Specifications</h3>
                    {getActiveFilterCount() > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearSpecFilters}
                        className="text-xs h-7 px-2"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {getActiveFilterCount() > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(specFilters).map(([specName, values]) => (
                        values && values.map(value => (
                          <Badge 
                            key={`${specName}-${value}`}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {specName}: {value}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => handleSpecFilterChange(specName, value)}
                            />
                          </Badge>
                        ))
                      ))}
                    </div>
                  )}

                  {/* Render each spec filter group */}
                  {Object.entries(uniqueSpecs)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([specName, values]) => (
                      <div key={specName} className="border rounded-md overflow-hidden">
                        <button
                          className="flex w-full justify-between items-center p-3 bg-muted/50 hover:bg-muted text-sm font-medium"
                          onClick={() => toggleSpecSection(specName)}
                        >
                          <span>{specName}</span>
                          {expandedSpecSections[specName] ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </button>
                        
                        {expandedSpecSections[specName] && (
                          <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                            {values.map(value => (
                              <div key={`${specName}-${value}`} className="flex items-center gap-2">
                                <Checkbox 
                                  id={`${specName}-${value}`} 
                                  checked={(specFilters[specName] || []).includes(value)}
                                  onCheckedChange={() => handleSpecFilterChange(specName, value)}
                                />
                                <Label 
                                  htmlFor={`${specName}-${value}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {value}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                  ))}
                </div>
              </>
            )}

            {showFilters && (
              <div className="md:hidden mt-8">
                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product Listing */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {searchQueryParam ? `Search Results: "${searchQueryParam}"` : 'All Products'}
            </h1>
            <Button 
              variant="outline" 
              className="md:hidden"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'An error occurred while fetching products.'}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-neura-600" />
              <span className="ml-2">Loading products...</span>
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
                {searchQueryParam ? 
                  `No results found for "${searchQueryParam}". Try a different search term.` : 
                  'Try adjusting your filters to see more products.'}
              </p>
              <Button onClick={() => {
                setPriceRange([minPrice, maxPrice]);
                clearSpecFilters();
                if (searchQueryParam) {
                  navigate('/products');
                }
              }}>
                {searchQueryParam ? 'View All Products' : 'Reset Filters'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 