import Layout from "@/components/Layout";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <Layout>
    <div className="pt-28 pb-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{description}</p>
      </div>
    </div>
  </Layout>
);

export default PlaceholderPage;
