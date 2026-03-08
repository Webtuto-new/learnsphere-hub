import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ClassCard from "@/components/ClassCard";
import { sampleClasses } from "@/data/sampleData";

const SeminarsPage = () => (
  <Layout>
    <SEOHead title="Seminars" description="One-time deep-dive sessions with expert tutors on Webtuto." path="/seminars" />
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Seminars</h1>
          <p className="text-muted-foreground">One-time deep-dive sessions with expert tutors</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleClasses.filter(c => c.classType === "seminar").map((cls) => (
            <ClassCard key={cls.id} {...cls} />
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default SeminarsPage;
