import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

const BundlesPage = () => {
  const [bundles, setBundles] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("bundles").select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => setBundles(data || []));
  }, []);

  return (
    <Layout>
      <SEOHead title="Class Bundles" description="Save more with curated class bundles on Webtuto." path="/bundles" />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Class Bundles</h1>
            <p className="text-muted-foreground">Save more with our carefully curated class bundles</p>
          </div>
          {bundles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <h3 className="font-display font-semibold text-foreground text-lg mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{b.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-foreground">LKR {Number(b.price).toLocaleString()}</span>
                      {b.original_price && <span className="text-muted-foreground line-through text-sm">LKR {Number(b.original_price).toLocaleString()}</span>}
                    </div>
                    <Link to={`/bundle/${b.id}`}><Button size="sm" className="w-full">View Bundle</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No bundles available yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BundlesPage;
