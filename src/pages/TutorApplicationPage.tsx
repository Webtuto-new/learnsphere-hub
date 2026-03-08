import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";

const TutorApplicationPage = () => {
  const [agreed, setAgreed] = useState({ payment: false, fee: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed.payment || !agreed.fee) {
      toast.error("Please agree to all terms before submitting.");
      return;
    }
    toast.success("Application submitted successfully! We'll review it shortly.");
  };

  return (
    <Layout>
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Become a Tutor
            </h1>
            <p className="text-muted-foreground">
              Join Webtuto and share your knowledge with thousands of students across Sri Lanka
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-8 card-elevated space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your full name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Your age" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Your address" required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+94 XX XXX XXXX" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Teaching Experience</Label>
              <Textarea id="experience" placeholder="Describe your teaching experience..." rows={3} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects You Can Teach</Label>
                <Input id="subjects" placeholder="e.g., Maths, Science" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGrade">Maximum Grade Level</Label>
                <Input id="maxGrade" placeholder="e.g., A/L" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="onlineYears">Online Teaching Experience (years)</Label>
              <Input id="onlineYears" type="number" placeholder="0" required />
            </div>

            <div className="space-y-3">
              <Label>Curriculum</Label>
              <div className="flex flex-wrap gap-4">
                {["National", "Cambridge", "Edexcel"].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox /> {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="font-display font-semibold text-foreground">Agreements</h3>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox
                  checked={agreed.payment}
                  onCheckedChange={(v) => setAgreed({ ...agreed, payment: !!v })}
                />
                <span>I understand and agree that I will not receive any payment unless a student books and pays for a session.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <Checkbox
                  checked={agreed.fee}
                  onCheckedChange={(v) => setAgreed({ ...agreed, fee: !!v })}
                />
                <span>I agree that Webtuto may charge a commission or service fee.</span>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Submit Application
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default TutorApplicationPage;
