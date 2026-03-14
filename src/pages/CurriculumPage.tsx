import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Link, useSearchParams } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const CurriculumPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

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
      .then(({ data }) => {
        const sorted = (data || []).sort((a, b) => {
          const aMatch = a.name.match(/(\d+)/);
          const bMatch = b.name.match(/(\d+)/);
          if (aMatch && bMatch) return parseInt(aMatch[1]) - parseInt(bMatch[1]);
          return a.name.localeCompare(b.name);
        });
        setGrades(sorted);
      });
    supabase.from("subjects").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => setSubjects(data || []));
  }, []);

  // Check URL for grade param
  useEffect(() => {
    const gradeSlug = searchParams.get("grade");
    if (gradeSlug && grades.length) {
      const grade = grades.find(g => g.slug === gradeSlug);
      if (grade) {
        setSelectedGrade(grade);
        setActiveTab(grade.curriculum_id);
      }
    }
  }, [searchParams, grades]);

  const currentGrades = grades.filter(g => g.curriculum_id === activeTab);
  const currentSubjects = selectedGrade ? subjects.filter(s => s.grade_id === selectedGrade.id) : [];

  const handleGradeClick = (grade: any) => {
    setSelectedGrade(grade);
    setSearchParams({ grade: grade.slug });
  };

  const handleBack = () => {
    setSelectedGrade(null);
    searchParams.delete("grade");
    setSearchParams(searchParams);
  };

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
                  <button key={cur.id} onClick={() => { setActiveTab(cur.id); setSelectedGrade(null); searchParams.delete("grade"); setSearchParams(searchParams); }}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === cur.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}>
                    {cur.name}
                  </button>
                ))}
              </div>

              {selectedGrade ? (
                <div>
                  <Button variant="ghost" className="mb-6 gap-2" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4" /> Back to Grades
                  </Button>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">{selectedGrade.name} — Subjects</h2>
                  {currentSubjects.length > 0 ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentSubjects.map((subject) => (
                        <Link key={subject.id} to={`/classes?subject=${subject.slug}&grade=${selectedGrade.slug}`} className="bg-card rounded-xl p-6 card-elevated group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-display font-semibold text-foreground">{subject.name}</h3>
                          </div>
                          <div className="flex items-center text-sm text-primary font-medium gap-1">
                            View classes <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">No subjects added for this grade yet.</div>
                  )}
                </div>
              ) : (
                <>
                  {currentGrades.length > 0 ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentGrades.map((grade) => (
                        <button key={grade.id} onClick={() => handleGradeClick(grade)} className="bg-card rounded-xl p-6 card-elevated group text-left w-full">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                              <GraduationCap className="w-5 h-5 text-secondary" />
                            </div>
                            <h3 className="font-display font-semibold text-foreground">{grade.name}</h3>
                          </div>
                          <div className="flex items-center text-sm text-primary font-medium gap-1">
                            View subjects <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">No grades added for this curriculum yet.</div>
                  )}
                </>
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
