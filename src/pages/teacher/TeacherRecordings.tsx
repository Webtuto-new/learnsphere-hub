import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users } from "lucide-react";

const TeacherRecordings = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

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

  const viewStudents = async (recording: any) => {
    setSelectedRecording(recording);
    setStudentsOpen(true);
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id, enrolled_at, status, expires_at")
      .eq("recording_id", recording.id)
      .eq("status", "active");
    if (!enrollments?.length) { setStudents([]); return; }
    const userIds = enrollments.map(e => e.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, admission_number").in("id", userIds);
    const merged = (profiles || []).map(p => {
      const enr = enrollments.find(e => e.user_id === p.id);
      return { ...p, enrolled_at: enr?.enrolled_at, expires_at: enr?.expires_at };
    });
    setStudents(merged);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Recordings</h1>

      {recordings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No recordings assigned to you yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {recordings.map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium text-foreground">{r.title}</td>
                      <td className="p-4 text-muted-foreground">LKR {r.price}</td>
                      <td className="p-4"><Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge></td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => viewStudents(r)} title="View Students">
                          <Users className="w-4 h-4 mr-1" /> Students
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={studentsOpen} onOpenChange={setStudentsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Students — {selectedRecording?.title}</DialogTitle></DialogHeader>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No students enrolled yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {students.map(s => (
                <div key={s.id} className="py-3">
                  <p className="text-sm font-medium text-foreground">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.email} · {s.admission_number || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    Enrolled: {new Date(s.enrolled_at).toLocaleDateString()}
                    {s.expires_at && ` · Expires: ${new Date(s.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherRecordings;
