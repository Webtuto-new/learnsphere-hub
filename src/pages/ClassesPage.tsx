import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ClassCard from "@/components/ClassCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";

const ClassesPage = () => {
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    supabase.from("classes").select("*, teachers(name), curriculums(name), grades(name), subjects(name)")
      .eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => setDbClasses(data || []));
  }, []);

  const filtered = dbClasses.filter(c => {
    const matchesQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || (c.teachers?.name || "").toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || c.class_type === typeFilter;
    return matchesQuery && matchesType;
  });

  const types = ["all", "monthly", "seminar", "workshop", "bundle", "recording"];

  return (
    <Layout>
      <SEOHead title="All Classes" description="Browse live classes, seminars, workshops and more on Webtuto." path="/classes" />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">All Classes</h1>
            <p className="text-muted-foreground">Browse live classes, seminars, workshops and more</p>
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
