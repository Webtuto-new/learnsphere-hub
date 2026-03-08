import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ThumbnailUpload from "@/components/ThumbnailUpload";

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", short_description: "", class_type: "monthly", price: "", schedule_day: "", schedule_time: "", duration_minutes: "60", is_live: true, thumbnail_url: "" as string | null });
  const { toast } = useToast();

  const fetchClasses = () => {
    supabase.from("classes").select("*, teachers(name)").order("created_at", { ascending: false })
      .then(({ data }) => setClasses(data || []));
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleSave = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      short_description: form.short_description,
      class_type: form.class_type,
      price: parseFloat(form.price) || 0,
      schedule_day: form.schedule_day,
      schedule_time: form.schedule_time || null,
      duration_minutes: parseInt(form.duration_minutes) || 60,
      is_live: form.is_live,
      thumbnail_url: form.thumbnail_url || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("classes").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("classes").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Class updated!" : "Class created!" });
      setOpen(false);
      setEditing(null);
      setForm({ title: "", description: "", short_description: "", class_type: "monthly", price: "", schedule_day: "", schedule_time: "", duration_minutes: "60", is_live: true, thumbnail_url: null });
      fetchClasses();
    }
  };

  const handleEdit = (cls: any) => {
    setEditing(cls);
    setForm({
      title: cls.title,
      description: cls.description || "",
      short_description: cls.short_description || "",
      class_type: cls.class_type,
      price: cls.price?.toString() || "",
      schedule_day: cls.schedule_day || "",
      schedule_time: cls.schedule_time || "",
      duration_minutes: cls.duration_minutes?.toString() || "60",
      is_live: cls.is_live,
      thumbnail_url: cls.thumbnail_url || null,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Get enrollment IDs for this class
      const { data: enrollments } = await supabase.from("enrollments").select("id").eq("class_id", id);
      const enrollmentIds = (enrollments || []).map(e => e.id);

      // Delete payments linked to those enrollments
      if (enrollmentIds.length > 0) {
        const { error: paymentsErr } = await supabase.from("payments").delete().in("enrollment_id", enrollmentIds);
        if (paymentsErr) throw paymentsErr;
      }

      // Delete related records in order
      for (const table of ["enrollments", "class_sessions", "reviews", "wishlists", "waitlists", "bundle_classes", "certificates", "recordings"] as const) {
        const { error } = await supabase.from(table).delete().eq("class_id", id);
        if (error) throw error;
      }

      // Finally delete the class
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Class deleted" });
      fetchClasses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Classes</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); } }}>
          <DialogTrigger asChild>
            <Button className="gap-1"><Plus className="w-4 h-4" /> Add Class</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Class" : "New Class"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Short Description</Label><Input value={form.short_description} onChange={(e) => setForm(f => ({ ...f, short_description: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Description</Label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.class_type} onChange={(e) => setForm(f => ({ ...f, class_type: e.target.value }))}>
                    <option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option><option value="hourly">Hourly</option><option value="recording">Recording</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Price (LKR)</Label><Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Day</Label><Input value={form.schedule_day} onChange={(e) => setForm(f => ({ ...f, schedule_day: e.target.value }))} placeholder="Thursday" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={form.schedule_time} onChange={(e) => setForm(f => ({ ...f, schedule_time: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm(f => ({ ...f, duration_minutes: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"} Class</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{c.title}</td>
                    <td className="p-4 text-muted-foreground capitalize">{c.class_type}</td>
                    <td className="p-4 text-foreground">LKR {c.price}</td>
                    <td className="p-4 text-muted-foreground">{c.teachers?.name || "—"}</td>
                    <td className="p-4 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {classes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No classes yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClasses;
