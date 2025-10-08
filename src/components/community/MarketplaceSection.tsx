import React, { useState } from 'react';
import { ShoppingBag, Zap, Crown, Palette, Shield, Star, Filter, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCommunity } from '@/hooks/useCommunity';
import { useToast } from '@/hooks/use-toast';

const MarketplaceSection = () => {
  const { marketplaceItems, profile, purchaseItem, loading } = useCommunity();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('featured');
  const [filterCategory, setFilterCategory] = useState('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (itemId: string, itemName: string, points: number) => {
    if (!profile || profile.points < points) {
      toast({
        title: "Insufficient points",
        description: `You need ${points} points to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(itemId);
    try {
      await purchaseItem(itemId, points);
      toast({
        title: "Purchase successful!",
        description: `You've purchased "${itemName}" for ${points} points.`,
      });
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'themes': return <Palette className="h-4 w-4" />;
      case 'badges': return <Crown className="h-4 w-4" />;
      case 'customizations': return <Star className="h-4 w-4" />;
      case 'streak_insurance': return <Shield className="h-4 w-4" />;
      case 'premium': return <Crown className="h-4 w-4" />;
      default: return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'themes': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'badges': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'customizations': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'streak_insurance': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'premium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredItems = marketplaceItems
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price_points - b.price_points;
        case 'price_high': return b.price_points - a.price_points;
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0; // featured - keep original order
      }
    });

  const categories = [
    { value: 'all', label: 'All Items', count: marketplaceItems.length },
    { value: 'themes', label: 'Themes', count: marketplaceItems.filter(i => i.category === 'themes').length },
    { value: 'badges', label: 'Badges', count: marketplaceItems.filter(i => i.category === 'badges').length },
    { value: 'customizations', label: 'Customizations', count: marketplaceItems.filter(i => i.category === 'customizations').length },
    { value: 'streak_insurance', label: 'Streak Insurance', count: marketplaceItems.filter(i => i.category === 'streak_insurance').length },
    { value: 'premium', label: 'Premium', count: marketplaceItems.filter(i => i.category === 'premium').length },
  ];

  const MarketplaceItemCard = ({ item }: { item: any }) => (
    <Card className="border border-border/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className={`rounded-full p-4 ${getCategoryColor(item.category)}`}>
              {getCategoryIcon(item.category)}
            </div>
          </div>
        )}
        {item.is_premium && (
          <Badge className="absolute right-2 top-2 bg-warning text-warning-foreground">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription className="mt-1">{item.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={`${getCategoryColor(item.category)} border-0`}>
            {getCategoryIcon(item.category)}
            <span className="ml-1 capitalize">{item.category.replace('_', ' ')}</span>
          </Badge>
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            <Zap className="h-4 w-4" />
            {item.price_points}
          </div>
        </div>
        
        <Button 
          className="w-full"
          disabled={
            loading || 
            purchasing === item.id || 
            !profile || 
            profile.points < item.price_points
          }
          onClick={() => handlePurchase(item.id, item.name, item.price_points)}
        >
          {purchasing === item.id ? (
            'Purchasing...'
          ) : !profile || profile.points < item.price_points ? (
            'Insufficient Points'
          ) : (
            <>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Purchase
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketplace</h2>
          <p className="text-muted-foreground">Spend your points on amazing rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="h-4 w-4 mr-1" />
            {profile?.points || 0} Points
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={filterCategory} onValueChange={setFilterCategory} className="flex-1">
          <TabsList className="mx-auto flex w-full flex-wrap items-center justify-center gap-2 rounded-full border border-border/30 bg-background/70 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 lg:w-auto">
            {categories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.12)] dark:data-[state=active]:bg-slate-950/80"
              >
                {category.label} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MarketplaceItemCard key={item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Items Found</h3>
                <p className="text-muted-foreground text-center">
                  {filterCategory === 'all' 
                    ? 'No marketplace items available at the moment.'
                    : `No items found in the ${filterCategory.replace('_', ' ')} category.`
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Earning Points Info */}
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            How to Earn Points
          </CardTitle>
          <CardDescription>
            Build your points balance to unlock amazing rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Complete daily habits</span>
              <Badge variant="secondary" className="ml-auto">+5-10</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span>Maintain streaks</span>
              <Badge variant="secondary" className="ml-auto">+15-25</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Win competitions</span>
              <Badge variant="secondary" className="ml-auto">+50-100</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Unlock achievements</span>
              <Badge variant="secondary" className="ml-auto">+10-50</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceSection;
