import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface Genre {
  id: string;
  name: string;
  maxTrialSlots: number;
  filledTrialSlots: number;
}

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
  "data-testid"?: string;
}

export default function GenreSelector({ 
  genres, 
  selectedGenre, 
  onGenreSelect,
  "data-testid": testId 
}: GenreSelectorProps) {
  
  const getAvailableSlots = (genre: Genre) => {
    return Math.max(0, genre.maxTrialSlots - genre.filledTrialSlots);
  };

  const getSlotStatus = (genre: Genre) => {
    const available = getAvailableSlots(genre);
    if (available === 0) {
      return { text: "Full", color: "text-electric-orange" };
    }
    return { text: `${available} slots left`, color: "text-neon-green" };
  };

  return (
    <div className="mb-12" data-testid={testId}>
      <h3 className="text-lg font-semibold mb-4 text-neon-cyan">Choose Your Genre</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {/* All Genres Button */}
        <Button
          variant={selectedGenre === "" ? "default" : "outline"}
          onClick={() => onGenreSelect("")}
          className={`px-6 py-2 rounded-full transition-all duration-300 ${
            selectedGenre === ""
              ? "bg-neon-cyan text-black hover:shadow-neon-cyan"
              : "glass-morphism border-gray-500 hover:border-neon-cyan"
          }`}
          data-testid="button-genre-all"
        >
          All Genres
        </Button>

        {/* Individual Genre Buttons */}
        {genres.map((genre) => {
          const slotStatus = getSlotStatus(genre);
          const isSelected = selectedGenre === genre.id;
          const isFull = getAvailableSlots(genre) === 0;
          
          return (
            <Button
              key={genre.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onGenreSelect(genre.id)}
              disabled={isFull}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                isSelected
                  ? "bg-neon-cyan text-black hover:shadow-neon-cyan"
                  : isFull
                  ? "glass-morphism border-gray-600 opacity-50 cursor-not-allowed"
                  : "glass-morphism border-neon-cyan hover:bg-neon-cyan hover:text-black"
              }`}
              data-testid={`button-genre-${genre.name.toLowerCase()}`}
            >
              <span className="flex items-center gap-2">
                {genre.name}
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${slotStatus.color} bg-transparent border-0 p-0`}
                >
                  ({slotStatus.text})
                </Badge>
              </span>
            </Button>
          );
        })}
      </div>
      
      {selectedGenre && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Showing battles in{" "}
            <span className="text-neon-cyan font-semibold">
              {genres.find(g => g.id === selectedGenre)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
