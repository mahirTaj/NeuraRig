
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart } from '@/services/data-service';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types';

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await getCart();
        setCart(cartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cart:', error);
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await updateCartItem(productId, quantity);
      setCart(updatedCart);
      toast({
        title: "Cart updated",
        description: "Your cart has been updated",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const updatedCart = await removeFromCart(productId);
      setCart(updatedCart);
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  // Calculate cart totals
  const subtotal = cart.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = subtotal > 0 ? 15 : 0; // Flat shipping rate
  const total = subtotal + tax + shipping;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-gray-100 rounded-md"></div>
          <div className="h-24 bg-gray-100 rounded-md"></div>
          <div className="h-24 bg-gray-100 rounded-md"></div>
        </div>
      ) : cart.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Total</div>
              </div>
              
              {cart.map((item) => (
                <div key={item.product.id} className="border-t first:border-t-0">
                  <div className="grid grid-cols-1 md:grid-cols-12 p-4 gap-4 items-center">
                    <div className="md:col-span-6 flex gap-4">
                      <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-20 h-20 object-cover bg-gray-100 rounded"
                        />
                      </Link>
                      <div className="flex flex-col">
                        <Link 
                          to={`/product/${item.product.id}`} 
                          className="font-medium hover:text-neura-600"
                        >
                          {item.product.name}
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          Category: {item.product.category}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 w-fit p-0 h-auto mt-2"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 text-center">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                      ${item.product.price.toFixed(2)}
                    </div>
                    
                    <div className="md:col-span-2 flex justify-center">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Quantity:</div>
                      <div className="flex border border-gray-200 rounded">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)} 
                          disabled={item.quantity === 1}
                          className="h-8 w-8 rounded-none"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="h-8 w-10 flex items-center justify-center border-x border-gray-200">
                          {item.quantity}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)} 
                          disabled={item.quantity === item.product.stock}
                          className="h-8 w-8 rounded-none"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 text-center font-medium">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Total:</div>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to="/">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-neura-600 hover:bg-neura-700">
                Proceed to Checkout
              </Button>
              
              <div className="mt-4 text-xs text-center text-muted-foreground">
                By proceeding, you agree to our terms and conditions.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
            <ShoppingCart className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button asChild>
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
