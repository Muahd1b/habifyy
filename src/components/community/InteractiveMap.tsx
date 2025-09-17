import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  
  const { 
    userLocation, 
    nearbyUsers, 
    loading, 
    hasPermission,
    requestLocationPermission,
    updateUserLocation,
    getCurrentPosition,
    toggleLocationVisibility,
    refetch 
  } = useLocation();

  const handleSetLocation = async () => {
    const position = await getCurrentPosition();
    if (position) {
      await updateUserLocation(position.latitude, position.longitude, true);
      refetch.userLocation();
    }
  };

  const initializeMap = async () => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      // For demo purposes, we'll create a simple map interface
      // In a real implementation, you would use Mapbox GL JS here
      const mapDiv = mapContainer.current;
      mapDiv.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Interactive Map</h3>
            <p class="text-sm text-muted-foreground">Map integration ready!</p>
            <p class="text-xs text-muted-foreground mt-2">
              ${nearbyUsers.length} friends visible on map
            </p>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const token = formData.get('token') as string;
    
    if (token) {
      setMapboxToken(token);
      setShowTokenInput(false);
    }
  };

  useEffect(() => {
    if (mapboxToken && !showTokenInput) {
      initializeMap();
    }
  }, [mapboxToken, showTokenInput]);

  if (showTokenInput) {
    return (
      <Card className="p-6">
        <div className="text-center mb-4">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-semibold">Interactive Map</h3>
          <p className="text-sm text-muted-foreground">
            Enter your Mapbox public token to enable the interactive map
          </p>
        </div>
        
        <form onSubmit={handleTokenSubmit} className="space-y-4">
          <div>
            <Label htmlFor="token">Mapbox Public Token</Label>
            <input
              type="text"
              name="token"
              id="token"
              className="w-full p-2 border rounded-lg"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Initialize Map
          </Button>
        </form>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Get your free token at <a href="https://mapbox.com" target="_blank" className="text-primary hover:underline">mapbox.com</a></p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Location Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location Settings
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch.nearbyUsers()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {!hasPermission && (
            <Button onClick={requestLocationPermission} className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Enable Location Access
            </Button>
          )}

          {hasPermission && !userLocation && (
            <Button onClick={handleSetLocation} className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Set My Location
            </Button>
          )}

          {userLocation && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="location-visibility"
                  checked={userLocation.is_visible}
                  onCheckedChange={toggleLocationVisibility}
                />
                <Label htmlFor="location-visibility" className="flex items-center gap-2">
                  {userLocation.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {userLocation.is_visible ? 'Visible to friends' : 'Location private'}
                </Label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Map Container */}
      <Card className="p-4">
        <div 
          ref={mapContainer}
          className="w-full h-96 rounded-lg border"
        />
      </Card>

      {/* Friends List */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          Friends on Map ({nearbyUsers.length})
        </h3>

        <div className="space-y-3">
          {nearbyUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {user.profile?.display_name?.[0] || '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{user.profile?.display_name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {user.profile?.level || 1} • {user.profile?.points || 0} points
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          ))}
          
          {nearbyUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No friends sharing their location yet</p>
              <p className="text-sm">Invite friends to join and share locations!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};