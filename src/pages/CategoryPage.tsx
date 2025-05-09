import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsByCategorySlug, getCategories, searchProductsInCategory } from '@/services/data-service';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown, ChevronUp, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Product } from '@/types';
import React from 'react';

interface SpecFilterState {
  [key: string]: string[] | null;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [specFilters, setSpecFilters] = useState<SpecFilterState>({});
  const [expandedSpecSections, setExpandedSpecSections] = useState<{[key: string]: boolean}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [showBrandFilter, setShowBrandFilter] = useState<boolean>(true);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', slug],
    queryFn: () => getProductsByCategorySlug(slug || ''),
    enabled: !!slug,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categoryName = categories?.find(c => c.slug === slug)?.name || 'Products';
  const category = categories?.find(c => c.slug === slug);

  // Get min and max prices from products
  const minPrice = products?.reduce((min, product) => Math.min(min, product.price), 0) || 0;
  const maxPrice = products?.reduce((max, product) => Math.max(max, product.price), 3000) || 3000;

  useEffect(() => {
    // Set price range based on products
    if (products?.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, products]);

  // Effect to clear search results when the category changes
  useEffect(() => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
  }, [slug]);

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slug || !searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchProductsInCategory(searchQuery, slug);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching in category:', error);
      setSearchResults([]);
    }
  };

  // Extract unique specifications from products
  const extractSpecifications = () => {
    const productsToUse = searchResults !== null ? searchResults : products;
    
    if (!productsToUse || productsToUse.length === 0) {
      return {};
    }
    
    const specs: {[key: string]: Set<string>} = {};
    
    productsToUse.forEach(product => {
      if (!(product as any).specifications || !Array.isArray((product as any).specifications)) {
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
    
    return result;
  };

  const uniqueSpecs = extractSpecifications();

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
    
    if (activeFilters.length === 0 && brandFilter.length === 0) return true;
    
    // Check spec filters
    const matchesSpecs = activeFilters.every(([specName, allowedValues]) => {
      if (!allowedValues || allowedValues.length === 0) return true;
      
      const productSpec = (product as any).specifications?.find((s: any) => s.name === specName);
      return productSpec && allowedValues.includes(productSpec.value);
    });
    
    // Check brand filter
    const matchesBrand = brandFilter.length === 0 || 
      (product.brand && brandFilter.includes(product.brand.name));
    
    return matchesSpecs && matchesBrand;
  };

  // Clear all spec filters
  const clearSpecFilters = () => {
    setSpecFilters({});
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setIsSearching(false);
  };

  // Get the count of active filters
  const getActiveFilterCount = () => {
    return Object.values(specFilters).filter(values => values && values.length > 0).length + 
      (brandFilter.length > 0 ? 1 : 0);
  };

  // Filter and sort logic
  const filteredProducts = (() => {
    const productsToFilter = searchResults !== null ? searchResults : products || [];
    
    return productsToFilter.filter(product => 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1] &&
      matchesSpecFilters(product)
    );
  })();

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

  // Handle brand filter change
  const handleBrandFilterChange = (brandName: string) => {
    setBrandFilter(prev => {
      if (prev.includes(brandName)) {
        return prev.filter(b => b !== brandName);
      } else {
        return [...prev, brandName];
      }
    });
  };

  // Clear brand filter
  const clearBrandFilter = () => {
    setBrandFilter([]);
  };

  // Extract all available brands from the products
  const availableBrands = React.useMemo(() => {
    if (!products) return [];
    
    // Debug log to check products and their brand information
    console.log('Products in category:', products);
    console.log('First product brand data:', products[0]?.brand);
    
    const brandSet = new Set<string>();
    products.forEach(product => {
      if (product.brand && product.brand.name) {
        brandSet.add(product.brand.name);
      }
    });
    
    const sortedBrands = Array.from(brandSet).sort();
    console.log('Available brands extracted:', sortedBrands);
    return sortedBrands;
  }, [products]);

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
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-lg border p-4 sticky top-24">
            <h2 className="font-semibold mb-4">Filters</h2>
            
            {/* Category Search */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Search in {categoryName}</h3>
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Search in ${categoryName}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {isSearching && searchResults !== null && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearSearch}
                      className="h-7 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </form>
            </div>
            
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

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="mb-6">
                <div 
                  className="flex justify-between items-center cursor-pointer" 
                  onClick={() => setShowBrandFilter(!showBrandFilter)}
                >
                  <h3 className="text-sm font-medium">Brand</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {showBrandFilter ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {brandFilter.length > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">
                      {brandFilter.length} selected
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearBrandFilter} className="h-7 px-2 text-xs">
                      Clear
                    </Button>
                  </div>
                )}
                {showBrandFilter && (
                  <div className="space-y-3 mt-2 max-h-60 overflow-y-auto pr-2">
                    {availableBrands.map(brandName => (
                      <div key={brandName} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`brand-${brandName}`} 
                          checked={brandFilter.includes(brandName)}
                          onCheckedChange={() => handleBrandFilterChange(brandName)}
                        />
                        <Label 
                          htmlFor={`brand-${brandName}`}
                          className="text-sm cursor-pointer"
                        >
                          {brandName}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                <Separator className="my-4" />
              </div>
            )}

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

            {getActiveFilterCount() > 0 && (
              <Button 
                variant="outline" 
                className="w-full mt-4 text-sm"
                onClick={() => {
                  clearSpecFilters();
                  clearBrandFilter();
                }}
              >
                Clear All Filters
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
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
            <>
              {searchResults !== null && (
                <div className="mb-4">
                  <h2 className="text-lg font-medium">
                    {isSearching ? `Search results for "${searchQuery}" in ${categoryName}` : categoryName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-4">
                {isSearching ? 
                  `No results found for "${searchQuery}" in ${categoryName}.` : 
                  'Try adjusting your filters to see more products.'}
              </p>
              <div className="flex gap-2 justify-center">
                {isSearching && (
                  <Button onClick={clearSearch}>
                    Clear Search
                  </Button>
                )}
                <Button onClick={() => {
                  setPriceRange([minPrice, maxPrice]);
                  clearSpecFilters();
                  clearBrandFilter();
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
