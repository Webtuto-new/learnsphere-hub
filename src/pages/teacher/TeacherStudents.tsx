import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TeacherStudents = () => {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    init();
  }, [user]);

  const init = async () => {
    const { data: t } = await supabase.from("teachers").select("*").eq("user_id", user!.id).single();
    if (!t) return;
    setTeacher(t);
    const { data: cls } = await supabase.from("classes").select("id, title").eq("teacher_id", t.id).order("title");
    setClasses(cls || []);
    if (cls?.length) {
      setSelectedClassId(cls[0].id);
      loadStudents(cls[0].id);
    }
  };

  const loadStudents = async (classId: string) => {
    setSelectedClassId(classId);
    const { data: enrollments } = await supabase.from("enrollments").select("user_id, enrolled_at, status").eq("class_id", classId).eq("status", "active");
    if (!enrollments?.length) { setStudents([]); return; }
    const userIds = enrollments.map(e => e.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, phone, admission_number").in("id", userIds);
    const merged = (profiles || []).map(p => {
      const enr = enrollments.find(e => e.user_id === p.id);
      return { ...p, enrolled_at: enr?.enrolled_at };
    });
    setStudents(merged);
  };

  if (!teacher) return <div className="py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Students</h1>

      {classes.length > 0 && (
        <Select value={selectedClassId} onValueChange={loadStudents}>
          <SelectTrigger className="w-full md:w-72"><SelectValue placeholder="Select Class" /></SelectTrigger>
          <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
        </Select>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Admission #</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Enrolled</th>
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{s.full_name}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{s.email || "—"}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{s.phone || "—"}</td>
                    <td className="p-4 text-muted-foreground">{s.admission_number || "—"}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No students enrolled yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudents;
