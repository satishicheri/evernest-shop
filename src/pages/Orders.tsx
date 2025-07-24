import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { orderApi, Order } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', user?._id],
    queryFn: () => user ? orderApi.getUserOrders(user._id) : [],
    enabled: !!user,
  });

  const getStatusIcon = (status: string, isCancelled: boolean) => {
    if (isCancelled) return <XCircle className="h-5 w-5 text-destructive" />;
    
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      default:
        return <Package className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string, isCancelled: boolean) => {
    if (isCancelled) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-success text-success">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please login to view your orders.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Unable to load your orders. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Orders
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Skeleton className="h-6 w-40 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button 
              onClick={() => navigate('/products')} 
              className="bg-gradient-primary hover:opacity-90 border-0"
            >
              <Truck className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order, index) => (
              <Card key={order._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(order.status, order.iscancelled)}
                        <CardTitle className="text-lg">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ordered on {new Date(order.orderdate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status, order.iscancelled)}
                      <div className="text-2xl font-bold text-primary mt-2">
                        ₹{order.totalamount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Products */}
                    <div>
                      <h4 className="font-medium mb-3">Items ({order.products.length})</h4>
                      <div className="grid gap-3">
                        {order.products.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                            <img
                              src={item.productid.image}
                              alt={item.productid.productname}
                              className="h-12 w-12 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=48&h=48&fit=crop';
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{item.productid.productname}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ₹{item.productid.price.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₹{(item.quantity * item.productid.price).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingaddress}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Payment Method</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.paymentmode === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                    </div>

                    {order.deliverydate && (
                      <div className="pt-2">
                        <h4 className="font-medium mb-1">Delivery Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.deliverydate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}