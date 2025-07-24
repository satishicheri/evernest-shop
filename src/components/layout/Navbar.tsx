import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Store, Package, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?._id],
    queryFn: () => user ? cartApi.getUserCart(user._id) : [],
    enabled: !!user,
  });

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      } ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                ShopHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/products">Products</NavLink>
              {user && !user.isadmin && (
                <>
                  <NavLink to="/cart" className="relative">
                    <ShoppingCart className="h-4 w-4 inline mr-1" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </NavLink>
                  <NavLink to="/orders">Orders</NavLink>
                </>
              )}
              {user?.isadmin && (
                <NavLink to="/admin">
                  <Settings className="h-4 w-4 inline mr-1" />
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {user.isadmin ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/products">
                          <Package className="mr-2 h-4 w-4" />
                          Manage Products
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders">
                          <Package className="mr-2 h-4 w-4" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/products">Products</NavLink>
              {user && !user.isadmin && (
                <>
                  <NavLink to="/cart" className="relative">
                    <ShoppingCart className="h-4 w-4 inline mr-1" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {cartItemCount}
                      </Badge>
                    )}
                  </NavLink>
                  <NavLink to="/orders">Orders</NavLink>
                </>
              )}
              {user?.isadmin && (
                <NavLink to="/admin">
                  <Settings className="h-4 w-4 inline mr-1" />
                  Admin
                </NavLink>
              )}
              
              {user ? (
                <div className="pt-4 border-t border-border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start px-3 py-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border space-y-2">
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};