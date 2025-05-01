import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { getFeaturedProducts, getCategories } from '@/services/data-service';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  const { data: featuredProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: getFeaturedProducts
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  return (
    <div className="min-h-screen">
      <HeroBanner />
      
      <div className="container px-4 py-12">
        {/* Featured Products */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button asChild variant="outline">
              <Link to="/products">View all</Link>
            </Button>
          </div>
          
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-gray-100 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
        
        {/* Browse Categories */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Browse Categories</h2>
            <Button asChild variant="outline">
              <Link to="/categories">All categories</Link>
            </Button>
          </div>
          
          {isLoadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {categories?.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </div>
        
        {/* AI PC Builder Promotion */}
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Let AI Build Your Perfect PC</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our advanced AI can recommend the perfect PC configuration based on your specific needs,
            whether you're a gamer, content creator, or professional.
          </p>
          <Button asChild size="lg" className="bg-neura-600 hover:bg-neura-700">
            <Link to="/pc-builder/ai">Try AI Builder</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
