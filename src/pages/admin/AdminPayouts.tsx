import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign } from "lucide-react";

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ teacher_id: "", amount: "", period_start: "", period_end: "", notes: "" });
  const { toast } = useToast();

  const fetchPayouts = () => {
    supabase.from("teacher_payouts").select("*, teachers(name)").order("created_at", { ascending: false })
      .then(({ data }) => setPayouts(data || []));
  };

  useEffect(() => {
    fetchPayouts();
    supabase.from("teachers").select("id, name").then(({ data }) => setTeachers(data || []));
  }, []);

  const handleSave = async () => {
    const { error } = await supabase.from("teacher_payouts").insert({
      teacher_id: form.teacher_id,
      amount: parseFloat(form.amount),
      period_start: form.period_start,
      period_end: form.period_end,
      notes: form.notes || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Payout created!" }); setOpen(false); setForm({ teacher_id: "", amount: "", period_start: "", period_end: "", notes: "" }); fetchPayouts(); }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("teacher_payouts").update({ status }).eq("id", id);
    fetchPayouts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Teacher Payouts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="w-4 h-4" /> New Payout</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Payout</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.teacher_id} onChange={(e) => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Amount (LKR)</Label><Input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Period Start</Label><Input type="date" value={form.period_start} onChange={(e) => setForm(f => ({ ...f, period_start: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Period End</Label><Input type="date" value={form.period_end} onChange={(e) => setForm(f => ({ ...f, period_end: e.target.value }))} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleSave} className="w-full">Create Payout</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Period</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{(p as any).teachers?.name || "—"}</td>
                    <td className="p-4 text-foreground">LKR {p.amount}</td>
                    <td className="p-4 text-muted-foreground text-xs">{p.period_start} → {p.period_end}</td>
                    <td className="p-4">
                      <select className="text-xs rounded border border-input bg-background px-2 py-1" value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{p.notes || "—"}</td>
                  </tr>
                ))}
                {payouts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payouts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayouts;
