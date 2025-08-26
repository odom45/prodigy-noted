import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Users, Trophy, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-black via-charcoal to-dark-gray">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center font-orbitron font-bold text-black">
                PN
              </div>
              <span className="font-orbitron font-bold text-xl">Prodigy Noted</span>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:shadow-neon-cyan"
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple" data-testid="badge-beta">
              Beta Launch - Join the Movement
            </Badge>
          </div>
          
          <h1 className="font-orbitron font-bold text-5xl md:text-7xl mb-6 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent">
            Music Battles
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Where artists compete, listeners vote, and music discovers its next breakthrough moment. 
            Join the platform that's revolutionizing music discovery through community-driven battles.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg"
              onClick={handleLogin}
              className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold text-lg px-8 py-4 hover:shadow-neon-cyan transform hover:scale-105 transition-all duration-300"
              data-testid="button-join-now"
            >
              <Music className="mr-2 h-5 w-5" />
              Join the Battle
            </Button>
            <p className="text-sm text-gray-400">
              Free to listen • $4.99/month to compete
            </p>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="glass-morphism border-neon-cyan/30 hover:border-neon-cyan/60 transition-all duration-300" data-testid="card-feature-vote">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Community Voting</h3>
                <p className="text-gray-400">Every listener's vote matters. Discover new talent and support your favorites.</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-neon-magenta/30 hover:border-neon-magenta/60 transition-all duration-300" data-testid="card-feature-compete">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-neon-magenta mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Fair Competition</h3>
                <p className="text-gray-400">Genre-based battles ensure fair matchups. Rise through the ranks authentically.</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism border-neon-green/30 hover:border-neon-green/60 transition-all duration-300" data-testid="card-feature-earn">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-neon-green mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Real Rewards</h3>
                <p className="text-gray-400">Prize pools, exposure, and direct monetization for top-performing artists.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Genre Showcase */}
      <section className="py-20 px-4 bg-charcoal/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-orbitron font-bold text-4xl mb-8">
            <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
              Battle by Genre
            </span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { name: "Hip-Hop", slots: 23, available: true },
              { name: "Electronic", slots: 0, available: false },
              { name: "R&B", slots: 45, available: true },
              { name: "Rock", slots: 12, available: true },
              { name: "Pop", slots: 8, available: true },
              { name: "Jazz", slots: 34, available: true },
              { name: "Country", slots: 15, available: true },
              { name: "Classical", slots: 67, available: true },
            ].map((genre) => (
              <Card 
                key={genre.name}
                className={`glass-morphism transition-all duration-300 ${
                  genre.available 
                    ? "border-neon-cyan/30 hover:border-neon-cyan cursor-pointer" 
                    : "border-gray-600 opacity-50"
                }`}
                data-testid={`card-genre-${genre.name.toLowerCase()}`}
              >
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold mb-2">{genre.name}</h4>
                  <p className="text-sm">
                    {genre.available ? (
                      <span className="text-neon-green">{genre.slots} slots left</span>
                    ) : (
                      <span className="text-electric-orange">Full</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-gray-400 mb-8">
            First month free for genre pioneers. Limited slots available.
          </p>

          <Button 
            onClick={handleLogin}
            className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white font-bold px-8 py-3 hover:shadow-neon-purple"
            data-testid="button-claim-spot"
          >
            Claim Your Spot
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta flex items-center justify-center font-orbitron font-bold text-black text-sm">
              PN
            </div>
            <span className="font-orbitron font-bold text-lg">Prodigy Noted</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Where music battles meet community-driven discovery
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <a href="/public/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/public/legal.html" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/public/disclaimer.html" className="hover:text-white transition-colors">Legal Notice</a>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            &copy; 2024 Prodigy Noted. All rights reserved. Built for artists, by artists.
          </p>
        </div>
      </footer>
    </div>
  );
}
