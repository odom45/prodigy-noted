import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Music2, Users } from "lucide-react";

interface SubscriptionPlansProps {
  user?: unknown;
  "data-testid"?: string;
}

const plans = [
  {
    name: "Free Listener",
    description: "Discover independent music and help decide the battles.",
    icon: Music2,
    benefits: [
      "Browse the rotating music discovery feed",
      "Listen to artists and active battles",
      "Vote in eligible battles at no charge",
      "Build a listener or artist profile",
    ],
  },
  {
    name: "Regular Competitor",
    description: "Unlock solo and crew competition when progression requirements are met.",
    icon: Users,
    benefits: [
      "Paid competition eligibility after XP and win unlocks",
      "Five assigned qualifying votes per participation cycle",
      "One-vote requirement on every third cycle",
      "Access to Regular-tier competition rewards",
    ],
  },
  {
    name: "VIP Competitor",
    description: "The premium competition tier for qualified artists and crews.",
    icon: Crown,
    benefits: [
      "VIP competition eligibility after XP and win unlocks",
      "Three assigned qualifying votes per participation cycle",
      "One-vote requirement on every third cycle",
      "Access to VIP-tier competition rewards",
    ],
  },
];

export default function SubscriptionPlans({ "data-testid": testId }: SubscriptionPlansProps) {
  return (
    <section className="mx-auto max-w-6xl" data-testid={testId}>
      <div className="mb-10 text-center">
        <Badge className="mb-3 border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan">Membership</Badge>
        <h2 className="font-orbitron text-3xl font-bold md:text-4xl">Listen free. Earn your place in the arena.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-400">
          Every member can support artists through voting. Paid membership unlocks competition only after the artist meets the platform's experience, win, participation, and account-standing rules.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.name} className={`glass-morphism border ${index === 2 ? "border-neon-magenta/50" : "border-gray-700"}`}>
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20">
                  <Icon className="h-5 w-5 text-neon-cyan" />
                </div>
                <CardTitle className="font-orbitron text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-neon-green" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">
        Pricing, reward schedules, and full tier terms will be published before paid checkout opens. Subscriptions and competition entry are not available during this rebuild phase.
      </p>
    </section>
  );
}
