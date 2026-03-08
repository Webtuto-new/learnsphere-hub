import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const LoginPage = () => (
  <Layout>
    <div className="pt-28 pb-20 flex items-center justify-center">
      <div className="w-full max-w-md bg-card rounded-xl p-8 card-elevated">
        <h1 className="font-display text-2xl font-bold text-foreground text-center mb-6">Welcome Back</h1>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="email">Email or Username</Label>
            <Input id="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full" size="lg">Log In</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  </Layout>
);

export default LoginPage;
