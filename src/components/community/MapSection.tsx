import React, { useState } from 'react';
import { MapPin, Users, Globe, Filter, Settings, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity } from '@/hooks/useCommunity';

const MapSection = () => {
  const { friends, profile } = useCommunity();
  const [viewMode, setViewMode] = useState('global');
  const [showActivity, setShowActivity] = useState(true);
  const [privacyVisible, setPrivacyVisible] = useState(profile?.privacy_location || false);

  // Mock location data for friends
  const friendsWithLocations = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: null,
      city: 'San Francisco',
      country: 'USA',
      lat: 37.7749,
      lng: -122.4194,
      activity: 'Completed morning run',
      lastActive: '2 hours ago',
      streakDays: 15
    },
    {
      id: '2',
      name: 'Mike Johnson',
      avatar: null,
      city: 'London',
      country: 'UK',
      lat: 51.5074,
      lng: -0.1278,
      activity: 'Finished coding session',
      lastActive: '4 hours ago',
      streakDays: 8
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: null,
      city: 'Sydney',
      country: 'Australia',
      lat: -33.8688,
      lng: 151.2093,
      activity: 'Meditation completed',
      lastActive: '1 hour ago',
      streakDays: 22
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      avatar: null,
      city: 'Barcelona',
      country: 'Spain',
      lat: 41.3851,
      lng: 2.1734,
      activity: 'Language learning',
      lastActive: '30 minutes ago',
      streakDays: 12
    }
  ];

  // Mock global activity data
  const globalStats = {
    totalUsers: 125430,
    activeToday: 15672,
    totalHabitsCompleted: 892543,
    topCountries: [
      { name: 'United States', users: 28543, flag: '🇺🇸' },
      { name: 'United Kingdom', users: 15672, flag: '🇬🇧' },
      { name: 'Canada', users: 12890, flag: '🇨🇦' },
      { name: 'Australia', users: 11234, flag: '🇦🇺' },
      { name: 'Germany', users: 9876, flag: '🇩🇪' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Community Map</h2>
          <p className="text-muted-foreground">Explore the global habit community</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global View</SelectItem>
              <SelectItem value="friends">Friends Only</SelectItem>
              <SelectItem value="local">Local Area</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {viewMode === 'global' && 'Global Community'}
                  {viewMode === 'friends' && 'Your Friends'}
                  {viewMode === 'local' && 'Local Community'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Activity Feed</span>
                  <Switch checked={showActivity} onCheckedChange={setShowActivity} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-64">
              {/* Placeholder for map - in a real app, this would be an actual map component */}
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden border-2 border-dashed border-muted-foreground/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">Interactive Map Coming Soon</p>
                    <p className="text-sm text-muted-foreground">
                      See friends and community activity worldwide
                    </p>
                  </div>
                </div>
                
                {/* Mock map markers */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="absolute top-8 right-12 w-3 h-3 bg-secondary rounded-full animate-pulse" />
                <div className="absolute bottom-12 left-16 w-3 h-3 bg-success rounded-full animate-pulse" />
                <div className="absolute bottom-8 right-8 w-3 h-3 bg-warning rounded-full animate-pulse" />
                <div className="absolute top-16 left-1/3 w-3 h-3 bg-primary rounded-full animate-pulse" />
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-2 rounded-lg border">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>Active Now</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                      <span>Active Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Friends Locations List */}
          {viewMode === 'friends' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Friends Locations
                </CardTitle>
                <CardDescription>See where your friends are active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {friendsWithLocations.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>{friend.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground">{friend.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{friend.city}, {friend.country}</span>
                          </div>
                          {showActivity && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {friend.activity} • {friend.lastActive}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{friend.streakDays} day streak</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control your location visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {privacyVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="text-sm font-medium">Show my location</span>
                </div>
                <Switch 
                  checked={privacyVisible} 
                  onCheckedChange={setPrivacyVisible}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, friends can see your general location on the map
              </p>
            </CardContent>
          </Card>

          {/* Global Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Global Statistics
              </CardTitle>
              <CardDescription>Community activity worldwide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-medium">{globalStats.totalUsers.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Today</span>
                    <span className="font-medium text-success">{globalStats.activeToday.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Habits Completed</span>
                    <span className="font-medium">{globalStats.totalHabitsCompleted.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>Most active communities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {globalStats.topCountries.map((country, index) => (
                  <div key={country.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium">{country.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {country.users.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map Features */}
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Exciting map features in development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Real-time activity heatmap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span>Local meetup suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span>Regional challenges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span>Interactive friend profiles</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapSection;