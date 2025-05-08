import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/data-service';
import { Card, CardContent } from '@/components/ui/card';

const CategoriesPage = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Categories</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-100 rounded-lg"></div>
                <div className="h-6 bg-gray-100 rounded mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => {
            // Construct the image URL
            const imageUrl = category.image?.startsWith('http') 
              ? category.image 
              : `http://localhost:5000${category.image}`;

            return (
              <Link key={category.id} to={`/category/${category.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="aspect-square w-full bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <img 
                        src={imageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'http://localhost:5000/public/placeholder.svg';
                        }}
                      />
                    </div>
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 