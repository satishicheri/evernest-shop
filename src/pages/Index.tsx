import { ArrowRight, Store, ShoppingBag, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: ShoppingBag,
      title: "Wide Product Range",
      description: "Discover thousands of products across multiple categories at competitive prices."
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description: "Shop with confidence using our secure payment gateway and buyer protection."
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Get help anytime with our dedicated customer support team ready to assist you."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-background/10 backdrop-blur-sm"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <Store className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                ShopHub
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Your ultimate destination for online shopping. Discover amazing products, 
              enjoy seamless shopping experience, and get the best deals delivered to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button 
                  onClick={() => navigate(user.isadmin ? '/admin' : '/products')}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 shadow-elegant"
                >
                  {user.isadmin ? 'Go to Dashboard' : 'Start Shopping'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/products')}
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 shadow-elegant"
                  >
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Sign Up Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Why Choose ShopHub?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of online shopping with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="bg-gradient-card border-0 shadow-card-custom hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers and discover the best deals today
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-elegant"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Already have an account?
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
