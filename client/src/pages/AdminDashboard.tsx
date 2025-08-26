import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  Music, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Edit,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!authLoading && user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin privileges required.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, authLoading, isAuthenticated, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  const { data: battles = [] } = useQuery({
    queryKey: ["/api/battles"],
    enabled: user?.role === 'admin',
  });

  const { data: topArtists = [] } = useQuery({
    queryKey: ["/api/leaderboard/artists", "10"],
    enabled: user?.role === 'admin',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { stripeAccountId?: string }) => {
      await apiRequest("POST", "/api/admin/settings", settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Admin settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleBankLink = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const stripeAccountId = formData.get('stripeAccountId') as string;
    
    if (!stripeAccountId.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid Stripe Account ID.",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({ stripeAccountId });
  };

  // Show loading state while checking authentication
  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black">
      <Navigation />
      
      <main className="pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-orbitron font-bold text-4xl mb-2">
              <span className="bg-gradient-to-r from-electric-orange to-neon-cyan bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>
            <p className="text-gray-400">Platform analytics and management</p>
          </div>

          {/* Stats Overview */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-morphism animate-pulse" data-testid={`skeleton-stat-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-8 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card className="glass-morphism border-neon-cyan/30" data-testid="stat-total-users">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-neon-cyan mx-auto mb-2" />
                  <div className="text-3xl font-bold text-neon-cyan mb-2">
                    {stats?.totalUsers?.toLocaleString() || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Total Users</div>
                  <div className="text-sm text-neon-green mt-1">↗ +15% this month</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism border-neon-magenta/30" data-testid="stat-active-battles">
                <CardContent className="p-6 text-center">
                  <Music className="h-8 w-8 text-neon-magenta mx-auto mb-2" />
                  <div className="text-3xl font-bold text-neon-magenta mb-2">
                    {stats?.activeBattles || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Active Battles</div>
                  <div className="text-sm text-neon-green mt-1">↗ +8% this week</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism border-neon-purple/30" data-testid="stat-revenue">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-neon-purple mx-auto mb-2" />
                  <div className="text-3xl font-bold text-neon-purple mb-2">
                    ${stats?.revenue?.toLocaleString() || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Monthly Revenue</div>
                  <div className="text-sm text-neon-green mt-1">↗ +22% this month</div>
                </CardContent>
              </Card>
              
              <Card className="glass-morphism border-neon-green/30" data-testid="stat-conversions">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-neon-green mx-auto mb-2" />
                  <div className="text-3xl font-bold text-neon-green mb-2">
                    {stats?.trialConversions || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Active Subscriptions</div>
                  <div className="text-sm text-electric-orange mt-1">↘ Stable</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Battle Management */}
            <Card className="glass-morphism" data-testid="battle-management">
              <CardHeader>
                <CardTitle className="text-neon-cyan flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Battle Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {battles.slice(0, 5).map((battle: any) => (
                    <div key={battle.id} className="flex items-center justify-between p-4 bg-medium-gray rounded-lg" data-testid={`battle-item-${battle.id}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center">
                          <Music className="h-5 w-5 text-black" />
                        </div>
                        <div>
                          <div className="font-semibold">{battle.title}</div>
                          <div className="text-sm text-gray-400">{battle.genre?.name || "Unknown Genre"}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-neon-green text-black">
                          {battle.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="text-neon-cyan hover:text-white" data-testid={`button-edit-battle-${battle.id}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-6 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black" 
                  variant="outline"
                  data-testid="button-view-all-battles"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View All Battles
                </Button>
              </CardContent>
            </Card>

            {/* User Management */}
            <Card className="glass-morphism" data-testid="user-management">
              <CardHeader>
                <CardTitle className="text-neon-magenta flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Artists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topArtists.slice(0, 5).map((artist: any, index: number) => (
                    <div key={artist.user.id} className="flex items-center justify-between p-4 bg-medium-gray rounded-lg" data-testid={`artist-item-${artist.user.id}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center font-bold text-black">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{artist.user.username || 'Unknown'}</div>
                          <div className="text-sm text-gray-400">{artist.totalVotes} total votes</div>
                        </div>
                      </div>
                      <Badge className="bg-neon-cyan text-black">
                        {artist.user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-6 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black" 
                  variant="outline"
                  data-testid="button-view-all-users"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Financial Settings */}
          <Card className="glass-morphism" data-testid="financial-settings">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Financial Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Stripe Connect Account</h4>
                  <form onSubmit={handleBankLink} className="space-y-4">
                    <div className="flex space-x-4">
                      <Input 
                        name="stripeAccountId"
                        placeholder="acct_1234567890" 
                        className="bg-medium-gray border-gray-600 focus:border-neon-green"
                        data-testid="input-stripe-account"
                      />
                      <Button 
                        type="submit" 
                        className="bg-neon-green text-black hover:shadow-neon-green"
                        disabled={updateSettingsMutation.isPending}
                        data-testid="button-link-bank"
                      >
                        {updateSettingsMutation.isPending ? "Linking..." : "Link Bank"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">Monthly payouts processed automatically</p>
                  </form>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Revenue Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subscriptions:</span>
                      <span className="text-neon-cyan font-semibold">${((stats?.revenue || 0) * 0.7).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ad Slots:</span>
                      <span className="text-neon-magenta font-semibold">${((stats?.revenue || 0) * 0.25).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fees:</span>
                      <span className="text-electric-orange font-semibold">-${((stats?.revenue || 0) * 0.05).toFixed(0)}</span>
                    </div>
                    <hr className="border-gray-600" />
                    <div className="flex justify-between font-bold">
                      <span>Net Revenue:</span>
                      <span className="text-neon-green">${(stats?.revenue || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
