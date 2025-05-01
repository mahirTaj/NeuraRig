import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getCart } from '@/services/data-service';

const DeliveryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || 
          !formData.city || !formData.state || !formData.zipCode) {
        throw new Error('Please fill in all required fields');
      }

      // Get cart items to calculate total
      const cartItems = await getCart();
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      const total = cartItems.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0);

      // Ensure we have valid data before proceeding
      if (isNaN(total) || total <= 0) {
        throw new Error('Invalid cart total');
      }

      // Navigate to checkout with delivery details
      navigate('/checkout', {
        state: {
          deliveryDetails: formData,
          total,
          cartItems
        }
      });
    } catch (error) {
      console.error('Error processing delivery:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process delivery details. Please try again.",
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

  return (
    <div className="container px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Delivery Information</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
                  <Input
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </Button>
            
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryPage; 