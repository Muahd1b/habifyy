import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  is_visible: boolean;
  updated_at: string;
}

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<(UserLocation & { profile?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return false;
    }

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setHasPermission(true);
          resolve(true);
        },
        (error) => {
          setHasPermission(false);
          toast({
            title: "Location permission denied",
            description: "Please enable location access to see friends on the map.",
            variant: "destructive",
          });
          resolve(false);
        }
      );
    });
  };

  const updateUserLocation = async (latitude: number, longitude: number, isVisible: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude,
          longitude,
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setUserLocation(data);
      toast({
        title: "Location updated",
        description: "Your location has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating location",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCurrentPosition = async (): Promise<{ latitude: number; longitude: number } | null> => {
    const hasPermissions = await requestLocationPermission();
    if (!hasPermissions) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          resolve(null);
        }
      );
    });
  };

  const fetchUserLocation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setUserLocation(data);
    } catch (error: any) {
      console.error('Error fetching user location:', error);
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          *,
          profiles!user_locations_user_id_fkey(
            user_id,
            display_name,
            avatar_url,
            points,
            level
          )
        `)
        .eq('is_visible', true);

      if (error) throw error;
      setNearbyUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching nearby users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocationVisibility = async () => {
    if (!userLocation) return;

    try {
      const { error } = await supabase
        .from('user_locations')
        .update({ is_visible: !userLocation.is_visible })
        .eq('id', userLocation.id);

      if (error) throw error;

      setUserLocation(prev => prev ? { ...prev, is_visible: !prev.is_visible } : null);
      toast({
        title: userLocation.is_visible ? "Location hidden" : "Location shared",
        description: userLocation.is_visible 
          ? "Your location is now private" 
          : "Your location is now visible to friends",
      });
    } catch (error: any) {
      toast({
        title: "Error updating visibility",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserLocation();
    fetchNearbyUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations'
        },
        () => {
          fetchNearbyUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    userLocation,
    nearbyUsers,
    loading,
    hasPermission,
    requestLocationPermission,
    updateUserLocation,
    getCurrentPosition,
    toggleLocationVisibility,
    refetch: {
      userLocation: fetchUserLocation,
      nearbyUsers: fetchNearbyUsers
    }
  };
};