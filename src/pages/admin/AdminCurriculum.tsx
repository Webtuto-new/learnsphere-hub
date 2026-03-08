import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";

const AdminCurriculum = () => {
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ type: string; editing: any } | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const { toast } = useToast();

  const fetchAll = async () => {
    const [c, g, s] = await Promise.all([
      supabase.from("curriculums").select("*").order("sort_order"),
      supabase.from("grades").select("*").order("sort_order"),
      supabase.from("subjects").select("*").order("sort_order"),
    ]);
    setCurriculums(c.data || []);
    setGrades(g.data || []);
    setSubjects(s.data || []);
  };
  useEffect(() => { fetchAll(); }, []);

  const filteredGrades = grades.filter(g => g.curriculum_id === selectedCurriculum);
  const filteredSubjects = subjects.filter(s => s.grade_id === selectedGrade);

  const handleSave = async () => {
    const { type, editing } = dialog!;
    let error;
    if (type === "curriculum") {
      const payload = { name: form.name, slug: form.slug };
      if (editing) ({ error } = await supabase.from("curriculums").update(payload).eq("id", editing.id));
      else ({ error } = await supabase.from("curriculums").insert(payload));
    } else if (type === "grade") {
      const payload = { name: form.name, slug: form.slug, curriculum_id: selectedCurriculum };
      if (editing) ({ error } = await supabase.from("grades").update(payload).eq("id", editing.id));
      else ({ error } = await supabase.from("grades").insert(payload));
    } else {
      const payload = { name: form.name, slug: form.slug, grade_id: selectedGrade };
      if (editing) ({ error } = await supabase.from("subjects").update(payload).eq("id", editing.id));
      else ({ error } = await supabase.from("subjects").insert(payload));
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Saved!" }); setDialog(null); setForm({ name: "", slug: "" }); fetchAll(); }
  };

  const toggleActive = async (table: "curriculums" | "grades" | "subjects", id: string, current: boolean) => {
    await (supabase.from(table) as any).update({ is_active: !current }).eq("id", id);
    fetchAll();
  };

  const handleDelete = async (table: "curriculums" | "grades" | "subjects", id: string) => {
    await (supabase.from(table) as any).delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchAll();
  };

  const openDialog = (type: string, editing?: any) => {
    setDialog({ type, editing: editing || null });
    setForm(editing ? { name: editing.name, slug: editing.slug } : { name: "", slug: "" });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Curriculum Management</h1>

      <Dialog open={!!dialog} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog?.editing ? "Edit" : "Add"} {dialog?.type}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => { const name = e.target.value; setForm(f => ({ ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })); }} /></div>
            <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated from name" /></div>
            <Button onClick={handleSave} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Curriculums */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Curriculums</CardTitle>
            <Button size="sm" onClick={() => openDialog("curriculum")}><Plus className="w-3 h-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {curriculums.map(c => (
              <div key={c.id} onClick={() => { setSelectedCurriculum(c.id); setSelectedGrade(null); }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedCurriculum === c.id ? "bg-primary/10 border border-primary/20" : "bg-muted hover:bg-muted/80"}`}>
                <div className="flex items-center gap-2">
                  <Switch checked={c.is_active} onCheckedChange={() => toggleActive("curriculums", c.id, c.is_active)} />
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog("curriculum", c); }}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete("curriculums", c.id); }} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
            {curriculums.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No curriculums</p>}
          </CardContent>
        </Card>

        {/* Grades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Grades</CardTitle>
            {selectedCurriculum && <Button size="sm" onClick={() => openDialog("grade")}><Plus className="w-3 h-3" /></Button>}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedCurriculum ? <p className="text-sm text-muted-foreground text-center py-4">Select a curriculum</p> : filteredGrades.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No grades</p> :
              filteredGrades.map(g => (
                <div key={g.id} onClick={() => setSelectedGrade(g.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedGrade === g.id ? "bg-primary/10 border border-primary/20" : "bg-muted hover:bg-muted/80"}`}>
                  <div className="flex items-center gap-2">
                    <Switch checked={g.is_active} onCheckedChange={() => toggleActive("grades", g.id, g.is_active)} />
                    <span className="text-sm font-medium text-foreground">{g.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog("grade", g); }}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete("grades", g.id); }} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Subjects</CardTitle>
            {selectedGrade && <Button size="sm" onClick={() => openDialog("subject")}><Plus className="w-3 h-3" /></Button>}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedGrade ? <p className="text-sm text-muted-foreground text-center py-4">Select a grade</p> : filteredSubjects.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No subjects</p> :
              filteredSubjects.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Switch checked={s.is_active} onCheckedChange={() => toggleActive("subjects", s.id, s.is_active)} />
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDialog("subject", s)}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete("subjects", s.id)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCurriculum;
