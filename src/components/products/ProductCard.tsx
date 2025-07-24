import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Product, cartApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: string; productId: string }) =>
      cartApi.addToCart(userId, productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to Cart",
        description: `${product.productname} has been added to your cart.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAddingToCart(false);
    }
  });

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (product.stock_availabele <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    addToCartMutation.mutate({ userId: user._id, productId: product._id });
  };

  const averageRating = product.reviews?.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0;

  return (
    <Card className="group hover:shadow-card-custom transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-0">
      <CardHeader className="p-0">
        <div 
          className="aspect-square overflow-hidden rounded-t-lg cursor-pointer"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <img
            src={product.image}
            alt={product.productname}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
            }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.productname}
          </h3>
          <Badge variant={product.stock_availabele > 0 ? "default" : "destructive"} className="ml-2 shrink-0">
            {product.stock_availabele > 0 ? `${product.stock_availabele} left` : 'Out of Stock'}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">{product.category}</Badge>
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({product.reviews?.length})
              </span>
            </div>
          )}
        </div>

        <div className="text-2xl font-bold text-primary mb-4">
          ₹{product.price.toLocaleString()}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {user?.isadmin ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit?.(product)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete?.(product._id)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_availabele <= 0 || !user}
            className="w-full bg-gradient-primary hover:opacity-90 border-0"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};