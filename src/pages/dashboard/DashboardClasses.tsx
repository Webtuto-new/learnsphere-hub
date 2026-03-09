import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Video, Calendar, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const DashboardClasses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [nextSessions, setNextSessions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    
    // Fetch enrollments with class details and expiry
    supabase
      .from("enrollments")
      .select("id, expires_at, enrolled_at, status, class_id, classes(*)")
      .eq("user_id", user.id)
      .not("class_id", "is", null)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false })
      .then(({ data }) => {
        const enrolls = data || [];
        setEnrollments(enrolls);
        
        // Fetch next upcoming session for each class
        enrolls.forEach(async (e) => {
          if (e.class_id) {
            const { data: sessions } = await supabase
              .from("class_sessions")
              .select("*")
              .eq("class_id", e.class_id)
              .gte("session_date", new Date().toISOString().split("T")[0])
              .order("session_date", { ascending: true })
              .order("start_time", { ascending: true })
              .limit(1);
            
            if (sessions && sessions.length > 0) {
              setNextSessions(prev => ({ ...prev, [e.class_id]: sessions[0] }));
            }
          }
        });
      });
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">My Classes</h1>
        <Link to="/classes"><Button variant="outline" size="sm">Browse More</Button></Link>
      </div>
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No classes enrolled yet.</p>
            <Link to="/classes"><Button size="sm" className="mt-3">Browse Classes</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {enrollments.map((e) => {
            const nextSession = nextSessions[e.class_id];
            const expiresAt = e.expires_at ? new Date(e.expires_at) : null;
            const isExpired = expiresAt && expiresAt < new Date();

            return (
              <Card key={e.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground mb-1 text-lg">{e.classes?.title || "Class"}</h3>
                      {e.classes?.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{e.classes.short_description}</p>
                      )}
                    </div>
                    <Link to={`/class/${e.class_id}`}>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Expiry info */}
                  <div className="flex items-center gap-2">
                    <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {expiresAt ? `Expires ${expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Active"}
                    </Badge>
                  </div>

                  {/* Next session & actions */}
                  {nextSession && (
                    <div className="pt-3 border-t border-border/50 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Next Session:</p>
                      <p className="text-sm text-foreground font-medium">{nextSession.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(nextSession.session_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {nextSession.start_time}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {nextSession.zoom_link && (
                          <a href={nextSession.zoom_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="default" className="gap-1.5">
                              <Video className="w-3.5 h-3.5" /> Join Zoom
                            </Button>
                          </a>
                        )}
                        {nextSession.recording_url && (
                          <a href={nextSession.recording_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <Video className="w-3.5 h-3.5" /> Recording
                            </Button>
                          </a>
                        )}
                        {nextSession.notes_url && (
                          <a href={nextSession.notes_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> Notes
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardClasses;
