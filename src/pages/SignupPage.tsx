import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const SignupPage = () => (
  <Layout>
    <div className="pt-28 pb-20 flex items-center justify-center">
      <div className="w-full max-w-md bg-card rounded-xl p-8 card-elevated">
        <h1 className="font-display text-2xl font-bold text-foreground text-center mb-6">Create Account</h1>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="+94 XX XXX XXXX" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="Your address" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm</Label>
              <Input id="confirm" type="password" placeholder="••••••••" required />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg">Sign Up</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  </Layout>
);

export default SignupPage;
