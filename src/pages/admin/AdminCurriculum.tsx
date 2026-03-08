import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
    if (!dialog) return;
    const { type, editing } = dialog;

    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    const slug = form.slug.trim() || generateSlug(form.name);
    let error;

    if (type === "curriculum") {
      const payload = { name: form.name.trim(), slug };
      if (editing) {
        ({ error } = await supabase.from("curriculums").update(payload).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("curriculums").insert(payload));
      }
    } else if (type === "grade") {
      if (!selectedCurriculum) {
        toast({ title: "Select a curriculum first", variant: "destructive" });
        return;
      }
      const payload = { name: form.name.trim(), slug, curriculum_id: selectedCurriculum };
      if (editing) {
        ({ error } = await supabase.from("grades").update({ name: form.name.trim(), slug }).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("grades").insert(payload));
      }
    } else if (type === "subject") {
      if (!selectedGrade) {
        toast({ title: "Select a grade first", variant: "destructive" });
        return;
      }
      const payload = { name: form.name.trim(), slug, grade_id: selectedGrade };
      if (editing) {
        ({ error } = await supabase.from("subjects").update({ name: form.name.trim(), slug }).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("subjects").insert(payload));
      }
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Updated!" : "Created!" });
      setDialog(null);
      setForm({ name: "", slug: "" });
      fetchAll();
    }
  };

  const toggleActive = async (table: string, id: string, current: boolean) => {
    const { error } = await supabase.from(table as any).update({ is_active: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Update local state immediately for instant feedback
      if (table === "curriculums") setCurriculums(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
      else if (table === "grades") setGrades(prev => prev.map(g => g.id === id ? { ...g, is_active: !current } : g));
      else if (table === "subjects") setSubjects(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
    }
  };

  const handleDelete = async (table: string, id: string) => {
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      if (table === "curriculums" && selectedCurriculum === id) { setSelectedCurriculum(null); setSelectedGrade(null); }
      if (table === "grades" && selectedGrade === id) setSelectedGrade(null);
      fetchAll();
    }
  };

  const openDialog = (type: string, editing?: any) => {
    setDialog({ type, editing: editing || null });
    setForm(editing ? { name: editing.name, slug: editing.slug } : { name: "", slug: "" });
  };

  const selectedCurriculumName = curriculums.find(c => c.id === selectedCurriculum)?.name;
  const selectedGradeName = grades.find(g => g.id === selectedGrade)?.name;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Curriculum Management</h1>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className={selectedCurriculum ? "cursor-pointer hover:text-foreground" : "text-foreground font-medium"} onClick={() => { setSelectedCurriculum(null); setSelectedGrade(null); }}>
          Curriculums
        </span>
        {selectedCurriculum && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className={selectedGrade ? "cursor-pointer hover:text-foreground" : "text-foreground font-medium"} onClick={() => setSelectedGrade(null)}>
              {selectedCurriculumName}
            </span>
          </>
        )}
        {selectedGrade && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{selectedGradeName}</span>
          </>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.editing ? "Edit" : "Add"} {dialog?.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm(f => ({
                    ...f,
                    name,
                    slug: dialog?.editing ? f.slug : generateSlug(name),
                  }));
                }}
                placeholder={`e.g. ${dialog?.type === "curriculum" ? "National Syllabus" : dialog?.type === "grade" ? "Grade 8" : "Mathematics"}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug <span className="text-muted-foreground text-xs">(auto-generated)</span></Label>
              <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <Button onClick={handleSave} className="w-full">
              {dialog?.editing ? "Update" : "Create"} {dialog?.type}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Curriculums */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Curriculums</CardTitle>
            <Button size="sm" onClick={() => openDialog("curriculum")} className="gap-1">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {curriculums.map(c => (
              <div
                key={c.id}
                onClick={() => { setSelectedCurriculum(c.id); setSelectedGrade(null); }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCurriculum === c.id ? "bg-primary/10 border border-primary/20" : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={c.is_active}
                    onCheckedChange={(e) => { toggleActive("curriculums", c.id, c.is_active); }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <span className={`text-sm font-medium ${c.is_active ? "text-foreground" : "text-muted-foreground line-through"}`}>{c.name}</span>
                    <p className="text-xs text-muted-foreground">{grades.filter(g => g.curriculum_id === c.id).length} grades</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog("curriculum", c); }}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete("curriculums", c.id); }} className="text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {curriculums.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No curriculums yet</p>}
          </CardContent>
        </Card>

        {/* Grades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Grades</CardTitle>
            {selectedCurriculum && (
              <Button size="sm" onClick={() => openDialog("grade")} className="gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedCurriculum ? (
              <p className="text-sm text-muted-foreground text-center py-4">← Select a curriculum</p>
            ) : filteredGrades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No grades yet. Click Add to create one.</p>
            ) : (
              filteredGrades.map(g => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedGrade === g.id ? "bg-primary/10 border border-primary/20" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={g.is_active}
                      onCheckedChange={() => toggleActive("grades", g.id, g.is_active)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <span className={`text-sm font-medium ${g.is_active ? "text-foreground" : "text-muted-foreground line-through"}`}>{g.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {subjects.filter(s => s.grade_id === g.id && s.is_active).length}/{subjects.filter(s => s.grade_id === g.id).length} subjects active
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDialog("grade", g); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete("grades", g.id); }} className="text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Subjects</CardTitle>
            {selectedGrade && (
              <Button size="sm" onClick={() => openDialog("subject")} className="gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedGrade ? (
              <p className="text-sm text-muted-foreground text-center py-4">← Select a grade</p>
            ) : filteredSubjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No subjects yet. Click Add to create one.</p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-2">Toggle off subjects that don't apply to this grade. They won't show to students.</p>
                {filteredSubjects.map(s => (
                  <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${s.is_active ? "bg-muted" : "bg-muted/40"}`}>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={s.is_active}
                        onCheckedChange={() => toggleActive("subjects", s.id, s.is_active)}
                      />
                      <span className={`text-sm font-medium ${s.is_active ? "text-foreground" : "text-muted-foreground line-through"}`}>{s.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDialog("subject", s)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("subjects", s.id)} className="text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCurriculum;
