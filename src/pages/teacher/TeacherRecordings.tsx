import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TeacherRecordings = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadRecordings();
  }, [user]);

  const loadRecordings = async () => {
    const { data: t } = await supabase.from("teachers").select("id").eq("user_id", user!.id).single();
    if (!t) return;
    const { data } = await supabase.from("recordings").select("*").eq("teacher_id", t.id).order("created_at", { ascending: false });
    setRecordings(data || []);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Recordings</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody>
                {recordings.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{r.title}</td>
                    <td className="p-4 text-muted-foreground">LKR {r.price}</td>
                    <td className="p-4"><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></td>
                  </tr>
                ))}
                {recordings.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No recordings assigned.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherRecordings;
