import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, Product } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ProductDialog } from '@/components/products/ProductDialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll,
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.productname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleCloseDialog = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Unable to load products. Please check if the backend server is running on localhost:4000.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Products
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing products at great prices
            </p>
          </div>
          
          {user?.isadmin && (
            <Button 
              onClick={() => setIsProductDialogOpen(true)}
              className="bg-gradient-primary hover:opacity-90 border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={selectedCategory === '' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <Skeleton className="aspect-square rounded-t-lg" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛍️</div>
            <h2 className="text-2xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filters" 
                : "No products available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard
                  product={product}
                  onEdit={user?.isadmin ? handleEditProduct : undefined}
                  onDelete={user?.isadmin ? handleDeleteProduct : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Dialog */}
      <ProductDialog
        open={isProductDialogOpen}
        onClose={handleCloseDialog}
        product={editingProduct}
      />
    </div>
  );
}