import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import EnrolledStudentsDialog from "@/components/EnrolledStudentsDialog";
import CreateStudentDialog from "@/components/CreateStudentDialog";

const TeacherRecordings = () => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [studentsDialog, setStudentsDialog] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: "", title: "" });
  const [enrollDialog, setEnrollDialog] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: "", title: "" });

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
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setStudentsDialog({ open: true, id: r.id, title: r.title })} title="View Students">
                            <Users className="w-4 h-4 mr-1" /> Students
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEnrollDialog({ open: true, id: r.id, title: r.title })} title="Add Student">
                            <UserPlus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <EnrolledStudentsDialog
        open={studentsDialog.open}
        onOpenChange={(v) => setStudentsDialog(s => ({ ...s, open: v }))}
        title={studentsDialog.title}
        resourceType="recording"
        resourceId={studentsDialog.id}
      />

      <CreateStudentDialog
        open={enrollDialog.open}
        onOpenChange={(v) => setEnrollDialog(s => ({ ...s, open: v }))}
        enrollInto={{ type: "recording", id: enrollDialog.id, name: enrollDialog.title, days: "365" }}
      />
    </div>
  );
};

export default TeacherRecordings;
