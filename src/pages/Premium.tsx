import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Shield,
  Zap,
  Star,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumProps {
  onBack?: () => void;
}

const Premium = ({ onBack }: PremiumProps) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Deep insights into your habit patterns with detailed charts and trends"
    },
    {
      icon: Users,
      title: "Premium Community",
      description: "Join exclusive groups and challenges with like-minded individuals"
    },
    {
      icon: Shield,
      title: "Priority Support",
      description: "Get help when you need it with our priority customer support"
    },
    {
      icon: Zap,
      title: "Unlimited Habits",
      description: "Track as many habits as you want without any limits"
    },
    {
      icon: Star,
      title: "Custom Themes",
      description: "Personalize your experience with beautiful premium themes"
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description: "Get personalized recommendations powered by AI"
    }
  ];

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upgrade to premium.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          priceId: 'premium_monthly', // This would be your actual Stripe price ID
          mode: 'payment'
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-warning" />
              <span className="font-semibold text-warning">Premium</span>
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full mb-6">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Upgrade to Premium</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unlock Your Full
            <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              {" "}Potential
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Take your habit building to the next level with advanced features, 
            insights, and personalized guidance.
          </p>

          {/* Pricing Card */}
          <Card className="max-w-md mx-auto mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Badge className="bg-success text-success-foreground">
                  Most Popular
                </Badge>
              </div>
              
              <Button 
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-primary text-primary-foreground hover:scale-105 transition-transform"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-3">
                Cancel anytime. 30-day money-back guarantee.
              </p>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Everything you need to succeed
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground flex-shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <Card className="p-8">
          <h3 className="text-xl font-bold text-center mb-6">Free vs Premium</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Column */}
            <div>
              <div className="text-center mb-4">
                <h4 className="font-semibold text-lg mb-2">Free</h4>
                <span className="text-2xl font-bold">$0</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm">Up to 5 habits</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm">Basic tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm">Simple calendar view</span>
                </li>
              </ul>
            </div>

            {/* Premium Column */}
            <div className="border-l border-border pl-8">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-lg mb-2 text-primary">Premium</h4>
                <span className="text-2xl font-bold">$9.99</span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Unlimited habits</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Premium community access</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">AI-powered insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Custom themes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Premium;