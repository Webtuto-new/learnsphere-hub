import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type NoteItem = {
  id: string;
  title: string;
  file_url: string;
  file_type?: string | null;
  source_title: string;
  source_type: "Class" | "Recording" | "Session";
};

const DashboardNotes = () => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (authLoading) return;
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch all active enrollments for this user
        const { data: enrollments, error: enrollError } = await supabase
          .from("enrollments")
          .select("class_id, recording_id")
          .eq("user_id", user.id)
          .eq("status", "active");

        if (enrollError) {
          console.error("Error fetching enrollments:", enrollError);
          setIsLoading(false);
          return;
        }

        const classIds = [...new Set((enrollments || []).map(e => e.class_id).filter(Boolean))] as string[];
        const recordingIds = [...new Set((enrollments || []).map(e => e.recording_id).filter(Boolean))] as string[];

        const collected: NoteItem[] = [];

        // 1. Class materials (notes attached to classes)
        if (classIds.length) {
          const [{ data: classes }, { data: materials }] = await Promise.all([
            supabase.from("classes").select("id, title").in("id", classIds),
            supabase.from("class_materials").select("*").in("class_id", classIds),
          ]);
          (materials || []).forEach(m => {
            collected.push({
              id: `cm-${m.id}`,
              title: m.title,
              file_url: m.file_url,
              file_type: m.file_type,
              source_title: classes?.find(c => c.id === m.class_id)?.title || "Class",
              source_type: "Class",
            });
          });

          // 2. Class session resources
          const { data: sessions } = await supabase
            .from("class_sessions")
            .select("id, title, class_id")
            .in("class_id", classIds);

          if (sessions?.length) {
            const sessionIds = sessions.map(s => s.id);
            const { data: sessionRes } = await supabase
              .from("session_resources")
              .select("*")
              .in("session_id", sessionIds);
            (sessionRes || []).forEach(r => {
              collected.push({
                id: `sr-${r.id}`,
                title: r.title,
                file_url: r.file_url,
                file_type: r.file_type,
                source_title: sessions.find(s => s.id === r.session_id)?.title || "Session",
                source_type: "Session",
              });
            });
          }
        }

        // 3. Recording notes
        if (recordingIds.length) {
          const [{ data: recordings }, { data: recNotes }] = await Promise.all([
            supabase.from("recordings").select("id, title").in("id", recordingIds),
            supabase.from("recording_notes").select("*").in("recording_id", recordingIds),
          ]);
          (recNotes || []).forEach(n => {
            collected.push({
              id: `rn-${n.id}`,
              title: n.title,
              file_url: n.file_url,
              file_type: n.file_type,
              source_title: recordings?.find(r => r.id === n.recording_id)?.title || "Recording",
              source_type: "Recording",
            });
          });
        }

        setItems(collected);
      } catch (error) {
        console.error("Unexpected error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [user, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Notes & Resources</h1>
        <Card>
          <CardContent className="py-12">
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Notes & Resources</h1>
      {items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No downloadable resources available yet.</p>
          <p className="text-sm mt-2">Notes from your enrolled classes and purchased recordings will appear here.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary"><FileText className="w-5 h-5" /></div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.source_type}: {r.source_title}
                      {r.file_type ? ` · ${r.file_type.toUpperCase()}` : ""}
                    </p>
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
