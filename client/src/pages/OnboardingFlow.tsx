
```typescript
import { useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import { GenreDropdown } from "@/components/GenreDropdown";
import { SocialPostPrompt } from "@/components/SocialPostPrompt";
import { upgradeToParticipant, confirmSocialPost } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingFlow() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<string>("");
  const [genre, setGenre] = useState<string>("");

  const handleUpgrade = async () => {
    if (role && genre && user) {
      try {
        await upgradeToParticipant(user.id, role as "artist" | "producer", genre);
        toast({
          title: "Upgraded to Participant",
          description: "You have successfully upgraded to a trial participant.",
        });
      } catch {
        toast({
          title: "Upgrade Failed",
          description: "There was an issue upgrading your account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSocialPostConfirm = async () => {
    if (user) {
      try {
        await confirmSocialPost(user.id);
        toast({
          title: "Post Confirmed",
          description: "Your social media post has been confirmed.",
        });
      } catch {
        toast({
          title: "Confirmation Failed",
          description: "Failed to confirm the social media post. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="onboarding-container">
      <RoleSelector onSelect={setRole} />
      <GenreDropdown genres={["Hip-Hop", "Electronic", "R&B", "Rock", "Pop", "Jazz", "Country", "Classical"]} onSelect={setGenre} />
      <SocialPostPrompt onConfirm={handleSocialPostConfirm} />
      <button onClick={handleUpgrade}>Upgrade to Participant</button>
    </div>
  );
}
```
