import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import BattleCard from "@/components/BattleCard";
import Leaderboard from "@/components/Leaderboard";
import GenreSelector from "@/components/GenreSelector";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Music, Plus } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const { data: battles = [], isLoading: battlesLoading } = useQuery({
    queryKey: ["/api/battles", selectedGenre],
    enabled: true,
  });

  const { data: genres = [] } = useQuery({
    queryKey: ["/api/genres"],
  });

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  const handleBandLabConnect = () => {
    // TODO: Implement OAuth flow with BandLab
    alert('Connecting to BandLab...\n(Demo: This would initiate OAuth flow)');
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-orbitron font-bold text-5xl md:text-7xl mb-6 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
              Music Battles
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Where artists compete, listeners vote, and music discovers its next breakthrough moment.
            </p>
            
            {/* Genre Selection */}
            <GenreSelector 
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
              data-testid="genre-selector"
            />
          </div>
        </section>

        {/* Battle Arena */}
        <section id="battles" className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-orbitron font-bold text-4xl text-center mb-12">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                Current Battles
              </span>
            </h2>

            {battlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-morphism rounded-2xl p-6 animate-pulse" data-testid={`skeleton-battle-${i}`}>
                    <div className="h-32 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : battles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {battles.map((battle: any) => (
                  <BattleCard key={battle.id} battle={battle} data-testid={`battle-card-${battle.id}`} />
                ))}
              </div>
            ) : (
              <Card className="glass-morphism max-w-md mx-auto" data-testid="no-battles-message">
                <CardContent className="p-8 text-center">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Active Battles</h3>
                  <p className="text-gray-400 mb-4">
                    {selectedGenre ? "No battles in this genre yet." : "Be the first to start a battle!"}
                  </p>
                  {user?.role === 'participant' && (
                    <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black" data-testid="button-create-battle">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Battle
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submit Your Track (Participant Only) */}
            {user?.role === 'participant' && (
              <div className="mt-12 text-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold text-lg px-8 py-4 hover:shadow-neon-cyan transform hover:scale-105 transition-all duration-300"
                  data-testid="button-submit-track"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Submit Your Track
                </Button>
                <p className="text-sm text-gray-400 mt-2">Import from BandLab or upload directly</p>
              </div>
            )}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="py-16 px-4 bg-gradient-to-r from-charcoal to-dark-gray">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-orbitron font-bold text-4xl text-center mb-12">
              <span className="bg-gradient-to-r from-neon-magenta to-neon-cyan bg-clip-text text-transparent">
                Hall of Fame
              </span>
            </h2>
            <Leaderboard data-testid="leaderboard" />
          </div>
        </section>

        {/* Subscription Plans */}
        {user?.subscriptionStatus !== 'active' && (
          <section id="subscription" className="py-16 px-4">
            <SubscriptionPlans user={user} data-testid="subscription-plans" />
          </section>
        )}

        {/* BandLab Integration Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-orbitron font-bold text-4xl mb-6">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                BandLab Integration
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Import your tracks directly from BandLab and enter battles instantly
            </p>

            <Card className="glass-morphism max-w-2xl mx-auto mb-8" data-testid="bandlab-integration-card">
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-6 mb-8">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center">
                      <span className="font-orbitron font-bold text-2xl text-black">PN</span>
                    </div>
                    <p className="font-semibold">Prodigy Noted</p>
                  </div>
                  
                  <div className="text-4xl text-neon-purple animate-float">
                    <Music />
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <span className="font-bold text-2xl text-white">BL</span>
                    </div>
                    <p className="font-semibold">BandLab</p>
                  </div>
                </div>

                <Button 
                  onClick={handleBandLabConnect}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-8 py-4 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  data-testid="button-connect-bandlab"
                >
                  <Music className="mr-2 h-5 w-5" />
                  Connect BandLab Account
                </Button>
                
                <div className="mt-6 text-sm text-gray-400 space-y-1">
                  <p>✓ Import tracks with one click</p>
                  <p>✓ Maintain your BandLab profile link</p>
                  <p>✓ Cross-promote your content</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center font-orbitron font-bold text-black text-sm">
                  PN
                </div>
                <span className="font-orbitron font-bold text-lg">Prodigy Noted</span>
              </div>
              <p className="text-gray-400 text-sm">
                Where music battles meet community-driven discovery
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-neon-cyan">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#battles" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#subscription" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">BandLab Integration</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-neon-magenta">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="mailto:support@prodigynoted.com" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-neon-purple">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/public/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/public/legal.html" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/public/disclaimer.html" className="hover:text-white transition-colors">Content Ownership</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Prodigy Noted. All rights reserved. Built for artists, by artists.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
