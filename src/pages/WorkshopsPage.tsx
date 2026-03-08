import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ClassCard from "@/components/ClassCard";
import { sampleClasses } from "@/data/sampleData";

const WorkshopsPage = () => (
  <Layout>
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Workshops</h1>
          <p className="text-muted-foreground">Intensive hands-on learning experiences</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleClasses.filter(c => c.classType === "workshop").map((cls) => (
            <ClassCard key={cls.id} {...cls} />
          ))}
        </div>
      </div>
    </div>
  </Layout>
);

export default WorkshopsPage;
