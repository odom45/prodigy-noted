import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Crown, Trophy, Medal, Megaphone, Star } from "lucide-react";

interface LeaderboardProps {
  "data-testid"?: string;
}

export default function Leaderboard({ "data-testid": testId }: LeaderboardProps) {
  const { data: topArtists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ["/api/leaderboard/artists", "10"],
  });

  const { data: topReferrers = [], isLoading: referrersLoading } = useQuery({
    queryKey: ["/api/leaderboard/referrers", "10"],
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black";
      case 1:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-black";
      case 2:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-black";
      default:
        return "bg-gradient-to-r from-neon-cyan to-neon-magenta text-black";
    }
  };

  if (artistsLoading || referrersLoading) {
    return (
      <Card className="glass-morphism" data-testid={testId}>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-6 w-1/2"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center space-x-4 p-4 rounded-lg bg-medium-gray">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                      </div>
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism" data-testid={testId}>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Artists */}
          <div data-testid="top-artists-section">
            <h3 className="font-bold text-xl mb-6 text-neon-cyan flex items-center gap-2">
              🔥 Top Artists
            </h3>
            <div className="space-y-4">
              {topArtists.length > 0 ? (
                topArtists.slice(0, 5).map((artist: any, index: number) => (
                  <div 
                    key={artist.user.id}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-medium-gray hover:bg-opacity-80 transition-all duration-300"
                    data-testid={`artist-rank-${index + 1}`}
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(index)}`}>
                        {index < 3 ? getRankIcon(index) : index + 1}
                      </div>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={artist.user.profileImageUrl} alt={artist.user.username} />
                      <AvatarFallback className="bg-neon-cyan text-black">
                        {artist.user.username?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold" data-testid={`text-artist-name-${index + 1}`}>
                        {artist.user.username || 'Unknown Artist'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {artist.user.role === 'participant' ? 'Participant' : 'Artist'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-neon-cyan" data-testid={`text-artist-votes-${index + 1}`}>
                        {artist.totalVotes?.toLocaleString() || 0}
                      </div>
                      <div className="text-xs text-gray-400">votes</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400" data-testid="no-artists-message">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No artists yet. Be the first to compete!</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Referrers */}
          <div data-testid="top-referrers-section">
            <h3 className="font-bold text-xl mb-6 text-neon-magenta flex items-center gap-2">
              📢 Top Promoters
            </h3>
            <div className="space-y-4">
              {topReferrers.length > 0 ? (
                topReferrers.slice(0, 5).map((referrer: any, index: number) => (
                  <div 
                    key={referrer.user.id}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-medium-gray hover:bg-opacity-80 transition-all duration-300"
                    data-testid={`referrer-rank-${index + 1}`}
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-neon-green to-neon-cyan text-black' :
                        index === 1 ? 'bg-gradient-to-r from-electric-orange to-neon-magenta text-black' :
                        'bg-gradient-to-r from-neon-purple to-neon-cyan text-black'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-black ${
                      index === 0 ? 'bg-neon-green' : 
                      index === 1 ? 'bg-electric-orange' : 
                      'bg-neon-purple'
                    }`}>
                      {index === 0 ? <Megaphone className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold" data-testid={`text-referrer-name-${index + 1}`}>
                        @{referrer.user.username || 'anonymous'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {index === 0 ? 'Community Champion' : 'Promoter'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        index === 0 ? 'text-neon-green' :
                        index === 1 ? 'text-electric-orange' :
                        'text-neon-purple'
                      }`} data-testid={`text-referrer-count-${index + 1}`}>
                        {referrer.referralCount || 0}
                      </div>
                      <div className="text-xs text-gray-400">referrals</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400" data-testid="no-referrers-message">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No referrers yet. Share and earn rewards!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
