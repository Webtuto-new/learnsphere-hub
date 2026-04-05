import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  resourceType: "class" | "recording";
  resourceId: string;
}

const EnrolledStudentsDialog = ({ open, onOpenChange, title, resourceType, resourceId }: Props) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadStudents = async () => {
    if (loaded) return;
    setLoading(true);
    const filter = resourceType === "class" ? { class_id: resourceId } : { recording_id: resourceId };
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("user_id, enrolled_at, status, expires_at")
      .match(filter)
      .eq("status", "active");

    if (!enrollments?.length) { setStudents([]); setLoading(false); setLoaded(true); return; }
    const userIds = enrollments.map(e => e.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, admission_number").in("id", userIds);
    const merged = (profiles || []).map(p => {
      const enr = enrollments.find(e => e.user_id === p.id);
      return { ...p, enrolled_at: enr?.enrolled_at, expires_at: enr?.expires_at };
    });
    setStudents(merged);
    setLoading(false);
    setLoaded(true);
  };

  const handleOpenChange = (v: boolean) => {
    if (v) loadStudents();
    else setLoaded(false);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Students — {title}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No students enrolled yet.</p>
        ) : (
          <>
            <Badge variant="secondary" className="w-fit">{students.length} student(s)</Badge>
            <div className="divide-y divide-border">
              {students.map(s => (
                <div key={s.id} className="py-3">
                  <p className="text-sm font-medium text-foreground">{s.full_name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">{s.email} · {s.admission_number || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    Enrolled: {new Date(s.enrolled_at).toLocaleDateString()}
                    {s.expires_at && ` · Expires: ${new Date(s.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrolledStudentsDialog;
