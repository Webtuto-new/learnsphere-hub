import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminRecordings = () => {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", video_url: "", thumbnail_url: "", price: "", duration_minutes: "", access_duration_days: "365" });
  const { toast } = useToast();

  const fetchRecordings = () => {
    supabase.from("recordings").select("*, teachers(name)").order("created_at", { ascending: false })
      .then(({ data }) => setRecordings(data || []));
  };
  useEffect(() => { fetchRecordings(); }, []);

  const handleSave = async () => {
    const payload = {
      title: form.title, description: form.description, video_url: form.video_url,
      thumbnail_url: form.thumbnail_url || null, price: parseFloat(form.price) || 0,
      duration_minutes: parseInt(form.duration_minutes) || null,
      access_duration_days: parseInt(form.access_duration_days) || 365,
    };
    let error;
    if (editing) ({ error } = await supabase.from("recordings").update(payload).eq("id", editing.id));
    else ({ error } = await supabase.from("recordings").insert(payload));
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved!" }); setOpen(false); setEditing(null); setForm({ title: "", description: "", video_url: "", thumbnail_url: "", price: "", duration_minutes: "", access_duration_days: "365" }); fetchRecordings(); }
  };

  const handleEdit = (r: any) => {
    setEditing(r);
    setForm({ title: r.title, description: r.description || "", video_url: r.video_url, thumbnail_url: r.thumbnail_url || "", price: r.price?.toString() || "", duration_minutes: r.duration_minutes?.toString() || "", access_duration_days: r.access_duration_days?.toString() || "365" });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Recordings</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="w-4 h-4" /> Add Recording</Button></DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Recording</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Description</Label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Video URL</Label><Input value={form.video_url} onChange={(e) => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="space-y-2"><Label>Thumbnail URL</Label><Input value={form.thumbnail_url} onChange={(e) => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Price (LKR)</Label><Input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm(f => ({ ...f, duration_minutes: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Access (days)</Label><Input type="number" value={form.access_duration_days} onChange={(e) => setForm(f => ({ ...f, access_duration_days: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
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
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Duration</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {recordings.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{r.title}</td>
                    <td className="p-4 text-foreground">LKR {r.price}</td>
                    <td className="p-4 text-muted-foreground">{r.duration_minutes ? `${r.duration_minutes}min` : "—"}</td>
                    <td className="p-4 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={async () => { await supabase.from("recordings").delete().eq("id", r.id); fetchRecordings(); }} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {recordings.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No recordings.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRecordings;
