import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { BookOpen, UserPlus, CreditCard, Video } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Account", desc: "Sign up with your email and get your unique admission number." },
  { icon: BookOpen, title: "Browse Classes", desc: "Explore classes by curriculum, grade, and subject." },
  { icon: CreditCard, title: "Purchase & Enroll", desc: "Choose your plan and make a secure payment." },
  { icon: Video, title: "Join & Learn", desc: "Attend live classes via Zoom and access recordings anytime." },
];

const HowToUsePage = () => (
  <Layout>
    <SEOHead title="How To Use Webtuto" description="Get started with Webtuto in a few simple steps." path="/how-to-use" />
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">How To Use Webtuto</h1>
          <p className="text-muted-foreground">Get started in just a few simple steps</p>
        </div>
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-4 bg-card rounded-xl p-6 card-elevated">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <step.icon className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Step {i + 1}: {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default HowToUsePage;
