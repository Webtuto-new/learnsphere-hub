import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Play, User, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const RecordingsPage = () => {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    supabase.from("recordings").select("*, teachers(name)").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => setRecordings(data || []));
  }, []);

  // Build dynamic tabs from recording_type values
  const tabs = useMemo(() => {
    const types = new Set<string>();
    types.add("All");
    types.add("Recording");
    recordings.forEach(r => {
      if ((r as any).recording_type) types.add((r as any).recording_type);
    });
    return Array.from(types);
  }, [recordings]);

  const filtered = recordings.filter(r => {
    const matchesQuery = !query || r.title.toLowerCase().includes(query.toLowerCase());
    const type = (r as any).recording_type || "Recording";
    const matchesTab = activeTab === "All" || type === activeTab;
    return matchesQuery && matchesTab;
  });

  return (
    <Layout>
      <SEOHead title="Recording Store" description="Purchase and watch class recordings at your own pace on Webtuto." path="/recordings" />
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Recording Store</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Purchase and watch class recordings at your own pace</p>
          </div>

          <div className="relative max-w-md mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search recordings..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {/* Filter tabs */}
          {tabs.length > 2 && (
            <div className="flex gap-1 mb-6 sm:mb-8 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map(r => {
                const hasPreview = !!(r as any).free_preview_url;
                const typeLabel = (r as any).recording_type || "Recording";
                return (
                  <Link key={r.id} to={`/recording/${r.id}`} className="block group">
                    <Card className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 border-border/50">
                      <div className="aspect-video bg-muted overflow-hidden relative">
                        {r.thumbnail_url ? (
                          <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <Play className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        {hasPreview && (
                          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                            <Eye className="w-3 h-3" /> Free Preview
                          </span>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <Badge variant="outline" className="mb-2 text-[10px]">{typeLabel}</Badge>
                        <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors">{r.title}</h3>
                        {r.teachers?.name && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> {r.teachers.name}
                          </p>
                        )}
                        {r.duration_minutes && <p className="text-xs text-muted-foreground mb-2">{r.duration_minutes} min</p>}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="font-bold text-foreground text-sm sm:text-base">LKR {r.price}</span>
                          <span className="text-xs sm:text-sm font-medium text-primary">View →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <Play className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 opacity-50" />
              <p className="text-base sm:text-lg font-medium">No recordings available yet</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecordingsPage;
