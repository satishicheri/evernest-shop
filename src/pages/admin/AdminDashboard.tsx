import { useState } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, orderApi, userApi, Order, Product, User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['all-orders'],
    queryFn: orderApi.getAllOrders,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  });

  // Mutations
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'completed' }) =>
      orderApi.updateOrder(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Check if user is admin
  if (!user?.isadmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => navigate('/products')} className="w-full">
              Go to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalamount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const lowStockProducts = products.filter(product => product.stock_availabele < 10).length;

  const handleOrderStatusUpdate = (orderId: string, newStatus: string) => {
    if (newStatus === 'pending' || newStatus === 'completed') {
      updateOrderMutation.mutate({ id: orderId, status: newStatus });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const isLoading = loadingProducts || loadingOrders || loadingUsers;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? <Skeleton className="h-8 w-24" /> : `₹${totalRevenue.toLocaleString()}`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? <Skeleton className="h-8 w-16" /> : orders.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pending, {completedOrders} completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? <Skeleton className="h-8 w-16" /> : products.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {lowStockProducts} low stock
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {isLoading ? <Skeleton className="h-8 w-16" /> : users.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Orders Management</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card key={order._id} className="hover:shadow-card-custom transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.orderdate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₹{order.totalamount.toLocaleString()}</p>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => handleOrderStatusUpdate(order._id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Customer:</strong> {typeof order.userid === 'object' ? order.userid.username : 'N/A'}</p>
                          <p><strong>Payment:</strong> {order.paymentmode === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                        </div>
                        <div>
                          <p><strong>Items:</strong> {order.products.length}</p>
                          <p><strong>Address:</strong> {order.shippingaddress}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Products Management</h2>
              <Button onClick={() => navigate('/products')} className="bg-gradient-primary hover:opacity-90 border-0">
                View All Products
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-square rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(0, 6).map((product: Product) => (
                  <Card key={product._id} className="hover:shadow-card-custom transition-shadow">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={product.image}
                        alt={product.productname}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.productname}</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                        <Badge variant={product.stock_availabele > 10 ? "default" : "destructive"}>
                          Stock: {product.stock_availabele}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Users Management</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user: User) => (
                  <Card key={user._id} className="hover:shadow-card-custom transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{user.username}</h3>
                          <p className="text-muted-foreground">{user.email}</p>
                          <div className="flex gap-2 mt-2">
                            {user.isadmin && <Badge variant="default">Admin</Badge>}
                            {user.isblocked && <Badge variant="destructive">Blocked</Badge>}
                            {user.contact && <Badge variant="outline">Contact: {user.contact}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {!user.isadmin && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}