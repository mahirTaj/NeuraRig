import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  paymentMethod: string;
}

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // In a real application, you would fetch the order details from an API
    // For now, we'll use the data passed through navigation state
    if (location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
    } else {
      // If no order details are found, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{orderDetails.orderId}</span>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between mb-2">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="space-x-4">
            <Button onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/order-history')}
            >
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 