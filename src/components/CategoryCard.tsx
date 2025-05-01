import { Link } from 'react-router-dom';
import { Category } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.slug}`}>
      <Card className="product-card overflow-hidden h-full">
        <div className="aspect-square overflow-hidden">
          <img 
            src={`http://localhost:5000${category.image}`} 
            alt={category.name}
            className="h-full w-full object-cover transition-transform hover:scale-105 duration-300 bg-gray-200"
          />
        </div>
        
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse {category.name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
