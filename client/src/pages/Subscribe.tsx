import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Shield, Zap } from "lucide-react";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to Prodigy Noted Participant!",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="subscription-form">
      <PaymentElement />
      <Button 
        type="submit"
        className="w-full bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-bold py-3 hover:shadow-neon-cyan"
        disabled={!stripe || !elements}
        data-testid="button-subscribe"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Subscribe Now
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const createSubscription = async () => {
      try {
        const response = await apiRequest("POST", "/api/get-or-create-subscription");
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        toast({
          title: "Subscription Error",
          description: "Failed to initialize subscription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createSubscription();
  }, [user, toast]);

  if (!user) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Setting up your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-deep-black">
        <Navigation />
        <div className="pt-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="glass-morphism border-red-500/30">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-red-400">Subscription Unavailable</h2>
                <p className="text-gray-400 mb-6">
                  Unable to process your subscription at this time. Please try again later.
                </p>
                <Button
                  onClick={() => window.location.href = "/"}
                  className="bg-gray-600 hover:bg-gray-700"
                  data-testid="button-back-home"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black">
      <Navigation />
      
      <div className="pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-orbitron font-bold text-4xl mb-4">
              <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                Complete Your Subscription
              </span>
            </h1>
            <p className="text-gray-400">Join as a Participant and start competing in music battles</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subscription Summary */}
            <Card className="glass-morphism border-neon-cyan/30" data-testid="subscription-summary">
              <CardHeader>
                <CardTitle className="text-neon-cyan">Participant Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="text-5xl font-bold mb-2">$4.99</div>
                  <div className="text-gray-400">per month</div>
                  <Badge className="bg-neon-green text-black mt-2">
                    Save $10 with annual plan
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span>Submit unlimited tracks to battles</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span>Compete for prize money</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span>Create artist storefront</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span>BandLab integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-neon-green" />
                    <span>Analytics dashboard</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment processed by Stripe</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="glass-morphism" data-testid="payment-form-card">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Your payment information is secure and encrypted. 
              We use Stripe for payment processing and never store your credit card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
