import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, User, MapPin, Package, CheckCircle, XCircle, Truck } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '@/services/data-service';
import { Order } from '@/types';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data);
      applyFilters(data, statusFilter, searchTerm);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters(orders, statusFilter, searchTerm);
  }, [statusFilter, searchTerm]);

  const applyFilters = (allOrders: Order[], status: string, search: string) => {
    let result = [...allOrders];

    // Apply status filter
    if (status !== 'all') {
      result = result.filter(order => order.status === status);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.shippingAddress.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOrders(result);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state with the new order status
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus as Order['status'] } 
            : order
        )
      );
      
      // Also update filtered orders
      applyFilters(
        orders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus as Order['status'] } 
            : order
        ),
        statusFilter,
        searchTerm
      );

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-500">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Order Management</CardTitle>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders}>Refresh</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found matching your criteria
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order ID: {order._id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <span className="font-bold">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium flex items-center gap-1 mb-1">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h4>
                      <p>{order.user?.name || 'Name not available'}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.email || 'Email not available'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-1 mb-1">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </h4>
                      <p className="text-sm">{order.shippingAddress}</p>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 mb-4">
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>
                            {item.product?.name || 'Product name not available'} x {item.quantity}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {order.status === 'processing' && (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Confirm
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <Button 
                        variant="outline"
                        onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                        className="flex items-center gap-1"
                      >
                        <Truck className="h-4 w-4" />
                        Mark as Shipped
                      </Button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <Button 
                        variant="outline"
                        onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrderManagement; 