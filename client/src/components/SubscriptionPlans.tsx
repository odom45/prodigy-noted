import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Headphones, 
  Mic, 
  Gift, 
  Check, 
  X, 
  Share,
  Users,
  CreditCard
} from "lucide-react";

interface SubscriptionPlansProps {
  user: any;
  "data-testid"?: string;
}

export default function SubscriptionPlans({ user, "data-testid": testId }: SubscriptionPlansProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [trialDialogOpen, setTrialDialogOpen] = useState(false);
  const [socialPost, setSocialPost] = useState("");

  const { data: genres = [] } = useQuery({
    queryKey: ["/api/genres"],
  });

  const trialMutation = useMutation({
    mutationFn: async (data: { genreId: string; socialPostUrl: string }) => {
      // First create referral
      await apiRequest("POST", "/api/referrals", {
        referredUserId: user.id,
        socialPostUrl: data.socialPostUrl,
      });
      
      // Then grant trial slot
      await apiRequest("POST", "/api/trial-slots", {
        genreId: data.genreId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Free Trial Activated!",
        description: "You now have full Participant access for 30 days.",
      });
      setTrialDialogOpen(false);
      setSocialPost("");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Trial Activation Failed",
        description: "Unable to activate trial. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = () => {
    window.location.href = "/subscribe";
  };

  const handleTrialSignup = () => {
    const availableGenres = genres.filter((g: any) => g.maxTrialSlots > g.filledTrialSlots);
    
    if (availableGenres.length === 0) {
      toast({
        title: "No Trial Slots Available",
        description: "All genre trial slots are currently full. Try upgrading directly.",
        variant: "destructive",
      });
      return;
    }
    
    setTrialDialogOpen(true);
  };

  const handleTrialSubmit = () => {
    if (!socialPost.trim()) {
      toast({
        title: "Social Post Required",
        description: "Please paste the URL of your social media post.",
        variant: "destructive",
      });
      return;
    }

    const availableGenres = genres.filter((g: any) => g.maxTrialSlots > g.filledTrialSlots);
    const randomGenre = availableGenres[Math.floor(Math.random() * availableGenres.length)];

    trialMutation.mutate({
      genreId: randomGenre.id,
      socialPostUrl: socialPost,
    });
  };

  const getCurrentPlanSavings = () => {
    if (user?.subscriptionStatus === 'trial') {
      return { amount: 4.99, description: "with your free trial month" };
    }
    return { amount: 0, description: "" };
  };

  const savings = getCurrentPlanSavings();

  return (
    <div className="max-w-6xl mx-auto" data-testid={testId}>
      <h2 className="font-orbitron font-bold text-4xl text-center mb-4">
        <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
          Choose Your Journey
        </span>
      </h2>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        From voting on your favorites to becoming the next breakthrough artist
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Listener Plan */}
        <Card className="glass-morphism border border-gray-600 hover:border-neon-cyan transition-all duration-300" data-testid="plan-listener">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-400 flex items-center justify-center">
              <Headphones className="text-2xl text-white h-8 w-8" />
            </div>
            <h3 className="font-orbitron font-bold text-2xl mb-2">Listener</h3>
            <div className="text-4xl font-bold mb-2">Free</div>
            <p className="text-gray-400 mb-8">Forever</p>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Vote on all battles</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Browse all genres</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>View leaderboards</span>
              </li>
              <li className="flex items-center space-x-3">
                <X className="h-5 w-5 text-gray-500" />
                <span className="text-gray-500">Submit tracks</span>
              </li>
            </ul>
            
            <Button 
              variant="outline"
              className="w-full border-gray-500 hover:border-neon-cyan"
              disabled={user?.role === 'listener'}
              data-testid="button-listener-plan"
            >
              {user?.role === 'listener' ? 'Current Plan' : 'Downgrade'}
            </Button>
          </CardContent>
        </Card>

        {/* Participant Plan (Featured) */}
        <Card className="glass-morphism border-2 border-neon-cyan relative transform hover:scale-105 transition-all duration-300" data-testid="plan-participant">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold">
              MOST POPULAR
            </Badge>
          </div>
          
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center">
              <Mic className="text-2xl text-black h-8 w-8" />
            </div>
            <h3 className="font-orbitron font-bold text-2xl mb-2">Participant</h3>
            <div className="text-4xl font-bold mb-2">$4.99</div>
            <p className="text-gray-400 mb-2">per month</p>
            <p className="text-sm text-neon-green mb-6">$49/year (save $10)</p>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Everything in Listener</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Submit unlimited tracks</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Earn prize money</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Artist storefront</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>BandLab integration</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold hover:shadow-neon-cyan"
              disabled={user?.subscriptionStatus === 'active'}
              data-testid="button-upgrade"
            >
              {user?.subscriptionStatus === 'active' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Current Plan
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Trial Plan */}
        <Card className="glass-morphism border border-neon-purple hover:border-neon-magenta transition-all duration-300" data-testid="plan-trial">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center justify-center">
              <Gift className="text-2xl text-white h-8 w-8" />
            </div>
            <h3 className="font-orbitron font-bold text-2xl mb-2">Free Trial</h3>
            <div className="text-4xl font-bold mb-2">1 Month</div>
            <p className="text-gray-400 mb-8">Via social post</p>
            
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>Full Participant access</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="h-5 w-5 text-neon-green" />
                <span>30-day trial period</span>
              </li>
              <li className="flex items-center space-x-3">
                <Share className="h-5 w-5 text-neon-purple" />
                <span>Share referral post</span>
              </li>
              <li className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-neon-purple" />
                <span>Help grow community</span>
              </li>
            </ul>
            
            <Button 
              onClick={handleTrialSignup}
              className="w-full border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
              variant="outline"
              disabled={user?.subscriptionStatus === 'trial'}
              data-testid="button-trial-signup"
            >
              {user?.subscriptionStatus === 'trial' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Active Trial
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Get Free Month
                </>
              )}
            </Button>
            
            <div className="mt-4 p-3 bg-charcoal rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                Post about Prodigy Noted with your referral code to unlock
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Display */}
      {savings.amount > 0 && (
        <div className="text-center">
          <Card className="glass-morphism max-w-md mx-auto" data-testid="savings-display">
            <CardContent className="p-6 text-center">
              <h4 className="font-bold text-lg mb-2 text-neon-green">💰 You Save</h4>
              <p className="text-3xl font-bold text-neon-green mb-2">${savings.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-400">{savings.description}</p>
              <p className="text-xs text-gray-300 mt-2">Next month: $4.99 or upgrade to annual for $49</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trial Signup Dialog */}
      <Dialog open={trialDialogOpen} onOpenChange={setTrialDialogOpen}>
        <DialogContent className="glass-morphism border-neon-purple" data-testid="trial-dialog">
          <DialogHeader>
            <DialogTitle className="text-neon-purple">Activate Free Trial</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-400">
              To activate your free trial, share this post on your social media:
            </p>
            
            <Card className="bg-charcoal p-4">
              <p className="text-sm">
                "🎶 I just joined #ProdigyNoted — the music battle app where listeners vote and artists rise. 
                Try it free with my code: PN-START-{user?.id?.slice(-6)} 🎧🔥"
              </p>
            </Card>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Paste your social media post URL:
              </label>
              <Textarea
                value={socialPost}
                onChange={(e) => setSocialPost(e.target.value)}
                placeholder="https://twitter.com/yourpost or https://instagram.com/p/yourpost"
                className="bg-medium-gray border-gray-600 focus:border-neon-purple"
                data-testid="textarea-social-post"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setTrialDialogOpen(false)}
                className="flex-1"
                data-testid="button-cancel-trial"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTrialSubmit}
                disabled={trialMutation.isPending}
                className="flex-1 bg-neon-purple hover:bg-neon-purple/80"
                data-testid="button-submit-trial"
              >
                {trialMutation.isPending ? "Activating..." : "Activate Trial"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
