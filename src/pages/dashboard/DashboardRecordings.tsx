import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DashboardRecordings = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("enrollments").select("*, recordings(*)").eq("user_id", user.id).not("recording_id", "is", null)
      .then(({ data }) => setEnrollments(data || []));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Recordings</h1>
      {enrollments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recordings purchased yet.</p>
          <Link to="/recordings"><Button size="sm" className="mt-3">Browse Recordings</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(e => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-1">{e.recordings?.title || "Recording"}</h3>
                <p className="text-xs text-muted-foreground mb-2">{e.recordings?.description?.substring(0, 80) || ""}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    e.status === "active" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                  }`}>{e.status}</span>
                  {e.recordings?.video_url && (
                    <Link to={`/recording/${e.recording_id}`}>
                      <Button size="sm" className="gap-1"><Play className="w-3 h-3" /> Watch</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardRecordings;
