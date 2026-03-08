import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ClassCard from "@/components/ClassCard";
import { supabase } from "@/integrations/supabase/client";
import { sampleClasses } from "@/data/sampleData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const ClassesPage = () => {
  const [dbClasses, setDbClasses] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("classes").select("*, teachers(name)").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        setDbClasses(data || []);
        setLoaded(true);
      });
  }, []);

  // Convert DB classes to ClassCard format
  const dbCards = dbClasses.map(c => ({
    id: c.id,
    title: c.title,
    thumbnail: c.thumbnail_url,
    curriculum: "National", // TODO: join curriculum name
    grade: "—",
    subject: "—",
    teacherName: c.teachers?.name || "Tutor",
    classType: c.class_type as any,
    price: Number(c.price),
    originalPrice: c.original_price ? Number(c.original_price) : undefined,
    sessionCount: c.duration_minutes ? undefined : 4,
    duration: c.duration_minutes ? `${c.duration_minutes} min` : undefined,
    isLive: c.is_live,
    hasRecording: false,
    description: c.short_description || c.description,
  }));

  // Use DB classes if available, fallback to sample
  const allClasses = dbCards.length > 0 ? dbCards : sampleClasses;

  const filtered = allClasses.filter(c => {
    const matchesQuery = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.teacherName.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "all" || c.classType === typeFilter;
    return matchesQuery && matchesType;
  });

  const types = ["all", "monthly", "seminar", "workshop", "bundle", "recording"];

  return (
    <Layout>
      <SEOHead title="All Classes" description="Browse live classes, seminars, workshops and more on Webtuto." path="/classes" />
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cls) => (
              <ClassCard key={cls.id} {...cls} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No classes match your search.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClassesPage;
