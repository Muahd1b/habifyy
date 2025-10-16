import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Palette, Shield, Star, Crown, Sparkles, Coins } from 'lucide-react';
import { useCommunity } from '@/hooks/useCommunity';
import { usePoints } from '@/hooks/usePoints';
import type { MarketplaceItem } from '@/types/community';

export const EnhancedMarketplace = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price_asc');
  const { profile, marketplaceItems, purchaseItem } = useCommunity();
  const { spendPoints } = usePoints();

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingCart },
    { id: 'themes', name: 'Themes', icon: Palette },
    { id: 'badges', name: 'Badges', icon: Star },
    { id: 'customizations', name: 'Customizations', icon: Sparkles },
    { id: 'streak_insurance', name: 'Streak Insurance', icon: Shield },
    { id: 'premium', name: 'Premium', icon: Crown }
  ];

  const enhancedMarketplaceItems: MarketplaceItem[] = [
    {
      id: '1',
      name: 'Ocean Theme',
      description: 'Calm blue tones with wave animations for a peaceful habit tracking experience.',
      category: 'themes',
      price_points: 50,
      image_url: null,
      is_premium: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Streak Protector',
      description: 'Protects your streak for 1 day if you miss a habit. One-time use.',
      category: 'streak_insurance',
      price_points: 25,
      image_url: null,
      is_premium: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Champion Badge',
      description: 'Show off your dedication with this golden champion badge on your profile.',
      category: 'badges',
      price_points: 100,
      image_url: null,
      is_premium: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Custom Habit Colors',
      description: 'Unlock unlimited color options for your habit cards.',
      category: 'customizations',
      price_points: 75,
      image_url: null,
      is_premium: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      name: 'Premium Analytics',
      description: 'Advanced insights and detailed analytics for all your habits.',
      category: 'premium',
      price_points: 200,
      image_url: null,
      is_premium: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const allItems: MarketplaceItem[] = [...marketplaceItems, ...enhancedMarketplaceItems];

  const filteredItems = allItems.filter(item => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const sortedItems = filteredItems.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price_points - b.price_points;
      case 'price_desc':
        return b.price_points - a.price_points;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handlePurchase = async (item: MarketplaceItem) => {
    const success = await spendPoints(
      item.price_points,
      'marketplace_purchase',
      item.id,
      item.name
    );
    
    if (success) {
      // In a real app, you'd also call purchaseItem to track the purchase
      console.log('Item purchased successfully:', item.name);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData?.icon || ShoppingCart;
  };

  return (
    <div className="space-y-6">
      {/* Header with Points */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Marketplace</h2>
            <p className="text-muted-foreground">Spend your points on amazing rewards</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Coins className="w-6 h-6" />
              {profile?.points || 0}
            </div>
            <p className="text-sm text-muted-foreground">Your Points</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={filterCategory} onValueChange={setFilterCategory} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="text-xs">
                    <Icon className="w-3 h-3 mr-1" />
                    {category.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map(item => {
          const Icon = getCategoryIcon(item.category);
          const canAfford = (profile?.points || 0) >= item.price_points;

          return (
            <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Item header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant={item.is_premium ? "default" : "secondary"}>
                        {item.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {item.is_premium && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">{item.description}</p>

                {/* Price and Purchase */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-lg font-bold text-primary">
                    <Coins className="w-4 h-4" />
                    {item.price_points}
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    variant={canAfford ? "default" : "outline"}
                    size="sm"
                  >
                    {canAfford ? 'Purchase' : 'Need More Points'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedItems.length === 0 && (
        <Card className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
          <p className="text-muted-foreground">
            Try changing your filters to see more items.
          </p>
        </Card>
      )}

      {/* How to Earn Points */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <h3 className="text-lg font-semibold mb-3">How to Earn Points</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">+5</span>
            </div>
            <p className="text-sm font-medium">Complete a Habit</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">+20</span>
            </div>
            <p className="text-sm font-medium">7-Day Streak</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">+50</span>
            </div>
            <p className="text-sm font-medium">Win Competition</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">+30</span>
            </div>
            <p className="text-sm font-medium">Unlock Achievement</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
