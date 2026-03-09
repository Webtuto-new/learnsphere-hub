import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardNotes = () => {
  const { user, loading: authLoading } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Get enrolled class sessions, then their resources
    supabase.from("enrollments").select("class_id").eq("user_id", user.id).eq("status", "active")
      .then(async ({ data: enrollments }) => {
        if (!enrollments?.length) return;
        const classIds = enrollments.map(e => e.class_id).filter(Boolean);
        if (!classIds.length) return;
        const { data: sessions } = await supabase.from("class_sessions").select("id, title, class_id").in("class_id", classIds);
        if (!sessions?.length) return;
        const sessionIds = sessions.map(s => s.id);
        const { data: res } = await supabase.from("session_resources").select("*").in("session_id", sessionIds).order("created_at", { ascending: false });
        // Attach session title
        setResources((res || []).map(r => ({
          ...r,
          session_title: sessions.find(s => s.id === r.session_id)?.title || "Session",
        })));
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Notes & Resources</h1>
      {resources.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No downloadable resources available yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {resources.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary"><FileText className="w-5 h-5" /></div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.session_title} · {r.file_type?.toUpperCase()}</p>
                  </div>
                </div>
                <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardNotes;
