import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Headphones, ShieldCheck, Users } from "lucide-react";
import type { Track, Battle as BattleType, User as UserType, Genre } from "@shared/schema";

type BattleWithRelations = BattleType & {
  creator?: UserType | null;
  genre?: Genre | null;
};

interface BattleCardProps {
  battle: BattleWithRelations;
  "data-testid"?: string;
}

function formatTimeRemaining(endsAt: Date | string): string {
  const remaining = new Date(endsAt).getTime() - Date.now();
  if (remaining <= 0) return "Ended";
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export default function BattleCard({ battle, "data-testid": testId }: BattleCardProps) {
  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ["/api/battles", battle.id, "tracks"],
  });

  return (
    <Card className="battle-card glass-morphism rounded-2xl p-6" data-testid={testId}>
      <CardContent className="space-y-5 p-0">
        <header className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-neon-cyan">
            <AvatarImage src={battle.creator?.profileImageUrl ?? undefined} alt={battle.creator?.username ?? "Artist"} />
            <AvatarFallback className="bg-neon-cyan text-black">
              {battle.creator?.username?.[0]?.toUpperCase() ?? "P"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{battle.title}</h3>
            <p className="text-sm text-gray-400">
              {battle.creator?.username ?? "Prodigy artist"} · {battle.genre?.name ?? "Open genre"}
            </p>
          </div>
          <Badge className="bg-neon-cyan/15 text-neon-cyan">
            {battle.status ?? "pending"}
          </Badge>
        </header>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Head-to-head entries</h4>
            <span className="text-xs text-gray-400">{tracks.length}/2 tracks submitted</span>
          </div>
          {isLoading ? (
            <div className="rounded-lg bg-charcoal p-4 text-sm text-gray-400">Loading entries…</div>
          ) : tracks.length === 0 ? (
            <div className="rounded-lg bg-charcoal p-4 text-sm text-gray-400">No tracks have been submitted yet.</div>
          ) : (
            tracks.slice(0, 2).map((track, index) => (
              <div key={track.id} className="rounded-lg border border-gray-700 bg-charcoal p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Side {index === 0 ? "A" : "B"} · {track.title}</span>
                  <span className="text-xs text-gray-400">
                    {track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}` : "Duration pending"}
                  </span>
                </div>
                {track.audioUrl ? (
                  <audio className="w-full" controls preload="none" src={track.audioUrl}>
                    Your browser does not support audio playback.
                  </audio>
                ) : (
                  <p className="text-xs text-gray-500">Audio playback is not available for this entry yet.</p>
                )}
              </div>
            ))
          )}
          {tracks.length < 2 && (
            <p className="text-xs text-gray-500">The second entry is required before this can become a valid head-to-head battle.</p>
          )}
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-200">Fair-listening voting is being rebuilt</p>
              <p className="mt-1 text-xs text-gray-400">
                Votes will open when the server can verify at least 50% listening time for both sides. Free members will be able to vote.
              </p>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-gray-700 pt-4 text-sm text-gray-400">
          <span className="flex items-center gap-2"><Headphones className="h-4 w-4" /> Listen and discover</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatTimeRemaining(battle.endsAt)}</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {tracks.length}/2</span>
        </footer>
      </CardContent>
    </Card>
  );
}
