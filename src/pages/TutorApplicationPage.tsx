import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { sendEmail, emailTemplates } from "@/lib/email";

const TutorApplicationPage = () => {
  const { user } = useAuth();
  const [agreed, setAgreed] = useState({ payment: false, fee: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed.payment || !agreed.fee) {
      toast.error("Please agree to all terms before submitting.");
      return;
    }

    setLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subjects = formData.get("subjects") as string;

    // Insert into database
    const { error } = await supabase.from("tutor_applications").insert({
      name,
      email,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      age: parseInt(formData.get("age") as string) || null,
      teaching_experience: formData.get("experience") as string,
      subjects_can_teach: subjects,
      max_grade_level: formData.get("maxGrade") as string,
      online_teaching_years: parseInt(formData.get("onlineYears") as string) || 0,
      agreed_payment_terms: agreed.payment,
      agreed_platform_fee: agreed.fee,
      user_id: user?.id || null,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to submit application. " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Application submitted successfully! We'll review it shortly.");

    // Send confirmation email to applicant
    try {
      const appEmail = emailTemplates.tutorApplicationReceived(name);
      await sendEmail({ to: email, subject: appEmail.subject, html: appEmail.html });
    } catch (e) {
      console.error("Tutor application email failed:", e);
    }

    setLoading(false);
    form.reset();
    setAgreed({ payment: false, fee: false });
  };

  return (
    <Layout>
      <SEOHead title="Become a Tutor" description="Join Webtuto and teach thousands of students across Sri Lanka." path="/tutor-application" />
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
                <Input id="name" name="name" name="name" name="name" name="name" name="name" name="name" placeholder="Your full name" required />
              </div>
              <div className="space-y-2">
                <Labename="age" l htmlFor="aname="age" ge">Age</Labname="age" el>
        name="age"         <Inpname="age" ut id="age" type="number" placeholder="Your age" required />
              </div>
            </div>

            <div className="space-y-2name="address" ">
              <Labelname="address"  htmlFor="address">Addrname="address" ess</Label>
           name="address"    <Input id="address" placeholder="Your address" required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <name="email" div className="space-y-2">
           name="email"      <Label htmlFor="email">Email</Labname="email" el>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>
              <div className="spacname="phone" e-y-2">
                <Label htmlFor="phone">Phonname="phone" e Number</Label>
                <Input id="phone" placeholder="+94 XX XXX XXXX" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Teacname="experience" hing Experience</Label>
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
