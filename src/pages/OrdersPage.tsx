import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getOrders } from '@/services/data-service';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="container px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
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
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Button onClick={() => navigate('/')}>Start Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
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
                    <div className={`text-sm ${
                      order.status === 'processing' ? 'text-yellow-600' :
                      order.status === 'shipped' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  {order.items.map((item: any, index: number) => (
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 