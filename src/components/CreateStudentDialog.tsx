import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, UserPlus, Search } from "lucide-react";
import { addDays } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, auto-enroll the created student into this resource */
  enrollInto?: { type: "class" | "recording"; id: string; name: string; days?: string };
  onStudentCreated?: () => void;
}

const CreateStudentDialog = ({ open, onOpenChange, enrollInto, onStudentCreated }: Props) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Enroll existing student
  const [enrollMode, setEnrollMode] = useState<"create" | "existing">("create");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollDays, setEnrollDays] = useState(enrollInto?.days || "30");

  const generatePassword = () => {
    const chars = "abcdefghijkmnpqrstuvwxyz23456789";
    let pw = "";
    for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    return pw;
  };

  const handleCreate = async () => {
    if (!form.email || !form.full_name) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const password = generatePassword();
    setGeneratedPassword(password);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-student", {
        body: { email: form.email, password, full_name: form.full_name, phone: form.phone, address: form.address },
      });
      if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);

      // Auto-enroll if enrollInto is provided
      if (enrollInto) {
        const expiresAt = addDays(new Date(), parseInt(enrollDays) || 30).toISOString();
        const enrollPayload: any = { user_id: res.data.user_id, status: "active", expires_at: expiresAt };
        if (enrollInto.type === "class") enrollPayload.class_id = enrollInto.id;
        else enrollPayload.recording_id = enrollInto.id;
        await supabase.from("enrollments").insert(enrollPayload);
      }

      setResult({ ...res.data, password });
      toast({ title: "Student created!" });
      onStudentCreated?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const searchStudents = async (q: string) => {
    setStudentSearch(q);
    if (q.length < 2) { setStudentResults([]); return; }
    const { data } = await supabase.from("profiles").select("id, full_name, email, admission_number")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,admission_number.ilike.%${q}%`)
      .limit(10);
    setStudentResults(data || []);
  };

  const handleEnrollExisting = async (studentId: string) => {
    if (!enrollInto) return;
    setEnrolling(true);
    try {
      const filterKey = enrollInto.type === "class" ? "class_id" : "recording_id";
      const { data: existing } = await supabase.from("enrollments")
        .select("id").eq("user_id", studentId).eq(filterKey, enrollInto.id).eq("status", "active").maybeSingle();
      if (existing) {
        toast({ title: "Already enrolled", variant: "destructive" });
        setEnrolling(false);
        return;
      }
      const expiresAt = addDays(new Date(), parseInt(enrollDays) || 30).toISOString();
      const payload: any = { user_id: studentId, status: "active", expires_at: expiresAt };
      payload[filterKey] = enrollInto.id;
      const { error } = await supabase.from("enrollments").insert(payload);
      if (error) throw error;
      toast({ title: "Student enrolled!" });
      onStudentCreated?.();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setEnrolling(false);
    }
  };

  const copyMessage = () => {
    if (!result) return;
    const msg = `📚 Welcome to Webtuto Academy!\n\nYour student account has been created:\n\n🔑 Login: ${result.email}\n🔒 Password: ${result.password}\n📋 Admission #: ${result.admission_number}\n\n🌐 Login at: ${window.location.origin}/login\n\nAfter logging in, go to Dashboard to see your classes and recordings.`;
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setResult(null);
      setForm({ full_name: "", email: "", phone: "", address: "" });
      setStudentSearch("");
      setStudentResults([]);
      setEnrollMode("create");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {enrollInto ? `Add Student — ${enrollInto.name}` : "Create Student"}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Name:</strong> {result.full_name}</p>
              <p><strong>Email:</strong> {result.email}</p>
              <p><strong>Password:</strong> {result.password}</p>
              <p><strong>Admission #:</strong> {result.admission_number}</p>
            </div>
            <Button onClick={copyMessage} className="w-full gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Login Message"}
            </Button>
          </div>
        ) : (
          <>
            {enrollInto && (
              <div className="flex gap-2">
                <Button variant={enrollMode === "existing" ? "default" : "outline"} size="sm" onClick={() => setEnrollMode("existing")} className="flex-1">
                  <Search className="w-3 h-3 mr-1" /> Existing Student
                </Button>
                <Button variant={enrollMode === "create" ? "default" : "outline"} size="sm" onClick={() => setEnrollMode("create")} className="flex-1">
                  <UserPlus className="w-3 h-3 mr-1" /> New Student
                </Button>
              </div>
            )}

            {enrollInto && (
              <div className="space-y-2">
                <Label>Access Duration (days)</Label>
                <Input type="number" value={enrollDays} onChange={(e) => setEnrollDays(e.target.value)} />
              </div>
            )}

            {enrollMode === "existing" && enrollInto ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Search by name, email, or admission #..." value={studentSearch} onChange={(e) => searchStudents(e.target.value)} />
                </div>
                {studentResults.length > 0 && (
                  <div className="border border-border rounded-md max-h-48 overflow-y-auto divide-y divide-border">
                    {studentResults.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.full_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground">{s.email} · {s.admission_number || "—"}</p>
                        </div>
                        <Button size="sm" disabled={enrolling} onClick={() => handleEnrollExisting(s.id)}>
                          <UserPlus className="w-3 h-3 mr-1" /> Enroll
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {studentSearch.length >= 2 && studentResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? "Creating..." : enrollInto ? "Create & Enroll" : "Create Student"}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateStudentDialog;
