import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrders, cancelOrder } from '@/services/data-service';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  date: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  paymentMethod: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!user?.id) {
          setOrders([]);
          return;
        }
        const orderList = await getOrders(user.id);
        setOrders(orderList);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user?.id]);

  const handleCancelOrder = async (orderId: string) => {
    if (!user?.id) return;
    
    try {
      const updatedOrders = await cancelOrder(orderId, user.id);
      setOrders(updatedOrders);
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the order. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Order History</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-100 rounded-lg"></div>
            <div className="h-32 bg-gray-100 rounded-lg"></div>
            <div className="h-32 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Order History</h1>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Order #{order.id}</h2>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${order.total.toFixed(2)}</div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-sm text-muted-foreground">
                  <p><span className="font-medium">Shipping Address:</span> {order.shippingAddress}</p>
                  <p><span className="font-medium">Payment Method:</span> {order.paymentMethod}</p>
                </div>

                {order.status === 'processing' && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="destructive"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage; 