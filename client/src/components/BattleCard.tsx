import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Flame, Play, Pause, Clock, Users, Trophy, DollarSign } from "lucide-react";
import type { Track, Battle as BattleType, User as UserType } from "@shared/schema";

interface BattleCardProps {
  battle: BattleType;
  "data-testid"?: string;
}

export default function BattleCard({ battle, "data-testid": testId }: BattleCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: ["/api/battles", battle.id, "tracks"],
  });

  const { data: voteData } = useQuery<{ count: number }>({
    queryKey: ["/api/tracks", tracks[0]?.id, "votes"],
    enabled: !!tracks[0]?.id,
  });

  const { data: userVote } = useQuery<any>({
    queryKey: ["/api/votes/user", battle.id],
    enabled: !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async (trackId: string) => {
      await apiRequest("POST", "/api/votes", {
        trackId,
        battleId: battle.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Vote Submitted!",
        description: "Your vote has been counted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
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
        title: "Vote Failed",
        description: "Unable to submit vote. Try again later.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (trackId: string) => {
    if (userVote) {
      toast({
        title: "Already Voted",
        description: "You have already voted in this battle.",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(trackId);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio player logic
  };

  const formatTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getContentRating = (trackId: string) => {
    // TODO: Implement content rating lookup
    return "All Ages";
  };

  const mainTrack = tracks[0];
  const voteCount = voteData?.count || 0;
  const hasUserVoted = !!userVote;

  return (
    <Card 
      className="battle-card glass-morphism rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 animate-slide-up"
      data-testid={testId}
    >
      {/* Artist Info */}
      <div className="flex items-center space-x-4 mb-6">
        <Avatar className="h-12 w-12 border-2 border-neon-cyan">
          <AvatarImage src={battle.creator?.profileImageUrl} alt="Artist" />
          <AvatarFallback className="bg-neon-cyan text-black">
            {battle.creator?.username?.[0]?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-semibold text-lg" data-testid="text-artist-name">
            {battle.creator?.username || 'Unknown Artist'}
          </h4>
          <p className="text-sm text-gray-400" data-testid="text-genre">
            {battle.genre?.name || 'Unknown Genre'}
          </p>
        </div>
        <Badge className="bg-neon-green text-black" data-testid="badge-content-rating">
          {getContentRating(mainTrack?.id)}
        </Badge>
      </div>

      {/* Track Player */}
      <div className="mb-6">
        <div className="bg-charcoal rounded-lg p-4 mb-4">
          <h5 className="font-semibold mb-3" data-testid="text-battle-title">
            {battle.title}
          </h5>
          {mainTrack ? (
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={handlePlayPause}
                className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:shadow-neon-cyan"
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1 h-2 bg-gray-700 rounded-full">
                <div className="h-2 bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full w-0"></div>
              </div>
              <span className="text-xs text-gray-400">
                {mainTrack.duration ? `${Math.floor(mainTrack.duration / 60)}:${(mainTrack.duration % 60).toString().padStart(2, '0')}` : '3:42'}
              </span>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tracks submitted yet</p>
          )}
        </div>
      </div>

      {/* Voting Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => mainTrack && handleVote(mainTrack.id)}
            disabled={!mainTrack || hasUserVoted || voteMutation.isPending}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
              hasUserVoted 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:shadow-neon-cyan'
            }`}
            data-testid="button-vote"
          >
            <Flame className="h-4 w-4" />
            <span>{hasUserVoted ? 'Voted' : voteMutation.isPending ? 'Voting...' : 'Vote'}</span>
          </Button>
          <div className="text-center">
            <div className="text-2xl font-bold text-neon-cyan" data-testid="text-vote-count">
              {voteCount}
            </div>
            <div className="text-xs text-gray-400">votes</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Ends in</div>
          <div className="text-lg font-semibold text-neon-magenta flex items-center gap-1" data-testid="text-time-remaining">
            <Clock className="h-4 w-4" />
            {formatTimeRemaining(battle.endsAt)}
          </div>
        </div>
      </div>

      {/* Battle Stats */}
      <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-700 pt-4">
        <div>
          <div className="text-lg font-bold text-neon-cyan" data-testid="text-participants">
            {tracks.length}
          </div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Users className="h-3 w-3" />
            Participants
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-neon-purple" data-testid="text-rank">
            #{Math.floor(Math.random() * 5) + 1}
          </div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Trophy className="h-3 w-3" />
            Current Rank
          </div>
        </div>
        <div>
          <div className="text-lg font-bold text-neon-green" data-testid="text-prize-pool">
            ${parseFloat(battle.prizePool || '0').toFixed(0)}
          </div>
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <DollarSign className="h-3 w-3" />
            Prize Pool
          </div>
        </div>
      </div>
    </Card>
  );
}
