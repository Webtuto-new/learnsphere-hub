import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play } from "lucide-react";
import { Link } from "react-router-dom";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase.from("recordings").select("*, teachers(name)").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => setRecordings(data || []));
  }, []);

  const filtered = recordings.filter(r =>
    !query || r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout>
      <SEOHead title="Recording Store" description="Purchase and watch class recordings at your own pace on Webtuto." path="/recordings" />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Recording Store</h1>
            <p className="text-muted-foreground">Purchase and watch class recordings at your own pace</p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search recordings..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(r => (
                <Card key={r.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted overflow-hidden">
                    {r.thumbnail_url ? (
                      <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Play className="w-10 h-10 text-muted-foreground" /></div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <span className="badge-recording mb-2 inline-block">Recording</span>
                    <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{r.teachers?.name || "Tutor"}</p>
                    {r.duration_minutes && <p className="text-xs text-muted-foreground mb-2">{r.duration_minutes} min</p>}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">LKR {r.price}</span>
                      <Link to={`/recording/${r.id}`}><Button size="sm">View</Button></Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No recordings available yet</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecordingsPage;
