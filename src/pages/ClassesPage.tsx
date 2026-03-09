import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ClassCard from "@/components/ClassCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const ClassesPage = () => {
  const [searchParams] = useSearchParams();
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectMeta, setSubjectMeta] = useState<{ name: string; gradeName: string } | null>(null);

  const subjectSlug = searchParams.get("subject");
  const gradeSlug = searchParams.get("grade");

  useEffect(() => {
    const fetchClasses = async () => {
      let q = supabase.from("classes").select("*, teachers(name), curriculums(name), grades(name, slug), subjects(name, slug)")
        .eq("is_active", true).order("created_at", { ascending: false });

      const { data } = await q;
      let classes = data || [];

      // Filter by subject/grade slugs if provided
      if (subjectSlug) {
        classes = classes.filter(c => c.subjects?.slug === subjectSlug);
      }
      if (gradeSlug) {
        classes = classes.filter(c => c.grades?.slug === gradeSlug);
      }

      setDbClasses(classes);

      // Get subject/grade names for header
      if (subjectSlug && classes.length > 0) {
        const first = classes[0];
        setSubjectMeta({ name: first.subjects?.name || subjectSlug, gradeName: first.grades?.name || "" });
      } else if (subjectSlug) {
        // Fetch from subjects table directly
        const { data: subData } = await supabase.from("subjects").select("name, grade_id").eq("slug", subjectSlug).maybeSingle();
        if (subData) {
          const { data: gradeData } = await supabase.from("grades").select("name").eq("id", subData.grade_id).maybeSingle();
          setSubjectMeta({ name: subData.name, gradeName: gradeData?.name || "" });
        }
      } else {
        setSubjectMeta(null);
      }
    };
    fetchClasses();
  }, [subjectSlug, gradeSlug]);

  const filtered = dbClasses.filter(c => {
    const matchesQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || (c.teachers?.name || "").toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || c.class_type === typeFilter;
    return matchesQuery && matchesType;
  });

  const types = ["all", "monthly", "hourly", "seminar", "workshop", "bundle", "recording"];

  const pageTitle = subjectMeta ? `${subjectMeta.name} — ${subjectMeta.gradeName}` : "All Classes";
  const pageDesc = subjectMeta ? `Browse ${subjectMeta.name} classes for ${subjectMeta.gradeName}` : "Browse live classes, seminars, workshops and more";

  return (
    <Layout>
      <SEOHead title={pageTitle} description={pageDesc} path="/classes" />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{pageTitle}</h1>
            <p className="text-muted-foreground">{pageDesc}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search classes..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {types.map(t => (
                <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)} className="capitalize">
                  {t === "all" ? "All" : t}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{filtered.length} classes found</p>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c) => (
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
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No classes available yet</p>
              <p className="text-sm mt-1">Check back soon for new classes!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClassesPage;
