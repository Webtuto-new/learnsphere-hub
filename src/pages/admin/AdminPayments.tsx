import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";
import { format } from "date-fns";

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [form, setForm] = useState({ user_id: "", amount: "", currency: "LKR", payment_method: "", payment_status: "pending", transaction_ref: "", enrollment_id: "" });
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchPayments = async () => {
    const { data } = await supabase.from("payments").select("*, profiles(full_name, admission_number)").order("created_at", { ascending: false });
    setPayments(data || []);
  };

  useEffect(() => {
    fetchPayments();
    supabase.from("profiles").select("id, full_name, admission_number").order("full_name").then(({ data }) => setProfiles(data || []));
    supabase.from("enrollments").select("id, class_id, recording_id, classes(title), recordings(title)").order("enrolled_at", { ascending: false }).then(({ data }) => setEnrollments(data || []));
  }, []);

  const handleSave = async () => {
    const payload = {
      user_id: form.user_id,
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      payment_method: form.payment_method || null,
      payment_status: form.payment_status,
      transaction_ref: form.transaction_ref || null,
      enrollment_id: form.enrollment_id || null,
    };
    let error;
    if (editing) {
      ({ error } = await supabase.from("payments").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("payments").insert(payload));
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: editing ? "Updated!" : "Payment added!" });
      setOpen(false); setEditing(null);
      setForm({ user_id: "", amount: "", currency: "LKR", payment_method: "", payment_status: "pending", transaction_ref: "", enrollment_id: "" });
      fetchPayments();
    }
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({
      user_id: p.user_id,
      amount: p.amount?.toString() || "",
      currency: p.currency || "LKR",
      payment_method: p.payment_method || "",
      payment_status: p.payment_status,
      transaction_ref: p.transaction_ref || "",
      enrollment_id: p.enrollment_id || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchPayments(); }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("payments").update({ payment_status: status }).eq("id", id);
    fetchPayments();
  };

  const filtered = payments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.profiles?.full_name || "").toLowerCase().includes(q) ||
      (p.profiles?.admission_number || "").toLowerCase().includes(q) ||
      (p.transaction_ref || "").toLowerCase().includes(q) ||
      (p.payment_status || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">All Payments</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="w-4 h-4" /> Add Payment</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Payment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.user_id} onChange={(e) => setForm(f => ({ ...f, user_id: e.target.value }))}>
                  <option value="">Select student</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.admission_number})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="LKR">LKR</option><option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.payment_method} onChange={(e) => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                    <option value="">Select</option><option value="bank_transfer">Bank Transfer</option><option value="card">Card</option><option value="cash">Cash</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.payment_status} onChange={(e) => setForm(f => ({ ...f, payment_status: e.target.value }))}>
                    <option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label>Transaction Reference</Label><Input value={form.transaction_ref} onChange={(e) => setForm(f => ({ ...f, transaction_ref: e.target.value }))} placeholder="e.g. bank ref #" /></div>
              <div className="space-y-2">
                <Label>Link to Enrollment (optional)</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.enrollment_id} onChange={(e) => setForm(f => ({ ...f, enrollment_id: e.target.value }))}>
                  <option value="">None</option>
                  {enrollments.filter(e => !form.user_id || e.user_id === form.user_id).map(e => (
                    <option key={e.id} value={e.id}>{e.classes?.title || e.recordings?.title || e.id.slice(0,8)}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Add"} Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Search by student, reference, status..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-foreground">{format(new Date(p.created_at), "PP")}</td>
                    <td className="p-4 text-foreground">{p.profiles?.full_name || "—"} <span className="text-xs text-muted-foreground">{p.profiles?.admission_number}</span></td>
                    <td className="p-4 font-medium text-foreground">{p.currency} {p.amount}</td>
                    <td className="p-4 text-muted-foreground">{p.payment_method || "—"}</td>
                    <td className="p-4">
                      <select className="text-xs rounded border border-input bg-background px-2 py-1" value={p.payment_status} onChange={(e) => updateStatus(p.id, e.target.value)}>
                        <option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{p.transaction_ref || "—"}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No payments found.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
