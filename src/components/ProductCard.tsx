import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star, ShoppingCart } from 'lucide-react';
import { addToCart } from '@/services/data-service';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    addToCart(product, 1).then(() => {
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
        duration: 3000,
      });
    });
  };
  
  return (
    <Card className="product-card overflow-hidden h-full flex flex-col">
      <Link to={`/product/${product._id}`} className="overflow-hidden">
        <img 
          src={`http://localhost:5000${product.images[0]}`} 
          alt={product.name}
          className="h-48 w-full object-cover transition-transform hover:scale-105 duration-300 bg-gray-100"
        />
      </Link>
      
      <CardContent className="p-4 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex text-amber-500">
            <Star className="h-4 w-4 fill-current" />
          </div>
          <span className="text-sm">{product.rating}</span>
        </div>
        
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold mt-2 hover:text-neura-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
          {product.description}
        </p>
        
        <div className="font-bold text-lg mt-3">
          ${product.price.toFixed(2)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart} 
          className="w-full bg-neura-600 hover:bg-neura-700"
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
