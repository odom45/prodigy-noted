import { Link } from "wouter";
import { ArrowLeft, Music2, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingFlow() {
  return (
    <main className="min-h-screen bg-deep-black px-4 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <Button asChild variant="ghost" className="mb-6 text-gray-300">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prodigy Noted
          </Link>
        </Button>

        <Card className="glass-morphism border-gray-700 bg-charcoal text-white">
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta text-black">
              <Music2 className="h-6 w-6" />
            </div>
            <CardTitle className="font-orbitron text-2xl">Artist onboarding is being rebuilt</CardTitle>
            <CardDescription className="text-gray-300">
              Prodigy Noted is moving to artist profiles, fair music battles, progression-based competition, and collaborative crews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-300">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan" />
              <p>Free members will continue to discover music and vote in eligible battles. A paid subscription will not be required to support artists.</p>
            </div>
            <div className="flex gap-3">
              <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-neon-magenta" />
              <p>Solo and crew competition will require an eligible subscription plus experience, wins, participation, and good account standing.</p>
            </div>
            <p className="rounded-lg border border-gray-700 bg-black/20 p-3">
              This transition page does not change account roles, payment status, or competition eligibility. Those controls will be enforced by the server.
            </p>
            <Button asChild className="bg-gradient-to-r from-neon-cyan to-neon-magenta font-semibold text-black">
              <Link href="/">Return to music discovery</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
