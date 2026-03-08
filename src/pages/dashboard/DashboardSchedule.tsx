import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink } from "lucide-react";

const DashboardSchedule = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Get enrolled class IDs then fetch upcoming sessions
    supabase.from("enrollments").select("class_id").eq("user_id", user.id).eq("status", "active")
      .then(async ({ data: enrollments }) => {
        if (!enrollments?.length) return;
        const classIds = enrollments.map(e => e.class_id).filter(Boolean);
        if (!classIds.length) return;
        const { data } = await supabase
          .from("class_sessions")
          .select("*, classes(title)")
          .in("class_id", classIds)
          .gte("session_date", new Date().toISOString().split("T")[0])
          .order("session_date", { ascending: true })
          .limit(20);
        setSessions(data || []);
      });
  }, [user]);

  const isJoinable = (session: any) => {
    const now = new Date();
    const sessionDate = new Date(`${session.session_date}T${session.start_time}`);
    const diff = (sessionDate.getTime() - now.getTime()) / (1000 * 60);
    return diff <= 15 && diff >= -session.end_time; // joinable 15 min before
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Schedule</h1>
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming sessions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.classes?.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{new Date(s.session_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.start_time} - {s.end_time}</span>
                    </div>
                  </div>
                </div>
                {s.zoom_link && (
                  <a href={s.zoom_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1" disabled={!isJoinable(s)}>
                      <ExternalLink className="w-3 h-3" /> Join Class
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardSchedule;
