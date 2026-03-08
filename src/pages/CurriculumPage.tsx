import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GraduationCap, ArrowRight } from "lucide-react";
import { curriculumData, subjects } from "@/data/sampleData";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { key: "national", label: "National Syllabus" },
  { key: "cambridge", label: "Cambridge" },
  { key: "edexcel", label: "Edexcel" },
];

const CurriculumPage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "national";
  const [activeTab, setActiveTab] = useState(initialTab);

  const currentCurriculum = curriculumData[activeTab as keyof typeof curriculumData];

  return (
    <Layout>
      <SEOHead title="Curriculum" description="Browse classes by National, Cambridge, and Edexcel syllabuses." path="/curriculum" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Curriculum
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse classes by your syllabus and grade level
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grade Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentCurriculum.grades.map((grade) => (
              <Link
                key={grade}
                to={`/classes?curriculum=${activeTab}&grade=${encodeURIComponent(grade)}`}
                className="bg-card rounded-xl p-6 card-elevated group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <GraduationCap className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{grade}</h3>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {subjects.slice(0, 4).map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">+{subjects.length - 4} more</Badge>
                </div>
                <div className="flex items-center text-sm text-primary font-medium gap-1">
                  View subjects <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CurriculumPage;
