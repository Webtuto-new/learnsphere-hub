import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", bio: "", qualifications: "", avatar_url: "" });
  const { toast } = useToast();

  const fetchTeachers = () => {
    supabase.from("teachers").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setTeachers(data || []));
  };
  useEffect(() => { fetchTeachers(); }, []);

  const handleSave = async () => {
    const payload = { name: form.name, bio: form.bio, qualifications: form.qualifications, avatar_url: form.avatar_url || null };
    let error;
    if (editing) {
      ({ error } = await supabase.from("teachers").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("teachers").insert(payload));
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Updated!" : "Created!" }); setOpen(false); setEditing(null); setForm({ name: "", bio: "", qualifications: "", avatar_url: "" }); fetchTeachers(); }
  };

  const handleEdit = (t: any) => {
    setEditing(t);
    setForm({ name: t.name, bio: t.bio || "", qualifications: t.qualifications || "", avatar_url: t.avatar_url || "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchTeachers(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Teachers</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild><Button className="gap-1"><Plus className="w-4 h-4" /> Add Teacher</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Teacher</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Bio</Label><textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Qualifications</Label><Input value={form.qualifications} onChange={(e) => setForm(f => ({ ...f, qualifications: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Avatar URL</Label><Input value={form.avatar_url} onChange={(e) => setForm(f => ({ ...f, avatar_url: e.target.value }))} /></div>
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
                <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Qualifications</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{t.name}</td>
                    <td className="p-4 text-muted-foreground">{t.qualifications || "—"}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${t.is_active ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}`}>{t.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="p-4 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No teachers yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeachers;
