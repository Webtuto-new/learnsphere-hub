import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Copy, UserPlus, BookOpen, Clock, Check } from "lucide-react";
import { format, addDays } from "date-fns";

const AdminStudents = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const { toast } = useToast();

  // Create student
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: "", email: "", password: "", phone: "", address: "" });
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string; full_name: string; admission_number: string } | null>(null);

  // Enroll student
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollStudent, setEnrollStudent] = useState<any>(null);
  const [enrollType, setEnrollType] = useState<"class" | "recording">("class");
  const [enrollItemId, setEnrollItemId] = useState("");
  const [enrollDays, setEnrollDays] = useState("30");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [showEnrollments, setShowEnrollments] = useState(false);

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setStudents(data || []);
  };

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("id, title").eq("is_active", true).order("title");
    setClasses(data || []);
  };

  const fetchRecordings = async () => {
    const { data } = await supabase.from("recordings").select("id, title").eq("is_active", true).order("title");
    setRecordings(data || []);
  };

  const fetchEnrollments = async (userId: string) => {
    const { data } = await supabase
      .from("enrollments")
      .select("*, classes(title), recordings(title)")
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });
    setEnrollments(data || []);
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchRecordings();
  }, []);

  // Create student account
  const handleCreate = async () => {
    if (!createForm.email || !createForm.password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-student", {
        body: createForm,
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCreatedInfo({
        email: createForm.email,
        password: createForm.password,
        full_name: createForm.full_name,
        admission_number: data.admission_number,
      });
      fetchStudents();
      toast({ title: "Student account created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const copyCredentials = () => {
    if (!createdInfo) return;
    const msg = `Welcome to WebTuto Academy! 🎓\n\nHere are your login details:\n📧 Email: ${createdInfo.email}\n🔑 Password: ${createdInfo.password}\n🆔 Admission #: ${createdInfo.admission_number}\n👤 Name: ${createdInfo.full_name}\n\n🔗 Login at: ${window.location.origin}/login\n\nPlease change your password after first login.`;
    navigator.clipboard.writeText(msg);
    toast({ title: "Credentials copied to clipboard!" });
  };

  const resetCreateForm = () => {
    setCreateForm({ full_name: "", email: "", password: "", phone: "", address: "" });
    setCreatedInfo(null);
  };

  // Enroll student
  const openEnroll = (student: any) => {
    setEnrollStudent(student);
    setEnrollItemId("");
    setEnrollDays("30");
    setEnrollType("class");
    setEnrollOpen(true);
  };

  const handleEnroll = async () => {
    if (!enrollStudent || !enrollItemId) {
      toast({ title: "Select an item to enroll", variant: "destructive" });
      return;
    }
    const expiresAt = addDays(new Date(), parseInt(enrollDays) || 30).toISOString();
    const payload: any = {
      user_id: enrollStudent.id,
      status: "active",
      expires_at: expiresAt,
    };
    if (enrollType === "class") payload.class_id = enrollItemId;
    else payload.recording_id = enrollItemId;

    const { error } = await supabase.from("enrollments").insert(payload);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Student enrolled!" });
      setEnrollOpen(false);
    }
  };

  // View & manage enrollments
  const openStudentEnrollments = async (student: any) => {
    setEnrollStudent(student);
    await fetchEnrollments(student.id);
    setShowEnrollments(true);
  };

  const extendExpiry = async (enrollmentId: string, days: number) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    const baseDate = enrollment?.expires_at ? new Date(enrollment.expires_at) : new Date();
    const newExpiry = addDays(baseDate, days).toISOString();
    const { error } = await supabase.from("enrollments").update({ expires_at: newExpiry, status: "active" }).eq("id", enrollmentId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Extended by ${days} days` });
      fetchEnrollments(enrollStudent.id);
    }
  };

  const expireEnrollment = async (enrollmentId: string) => {
    const { error } = await supabase.from("enrollments").update({ status: "expired" }).eq("id", enrollmentId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Enrollment expired" });
      fetchEnrollments(enrollStudent.id);
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijkmnpqrstuvwxyz23456789";
    let pass = "";
    for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setCreateForm(f => ({ ...f, password: pass }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Students</h1>
        <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetCreateForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="w-4 h-4" /> Create Student</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Create Student Account</DialogTitle></DialogHeader>
            {!createdInfo ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={createForm.full_name} onChange={(e) => setCreateForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={createForm.email} onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="student@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="flex gap-2">
                    <Input value={createForm.password} onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="min 6 characters" />
                    <Button type="button" variant="outline" size="sm" onClick={generatePassword} className="shrink-0 text-xs">
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={createForm.phone} onChange={(e) => setCreateForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={createForm.address} onChange={(e) => setCreateForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
                  <UserPlus className="w-4 h-4" />
                  {creating ? "Creating..." : "Create Account"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                  <p className="font-semibold text-foreground">Account Created Successfully! ✅</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>👤 Name: <span className="text-foreground">{createdInfo.full_name}</span></p>
                    <p>📧 Email: <span className="text-foreground">{createdInfo.email}</span></p>
                    <p>🔑 Password: <span className="text-foreground font-mono">{createdInfo.password}</span></p>
                    <p>🆔 Admission #: <span className="text-foreground">{createdInfo.admission_number}</span></p>
                  </div>
                </div>
                <Button onClick={copyCredentials} className="w-full gap-2">
                  <Copy className="w-4 h-4" /> Copy Message to Share with Student
                </Button>
                <Button variant="outline" onClick={() => { resetCreateForm(); }} className="w-full">
                  Create Another Student
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Enroll Dialog */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enroll {enrollStudent?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Enroll in</Label>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant={enrollType === "class" ? "default" : "outline"} onClick={() => { setEnrollType("class"); setEnrollItemId(""); }}>Class</Button>
                <Button type="button" size="sm" variant={enrollType === "recording" ? "default" : "outline"} onClick={() => { setEnrollType("recording"); setEnrollItemId(""); }}>Recording</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{enrollType === "class" ? "Select Class" : "Select Recording"}</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={enrollItemId}
                onChange={(e) => setEnrollItemId(e.target.value)}
              >
                <option value="">Choose...</option>
                {(enrollType === "class" ? classes : recordings).map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Access Duration (days)</Label>
              <Input type="number" value={enrollDays} onChange={(e) => setEnrollDays(e.target.value)} />
            </div>
            <Button onClick={handleEnroll} className="w-full gap-2">
              <BookOpen className="w-4 h-4" /> Enroll Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Enrollments Dialog */}
      <Dialog open={showEnrollments} onOpenChange={setShowEnrollments}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Enrollments - {enrollStudent?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {enrollments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No enrollments yet.</p>}
            {enrollments.map((e) => {
              const isExpired = e.status === "expired" || (e.expires_at && new Date(e.expires_at) < new Date());
              const itemName = e.classes?.title || e.recordings?.title || "Unknown";
              return (
                <div key={e.id} className={`rounded-lg border p-3 space-y-2 ${isExpired ? "border-destructive/30 bg-destructive/5" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-foreground">{itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.class_id ? "Class" : "Recording"} · Status: <span className={isExpired ? "text-destructive" : "text-secondary"}>{isExpired ? "Expired" : e.status}</span>
                      </p>
                      {e.expires_at && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {format(new Date(e.expires_at), "PPP")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => extendExpiry(e.id, 7)}>
                      <Clock className="w-3 h-3" /> +7 days
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => extendExpiry(e.id, 30)}>
                      <Clock className="w-3 h-3" /> +30 days
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => extendExpiry(e.id, 90)}>
                      <Clock className="w-3 h-3" /> +90 days
                    </Button>
                    {!isExpired && (
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => expireEnrollment(e.id)}>
                        Expire Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Admission #</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground font-mono text-xs">{s.admission_number || "—"}</td>
                    <td className="p-4 text-foreground">{s.full_name}</td>
                    <td className="p-4 text-muted-foreground">{s.email}</td>
                    <td className="p-4 text-muted-foreground">{s.phone || "—"}</td>
                    <td className="p-4 text-muted-foreground">{format(new Date(s.created_at), "PP")}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => openEnroll(s)}>
                          <BookOpen className="w-3 h-3" /> Enroll
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => openStudentEnrollments(s)}>
                          <Clock className="w-3 h-3" /> Manage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No students yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStudents;
