
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductById, addToCart } from '@/services/data-service';
import { Button } from '@/components/ui/button';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id || ''),
  });

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product, quantity).then(() => {
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart`,
        duration: 3000,
      });
    });
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 animate-pulse">
          <div className="md:w-1/2 bg-gray-100 h-96 rounded-lg"></div>
          <div className="md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-8 bg-gray-100 rounded w-1/3"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="text-sm breadcrumbs mb-6">
        <ul className="flex gap-2 text-muted-foreground">
          <li><Link to="/" className="hover:text-neura-600">Home</Link></li>
          <li><Link to={`/category/${product.category}`} className="hover:text-neura-600">{product.category}</Link></li>
          <li className="text-foreground">{product.name}</li>
        </ul>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="bg-gray-100 rounded-lg overflow-hidden h-96 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain p-8" 
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-500' : ''}`} 
                />
              ))}
            </div>
            <span className="text-sm">{product.rating} rating</span>
          </div>
          
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="text-3xl font-bold mb-4">${product.price.toFixed(2)}</div>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex border border-gray-200 rounded">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={decreaseQuantity} 
                disabled={quantity === 1}
                className="h-10 w-10 rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="h-10 w-12 flex items-center justify-center border-x border-gray-200">
                {quantity}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={increaseQuantity} 
                disabled={quantity === product.stock}
                className="h-10 w-10 rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stock} available
            </span>
          </div>
          
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-neura-600 hover:bg-neura-700"
            disabled={product.stock === 0}
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" /> 
            Add to Cart
          </Button>

          {product.stock === 0 && (
            <p className="text-destructive text-sm mt-2 font-medium">
              This product is currently out of stock.
            </p>
          )}
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="specs">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto">
            <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neura-600 data-[state=active]:bg-transparent">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neura-600 data-[state=active]:bg-transparent">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="support" className="rounded-none border-b-2 border-transparent data-[state=active]:border-neura-600 data-[state=active]:bg-transparent">
              Support
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="specs" className="pt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Technical Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specs && Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-2">
                    <span className="font-medium capitalize">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="pt-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Product Reviews</h2>
              <p className="text-gray-600 mb-4">No reviews yet for this product.</p>
              <Button variant="outline">Write a Review</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="support" className="pt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Product Support</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Warranty Information</h3>
                  <p className="text-gray-600 text-sm">This product comes with a 1-year standard warranty.</p>
                </div>
                <div>
                  <h3 className="font-medium">Returns & Exchanges</h3>
                  <p className="text-gray-600 text-sm">
                    You can return or exchange this item within 30 days of receipt.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Support Contact</h3>
                  <p className="text-gray-600 text-sm">
                    For technical assistance, please contact our support team at support@neurarig.com
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductPage;
