import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Link, useSearchParams } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CurriculumPage = () => {
  const [searchParams] = useSearchParams();
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    supabase.from("curriculums").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => {
        setCurriculums(data || []);
        const tab = searchParams.get("tab");
        if (data?.length) {
          const match = data.find(c => c.slug === tab);
          setActiveTab(match ? match.id : data[0].id);
        }
      });
    supabase.from("grades").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setGrades(data || []));
  }, [searchParams]);

  const currentGrades = grades.filter(g => g.curriculum_id === activeTab);

  return (
    <Layout>
      <SEOHead title="Curriculum" description="Browse classes by National, Cambridge, and Edexcel syllabuses." path="/curriculum" />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">Curriculum</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Browse classes by your syllabus and grade level</p>
          </div>

          {curriculums.length > 0 ? (
            <>
              <div className="flex justify-center gap-2 mb-12">
                {curriculums.map((cur) => (
                  <button key={cur.id} onClick={() => setActiveTab(cur.id)}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === cur.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}>
                    {cur.name}
                  </button>
                ))}
              </div>

              {currentGrades.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentGrades.map((grade) => (
                    <Link key={grade.id} to={`/classes?grade=${grade.slug}`} className="bg-card rounded-xl p-6 card-elevated group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                          <GraduationCap className="w-5 h-5 text-secondary" />
                        </div>
                        <h3 className="font-display font-semibold text-foreground">{grade.name}</h3>
                      </div>
                      <div className="flex items-center text-sm text-primary font-medium gap-1">
                        View classes <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">No grades added for this curriculum yet.</div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No curriculums available yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CurriculumPage;
