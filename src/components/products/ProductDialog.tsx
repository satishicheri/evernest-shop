import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product, productApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const ProductDialog = ({ open, onClose, product }: ProductDialogProps) => {
  const [formData, setFormData] = useState({
    productname: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock_availabele: '',
  });
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (product) {
      setFormData({
        productname: product.productname,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        image: product.image,
        stock_availabele: product.stock_availabele.toString(),
      });
    } else {
      setFormData({
        productname: '',
        price: '',
        category: '',
        description: '',
        image: '',
        stock_availabele: '',
      });
    }
  }, [product, open]);

  const createProductMutation = useMutation({
    mutationFn: (data: any) => productApi.create(data, user!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Created",
        description: "Product has been successfully created.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: any) => productApi.update(product!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock_availabele: parseInt(formData.stock_availabele),
    };

    if (product) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productname">Product Name</Label>
            <Input
              id="productname"
              name="productname"
              value={formData.productname}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock_availabele">Stock</Label>
            <Input
              id="stock_availabele"
              name="stock_availabele"
              type="number"
              value={formData.stock_availabele}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};