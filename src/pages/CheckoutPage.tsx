import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '../components/ui/use-toast';
import { getCart, clearCart, addOrder } from '@/services/data-service';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { useDelivery } from '../context/DeliveryContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { cartItems: contextCartItems, total: contextTotal } = useCartContext();
  const { deliveryDetails: contextDeliveryDetails } = useDelivery();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  // Get delivery details and cart items from navigation state
  const locationDeliveryDetails = location.state?.deliveryDetails;
  const locationTotal = location.state?.total;
  const locationCartItems = location.state?.cartItems;

  // Use location state if available, otherwise use context
  const deliveryDetails = locationDeliveryDetails || contextDeliveryDetails;
  const total = locationTotal || contextTotal;
  const cartItems = locationCartItems || contextCartItems;

  useEffect(() => {
    // If no delivery details or cart items, redirect to delivery page
    if (!deliveryDetails || !cartItems || cartItems.length === 0) {
      navigate('/delivery');
    }
  }, [deliveryDetails, cartItems, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate payment form
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        throw new Error('Please fill in all payment details');
      }

      // Validate card number (basic validation)
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Please enter a valid card number');
      }

      // Validate expiry date (basic validation)
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
        throw new Error('Please enter a valid expiry date (MM/YY)');
      }

      // Validate CVV (basic validation)
      if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
        throw new Error('Please enter a valid CVV');
      }

      // Create order object
      const order = {
        userId: user?.id || '',
        date: new Date().toISOString(),
        total,
        items: cartItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: deliveryDetails.address,
        paymentMethod: 'Credit Card',
        status: 'processing' as const
      };

      // Store the order
      await addOrder(order);

      // Clear the cart
      await clearCart();
      
      // Navigate to order confirmation with order details
      navigate('/order-confirmation', {
        state: {
          orderDetails: order
        }
      });
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your order. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!deliveryDetails) {
    return null;
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment Information</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {deliveryDetails.fullName}</p>
                <p><span className="font-medium">Email:</span> {deliveryDetails.email}</p>
                <p><span className="font-medium">Phone:</span> {deliveryDetails.phone}</p>
                <p><span className="font-medium">Address:</span> {deliveryDetails.address}</p>
                <p><span className="font-medium">City:</span> {deliveryDetails.city}</p>
                <p><span className="font-medium">State:</span> {deliveryDetails.state}</p>
                <p><span className="font-medium">ZIP Code:</span> {deliveryDetails.zipCode}</p>
                {deliveryDetails.deliveryInstructions && (
                  <p><span className="font-medium">Instructions:</span> {deliveryDetails.deliveryInstructions}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Payment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/delivery')}
            >
              Back to Delivery
            </Button>
            
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 