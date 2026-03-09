import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Play, Users, ArrowRight, Star, Zap } from "lucide-react";
import ClassCard from "@/components/ClassCard";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { icon: Users, label: "Active Students", value: "5,000+" },
  { icon: GraduationCap, label: "Expert Tutors", value: "200+" },
  { icon: BookOpen, label: "Courses", value: "500+" },
  { icon: Play, label: "Recordings", value: "1,200+" },
];

const Index = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("classes").select("*, teachers(name), curriculums(name), grades(name), subjects(name)")
      .eq("is_active", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => {
        if (!data?.length) {
          // If no featured, get any active classes
          supabase.from("classes").select("*, teachers(name), curriculums(name), grades(name), subjects(name)")
            .eq("is_active", true).order("created_at", { ascending: false }).limit(6)
            .then(({ data: all }) => setClasses(all || []));
        } else {
          setClasses(data);
        }
      });
    supabase.from("curriculums").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setCurriculums(data || []));
  }, []);

  return (
    <Layout>
      <SEOHead title="Webtuto" description="Sri Lanka's #1 online learning platform. Live classes, expert tutors, and comprehensive courses for National, Cambridge & Edexcel syllabuses." path="/" />
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-secondary/10 blur-[100px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent/8 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-primary-foreground/80 border border-primary-foreground/10">
              <Zap className="w-4 h-4 text-accent" />
              Sri Lanka's #1 Online Learning Platform
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              Learn Smarter with{" "}
              <span className="text-gradient-gold">Webtuto.LK</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto leading-relaxed">
              Live classes, expert tutors, and comprehensive courses for National, Cambridge & Edexcel syllabuses. Join thousands of students excelling in their studies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link to="/curriculum">
                <Button variant="hero" size="lg" className="text-base gap-2">
                  Explore Courses <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero-outline" size="lg" className="text-base">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-10 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-5 text-center card-elevated">
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      {curriculums.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Choose Your Curriculum
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We support multiple syllabuses to match your academic path
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {curriculums.map((cur) => (
                <Link
                  key={cur.id}
                  to={`/curriculum?tab=${cur.slug}`}
                  className="bg-card rounded-xl p-6 card-elevated text-center group"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/12 transition-colors">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{cur.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Classes */}
      {classes.length > 0 && (
        <section className="py-20 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Featured Classes
                </h2>
                <p className="text-muted-foreground">Handpicked courses to kickstart your learning</p>
              </div>
              <Link to="/classes" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((c) => (
                <ClassCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  curriculum={c.curriculums?.name || "—"}
                  grade={c.grades?.name || "—"}
                  subject={c.subjects?.name || "—"}
                  teacherName={c.teachers?.name || "Tutor"}
                  classType={c.class_type}
                  price={Number(c.price)}
                  originalPrice={c.original_price ? Number(c.original_price) : undefined}
                  duration={c.duration_minutes ? `${c.duration_minutes} min` : undefined}
                  isLive={c.is_live}
                  description={c.short_description || c.description}
                  thumbnail={c.thumbnail_url}
                />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/classes">
                <Button variant="outline">View All Classes</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="hero-gradient rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-secondary/10 blur-[80px]" />
            </div>
            <div className="relative space-y-8">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
                Ready to Start Learning?
              </h2>
              <p className="text-primary-foreground/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Join Webtuto.LK today and get access to the best tutors in Sri Lanka
              </p>
              <div className="pt-4">
                <Link to="/signup">
                  <Button variant="hero" size="lg" className="text-base px-10 py-6">
                    Sign Up Now — It's Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
