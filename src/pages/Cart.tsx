import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, orderApi, CartItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cart() {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cod' | 'online'>('cod');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: () => user ? cartApi.getUserCart(user._id) : [],
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ cartId, quantity }: { cartId: string; quantity: number }) =>
      cartApi.updateQuantity(cartId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been placed and will be delivered soon.",
      });
      navigate('/orders');
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCheckingOut(false);
    }
  });

  const updateQuantity = (cartId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ cartId, quantity: newQuantity });
    }
  };

  const removeItem = (cartId: string) => {
    removeFromCartMutation.mutate(cartId);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.productid.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (!shippingAddress.trim()) {
      toast({
        title: "Shipping Address Required",
        description: "Please enter your shipping address",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    createOrderMutation.mutate({
      userid: user!._id,
      paymentmode: paymentMode,
      shippingaddress: shippingAddress,
      status: 'pending',
    });
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
              Please login to view your cart.
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
            <CardTitle className="text-destructive">Error Loading Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Unable to load your cart. Please try again later.
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
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Shopping Cart
          </h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-20 w-20 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Button onClick={() => navigate('/products')} className="bg-gradient-primary hover:opacity-90 border-0">
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: CartItem, index) => (
                <Card key={item._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.productid.image}
                        alt={item.productid.productname}
                        className="h-20 w-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop';
                        }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.productid.productname}</h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {item.productid.description.substring(0, 100)}...
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{item.productid.price.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity, -1)}
                            disabled={updateQuantityMutation.isPending}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 py-2 text-center min-w-[3rem]">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity, 1)}
                            disabled={updateQuantityMutation.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item._id)}
                          disabled={removeFromCartMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">₹{getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="address">Shipping Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete address..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Payment Method</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={paymentMode === 'cod' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentMode('cod')}
                        >
                          Cash on Delivery
                        </Button>
                        <Button
                          variant={paymentMode === 'online' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaymentMode('online')}
                        >
                          Online Payment
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !shippingAddress.trim()}
                    className="w-full bg-gradient-primary hover:opacity-90 border-0 shadow-elegant"
                  >
                    {isCheckingOut ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}