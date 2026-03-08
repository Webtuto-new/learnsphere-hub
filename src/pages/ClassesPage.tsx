import Layout from "@/components/Layout";
import ClassCard from "@/components/ClassCard";
import { sampleClasses } from "@/data/sampleData";

const ClassesPage = () => {
  return (
    <Layout>
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">All Classes</h1>
            <p className="text-muted-foreground">Browse live classes, seminars, workshops and more</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleClasses.map((cls) => (
              <ClassCard key={cls.id} {...cls} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClassesPage;
