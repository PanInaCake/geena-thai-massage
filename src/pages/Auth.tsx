import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Account created! You can now log in.");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Logged in successfully!");
      navigate("/booking");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="gradient-hero py-16 pt-32 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold font-serif text-primary-foreground mb-4 animate-fade-in">
            Welcome Back
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Sign in to manage your bookings
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-md">
          <Card className="shadow-gold animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Account Access</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="transition-smooth focus:scale-[1.01]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="transition-smooth focus:scale-[1.01]"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="accent" 
                      className="w-full transition-elegant hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="transition-smooth focus:scale-[1.01]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="transition-smooth focus:scale-[1.01]"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="accent" 
                      className="w-full transition-elegant hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Auth;
