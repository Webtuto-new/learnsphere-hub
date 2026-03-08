import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ClassCard from "@/components/ClassCard";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

const SeminarsPage = () => {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("classes").select("*, teachers(name), curriculums(name), grades(name), subjects(name)")
      .eq("is_active", true).eq("class_type", "seminar").order("created_at", { ascending: false })
      .then(({ data }) => setClasses(data || []));
  }, []);

  return (
    <Layout>
      <SEOHead title="Seminars" description="One-time deep-dive sessions with expert tutors on Webtuto." path="/seminars" />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Seminars</h1>
            <p className="text-muted-foreground">One-time deep-dive sessions with expert tutors</p>
          </div>
          {classes.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((c) => (
                <ClassCard key={c.id} id={c.id} title={c.title} curriculum={c.curriculums?.name || "—"} grade={c.grades?.name || "—"} subject={c.subjects?.name || "—"} teacherName={c.teachers?.name || "Tutor"} classType={c.class_type} price={Number(c.price)} originalPrice={c.original_price ? Number(c.original_price) : undefined} duration={c.duration_minutes ? `${c.duration_minutes} min` : undefined} isLive={c.is_live} description={c.short_description || c.description} thumbnail={c.thumbnail_url} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No seminars available yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SeminarsPage;
