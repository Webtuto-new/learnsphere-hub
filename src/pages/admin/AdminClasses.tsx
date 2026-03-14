import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Zap } from "lucide-react";
import ThumbnailUpload from "@/components/ThumbnailUpload";
import { Checkbox } from "@/components/ui/checkbox";

const emptyForm = {
  title: "", description: "", short_description: "", class_type: "monthly",
  price: "", schedule_day: "", schedule_time: "", duration_minutes: "60",
  is_live: true, thumbnail_url: null as string | null,
  teacher_id: "", curriculum_id: "", grade_id: "", subject_id: "",
};

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const { toast } = useToast();

  // Bulk create state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCurriculum, setBulkCurriculum] = useState("");
  const [bulkGrades, setBulkGrades] = useState<any[]>([]);
  const [bulkSelectedGrades, setBulkSelectedGrades] = useState<string[]>([]);
  const [bulkSubjectName, setBulkSubjectName] = useState("");
  const [bulkAllSubjects, setBulkAllSubjects] = useState<any[]>([]);
  const [bulkTeacher, setBulkTeacher] = useState("");
  const [bulkClassType, setBulkClassType] = useState("monthly");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkDay, setBulkDay] = useState("");
  const [bulkTime, setBulkTime] = useState("");
  const [bulkDuration, setBulkDuration] = useState("60");
  const [bulkCreating, setBulkCreating] = useState(false);

  const fetchClasses = () => {
    supabase.from("classes")
      .select("*, teachers(name), curriculums(name), grades(name), subjects(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setClasses(data || []));
  };

  useEffect(() => {
    fetchClasses();
    supabase.from("teachers").select("id, name").eq("is_active", true).then(({ data }) => setTeachers(data || []));
    supabase.from("curriculums").select("id, name").eq("is_active", true).then(({ data }) => setCurriculums(data || []));
  }, []);

  const skipResetRef = useRef(false);

  // Load grades when curriculum changes (single form)
  useEffect(() => {
    if (form.curriculum_id) {
      supabase.from("grades").select("id, name").eq("curriculum_id", form.curriculum_id).eq("is_active", true)
        .order("sort_order")
        .then(({ data }) => { setGrades(data || []); });
    } else {
      setGrades([]);
    }
    if (!skipResetRef.current) {
      setForm(f => ({ ...f, grade_id: "", subject_id: "" }));
      setSubjects([]);
    }
  }, [form.curriculum_id]);

  // Load subjects when grade changes
  useEffect(() => {
    if (form.grade_id) {
      supabase.from("subjects").select("id, name").eq("grade_id", form.grade_id).eq("is_active", true)
        .then(({ data }) => setSubjects(data || []));
    } else {
      setSubjects([]);
    }
    if (!skipResetRef.current) {
      setForm(f => ({ ...f, subject_id: "" }));
    } else {
      skipResetRef.current = false;
    }
  }, [form.grade_id]);

  // Bulk: load grades when curriculum changes
  useEffect(() => {
    if (bulkCurriculum) {
      supabase.from("grades").select("id, name").eq("curriculum_id", bulkCurriculum).eq("is_active", true)
        .order("sort_order")
        .then(({ data }) => setBulkGrades(data || []));
      // Load all subjects for this curriculum's grades to suggest names
      supabase.from("grades").select("id").eq("curriculum_id", bulkCurriculum).then(({ data: gradeRows }) => {
        if (gradeRows && gradeRows.length > 0) {
          supabase.from("subjects").select("name").eq("is_active", true)
            .in("grade_id", gradeRows.map(g => g.id))
            .then(({ data: subs }) => {
              const unique = [...new Set((subs || []).map(s => s.name))].sort();
              setBulkAllSubjects(unique.map(n => ({ name: n })));
            });
        }
      });
    } else {
      setBulkGrades([]);
      setBulkAllSubjects([]);
    }
    setBulkSelectedGrades([]);
  }, [bulkCurriculum]);

  const handleBulkCreate = async () => {
    if (!bulkCurriculum || bulkSelectedGrades.length === 0 || !bulkSubjectName.trim()) {
      toast({ title: "Please select curriculum, grades, and enter a subject name", variant: "destructive" });
      return;
    }
    setBulkCreating(true);

    try {
      const inserts: any[] = [];
      for (const gradeId of bulkSelectedGrades) {
        const grade = bulkGrades.find(g => g.id === gradeId);
        // Find matching subject for this grade
        const { data: matchingSub } = await supabase.from("subjects")
          .select("id").eq("grade_id", gradeId).ilike("name", bulkSubjectName.trim()).maybeSingle();

        inserts.push({
          title: `${bulkSubjectName.trim()} - ${grade?.name || ""}`,
          curriculum_id: bulkCurriculum,
          grade_id: gradeId,
          subject_id: matchingSub?.id || null,
          teacher_id: bulkTeacher || null,
          class_type: bulkClassType,
          price: parseFloat(bulkPrice) || 0,
          schedule_day: bulkDay || null,
          schedule_time: bulkTime || null,
          duration_minutes: parseInt(bulkDuration) || 60,
          is_live: true,
        });
      }

      const { error } = await supabase.from("classes").insert(inserts);
      if (error) throw error;

      toast({ title: `${inserts.length} classes created!` });
      setBulkOpen(false);
      setBulkCurriculum("");
      setBulkSelectedGrades([]);
      setBulkSubjectName("");
      setBulkTeacher("");
      setBulkPrice("");
      fetchClasses();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBulkCreating(false);
    }
  };

  const toggleAllGrades = (checked: boolean) => {
    setBulkSelectedGrades(checked ? bulkGrades.map(g => g.id) : []);
  };

  const handleSave = async () => {
    // Auto-generate description if empty
    const teacherName = teachers.find(t => t.id === form.teacher_id)?.name || "";
    const currName = curriculums.find(c => c.id === form.curriculum_id)?.name || "";
    const gradeName = grades.find(g => g.id === form.grade_id)?.name || "";
    const subjectName = subjects.find(s => s.id === form.subject_id)?.name || "";
    
    let autoDesc = form.description;
    if (!autoDesc?.trim()) {
      const parts = [form.title];
      if (subjectName) parts.push(`Subject: ${subjectName}`);
      if (gradeName) parts.push(`Grade: ${gradeName}`);
      if (currName) parts.push(`Curriculum: ${currName}`);
      if (teacherName) parts.push(`Teacher: ${teacherName}`);
      if (form.schedule_day) parts.push(`Schedule: ${form.schedule_day}${form.schedule_time ? ` at ${form.schedule_time}` : ""}`);
      if (form.duration_minutes) parts.push(`Duration: ${form.duration_minutes} minutes`);
      autoDesc = parts.join(". ") + ".";
    }

    let autoShortDesc = form.short_description;
    if (!autoShortDesc?.trim()) {
      autoShortDesc = [subjectName, gradeName, currName].filter(Boolean).join(" · ") || form.title;
    }

    const payload = {
      title: form.title,
      description: autoDesc,
      short_description: autoShortDesc,
      class_type: form.class_type,
      price: parseFloat(form.price) || 0,
      schedule_day: form.schedule_day,
      schedule_time: form.schedule_time || null,
      duration_minutes: parseInt(form.duration_minutes) || 60,
      is_live: form.is_live,
      thumbnail_url: form.thumbnail_url || null,
      teacher_id: form.teacher_id || null,
      curriculum_id: form.curriculum_id || null,
      grade_id: form.grade_id || null,
      subject_id: form.subject_id || null,
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
      setForm({ ...emptyForm });
      fetchClasses();
    }
  };

  const handleEdit = (cls: any) => {
    setEditing(cls);
    skipResetRef.current = true;
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
      teacher_id: cls.teacher_id || "",
      curriculum_id: cls.curriculum_id || "",
      grade_id: cls.grade_id || "",
      subject_id: cls.subject_id || "",
    });
    if (cls.curriculum_id) {
      supabase.from("grades").select("id, name").eq("curriculum_id", cls.curriculum_id).eq("is_active", true)
        .then(({ data }) => setGrades(data || []));
    }
    if (cls.grade_id) {
      supabase.from("subjects").select("id, name").eq("grade_id", cls.grade_id).eq("is_active", true)
        .then(({ data }) => setSubjects(data || []));
    }
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: enrollments } = await supabase.from("enrollments").select("id").eq("class_id", id);
      const enrollmentIds = (enrollments || []).map(e => e.id);
      if (enrollmentIds.length > 0) {
        const { error: paymentsErr } = await supabase.from("payments").delete().in("enrollment_id", enrollmentIds);
        if (paymentsErr) throw paymentsErr;
      }
      for (const table of ["enrollments", "class_sessions", "reviews", "wishlists", "waitlists", "bundle_classes", "certificates", "recordings"] as const) {
        const { error } = await supabase.from(table).delete().eq("class_id", id);
        if (error) throw error;
      }
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Class deleted" });
      fetchClasses();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const sel = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Classes</h1>
        <div className="flex gap-2">
          {/* Bulk Create Dialog */}
          <Dialog open={bulkOpen} onOpenChange={(v) => { setBulkOpen(v); if (!v) { setBulkCurriculum(""); setBulkSelectedGrades([]); setBulkSubjectName(""); } }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1"><Zap className="w-4 h-4" /> Bulk Create</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Bulk Create Classes</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Select a subject and grades to auto-create classes for each grade at once.</p>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Curriculum</Label>
                  <select className={sel} value={bulkCurriculum} onChange={(e) => setBulkCurriculum(e.target.value)}>
                    <option value="">— Select Curriculum —</option>
                    {curriculums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {bulkGrades.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Grades</Label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
                        <Checkbox
                          checked={bulkSelectedGrades.length === bulkGrades.length && bulkGrades.length > 0}
                          onCheckedChange={(c) => toggleAllGrades(!!c)}
                        />
                        Select All
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
                      {bulkGrades.map(g => (
                        <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={bulkSelectedGrades.includes(g.id)}
                            onCheckedChange={(checked) => {
                              setBulkSelectedGrades(prev =>
                                checked ? [...prev, g.id] : prev.filter(id => id !== g.id)
                              );
                            }}
                          />
                          {g.name}
                        </label>
                      ))}
                    </div>
                    {bulkSelectedGrades.length > 0 && (
                      <p className="text-xs text-primary">{bulkSelectedGrades.length} grade(s) selected</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Subject Name</Label>
                  <Input value={bulkSubjectName} onChange={(e) => setBulkSubjectName(e.target.value)} placeholder="e.g. Mathematics" />
                  {bulkAllSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bulkAllSubjects.map(s => (
                        <button
                          key={s.name}
                          type="button"
                          onClick={() => setBulkSubjectName(s.name)}
                          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                            bulkSubjectName === s.name
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted text-muted-foreground border-border hover:border-primary"
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Teacher (optional)</Label>
                  <select className={sel} value={bulkTeacher} onChange={(e) => setBulkTeacher(e.target.value)}>
                    <option value="">— No Teacher —</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className={sel} value={bulkClassType} onChange={(e) => setBulkClassType(e.target.value)}>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="seminar">Seminar</option>
                      <option value="workshop">Workshop</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (LKR)</Label>
                    <Input type="number" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Day</Label><Input value={bulkDay} onChange={(e) => setBulkDay(e.target.value)} placeholder="Monday" /></div>
                  <div className="space-y-2"><Label>Time</Label><Input type="time" value={bulkTime} onChange={(e) => setBulkTime(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Duration</Label><Input type="number" value={bulkDuration} onChange={(e) => setBulkDuration(e.target.value)} /></div>
                </div>

                {bulkSelectedGrades.length > 0 && bulkSubjectName && (
                  <div className="bg-muted rounded-md p-3 space-y-1">
                    <p className="text-sm font-medium text-foreground">Preview — {bulkSelectedGrades.length} classes will be created:</p>
                    <div className="max-h-32 overflow-y-auto space-y-0.5">
                      {bulkSelectedGrades.map(gId => {
                        const g = bulkGrades.find(gr => gr.id === gId);
                        return <p key={gId} className="text-xs text-muted-foreground">• {bulkSubjectName.trim()} - {g?.name}</p>;
                      })}
                    </div>
                  </div>
                )}

                <Button onClick={handleBulkCreate} disabled={bulkCreating} className="w-full">
                  {bulkCreating ? "Creating..." : `Create ${bulkSelectedGrades.length} Classes`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Single Create Dialog */}
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ ...emptyForm }); } }}>
            <DialogTrigger asChild>
              <Button className="gap-1"><Plus className="w-4 h-4" /> Add Class</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? "Edit Class" : "New Class"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <ThumbnailUpload value={form.thumbnail_url} onChange={(url) => setForm(f => ({ ...f, thumbnail_url: url }))} title={form.title} folder="classes" />
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Short Description</Label><Input value={form.short_description} onChange={(e) => setForm(f => ({ ...f, short_description: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Description</Label><textarea className={sel} rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>

                <div className="space-y-2">
                  <Label>Curriculum</Label>
                  <select className={sel} value={form.curriculum_id} onChange={(e) => setForm(f => ({ ...f, curriculum_id: e.target.value }))}>
                    <option value="">— Select Curriculum —</option>
                    {curriculums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {grades.length > 0 && (
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <select className={sel} value={form.grade_id} onChange={(e) => setForm(f => ({ ...f, grade_id: e.target.value }))}>
                      <option value="">— Select Grade —</option>
                      {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                )}
                {subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <select className={sel} value={form.subject_id} onChange={(e) => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                      <option value="">— Select Subject —</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <select className={sel} value={form.teacher_id} onChange={(e) => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                    <option value="">— Select Teacher —</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select className={sel} value={form.class_type} onChange={(e) => setForm(f => ({ ...f, class_type: e.target.value }))}>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="seminar">Seminar</option>
                      <option value="workshop">Workshop</option>
                      <option value="hourly">Hourly</option>
                      <option value="recording">Recording</option>
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
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Subject</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="p-4 font-medium text-foreground">{c.title}</td>
                    <td className="p-4 text-muted-foreground capitalize">{c.class_type}</td>
                    <td className="p-4 text-muted-foreground">{c.subjects?.name || "—"}</td>
                    <td className="p-4 text-foreground">LKR {c.price}</td>
                    <td className="p-4 text-muted-foreground">{c.teachers?.name || "—"}</td>
                    <td className="p-4 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
                {classes.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No classes yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClasses;
