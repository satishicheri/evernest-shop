import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  if (user && !isLoading) {
    return <Navigate to={user.isadmin ? "/admin" : "/products"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate(user?.isadmin ? "/admin" : "/products");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="bg-background/95 backdrop-blur border-0 shadow-elegant animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <Store className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to continue shopping
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-200 focus:shadow-glow"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-all duration-200 focus:shadow-glow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 border-0 shadow-elegant"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}