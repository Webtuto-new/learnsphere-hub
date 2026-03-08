import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";

const DashboardHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("attendance").select("*, class_sessions(*, classes(title))").eq("user_id", user.id).order("joined_at", { ascending: false })
      .then(({ data }) => setHistory(data || []));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Class History</h1>
      {history.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No class attendance history yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {history.map(h => (
            <Card key={h.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><Calendar className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{h.class_sessions?.classes?.title || "Class"}</p>
                  <p className="text-sm text-muted-foreground">{h.class_sessions?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">Joined: {new Date(h.joined_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardHistory;
