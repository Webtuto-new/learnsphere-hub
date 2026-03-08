import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    supabase.from("classes").select("*, teachers(name)").eq("is_active", true).then(({ data }) => setClasses(data || []));
    supabase.from("recordings").select("*, teachers(name)").eq("is_active", true).then(({ data }) => setRecordings(data || []));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let results: any[] = [];
    if (typeFilter === "all" || typeFilter === "classes") {
      results.push(...classes.filter(c =>
        c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.teachers?.name?.toLowerCase().includes(q)
      ).map(c => ({ ...c, _type: "class" })));
    }
    if (typeFilter === "all" || typeFilter === "recordings") {
      results.push(...recordings.filter(r =>
        r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      ).map(r => ({ ...r, _type: "recording" })));
    }
    return results;
  }, [query, classes, recordings, typeFilter]);

  return (
    <Layout>
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-6">Search</h1>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search classes, recordings, teachers..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {["all", "classes", "recordings"].map(t => (
                <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)} className="capitalize">
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{filtered.length} results</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <Link key={item.id} to={item._type === "class" ? `/class/${item.id}` : `/recording/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mb-2 inline-block ${
                      item._type === "class" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                    }`}>{item._type === "class" ? "Class" : "Recording"}</span>
                    <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description || item.short_description || ""}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-foreground">LKR {item.price}</span>
                      {item.teachers?.name && <span className="text-xs text-muted-foreground">{item.teachers.name}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No results found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
