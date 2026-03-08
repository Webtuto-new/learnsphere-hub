import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Play, Users, ArrowRight, Star } from "lucide-react";
import ClassCard from "@/components/ClassCard";
import { sampleClasses, curriculumData } from "@/data/sampleData";

const stats = [
  { icon: Users, label: "Active Students", value: "5,000+" },
  { icon: GraduationCap, label: "Expert Tutors", value: "200+" },
  { icon: BookOpen, label: "Courses", value: "500+" },
  { icon: Play, label: "Recordings", value: "1,200+" },
];

const Index = () => {
  return (
    <Layout>
      <SEOHead title="Webtuto" description="Sri Lanka's #1 online learning platform. Live classes, expert tutors, and comprehensive courses for National, Cambridge & Edexcel syllabuses." path="/" />
      <section className="hero-gradient relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-primary-foreground/80">
              <Star className="w-4 h-4 text-accent" />
              Sri Lanka's #1 Online Learning Platform
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight">
              Learn Smarter with{" "}
              <span className="text-accent">Webtuto</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto">
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
                <stat.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="font-display font-bold text-2xl text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
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
            {Object.entries(curriculumData).map(([key, cur]) => (
              <Link
                key={key}
                to={`/curriculum?tab=${key}`}
                className="bg-card rounded-xl p-6 card-elevated text-center group"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <GraduationCap className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{cur.name}</h3>
                <p className="text-sm text-muted-foreground">{cur.grades.length} grade levels</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Classes */}
      <section className="py-20 bg-muted/50">
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
            {sampleClasses.slice(0, 6).map((cls) => (
              <ClassCard key={cls.id} {...cls} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/classes">
              <Button variant="outline">View All Classes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="hero-gradient rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
                Ready to Start Learning?
              </h2>
              <p className="text-primary-foreground/70 max-w-xl mx-auto">
                Join Webtuto today and get access to the best tutors in Sri Lanka
              </p>
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-base">
                  Sign Up Now — It's Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
