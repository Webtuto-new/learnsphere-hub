import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Video } from "lucide-react";

const AdminSessions = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", week_number: "", session_date: "", start_time: "", end_time: "", zoom_link: "", recording_url: "" });
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("classes").select("id, title").order("title").then(({ data }) => setClasses(data || []));
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSessions([]); return; }
    supabase.from("class_sessions").select("*").eq("class_id", selectedClass).order("session_date")
      .then(({ data }) => setSessions(data || []));
  }, [selectedClass]);

  const handleSave = async () => {
    const payload = {
      class_id: selectedClass,
      title: form.title,
      week_number: parseInt(form.week_number) || null,
      session_date: form.session_date,
      start_time: form.start_time,
      end_time: form.end_time,
      zoom_link: form.zoom_link || null,
      recording_url: form.recording_url || null,
    };
    let error;
    if (editing) ({ error } = await supabase.from("class_sessions").update(payload).eq("id", editing.id));
    else ({ error } = await supabase.from("class_sessions").insert(payload));
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: editing ? "Updated!" : "Created!" });
      setOpen(false); setEditing(null);
      setForm({ title: "", week_number: "", session_date: "", start_time: "", end_time: "", zoom_link: "", recording_url: "" });
      // refetch
      const { data } = await supabase.from("class_sessions").select("*").eq("class_id", selectedClass).order("session_date");
      setSessions(data || []);
    }
  };

  const handleEdit = (s: any) => {
    setEditing(s);
    setForm({ title: s.title, week_number: s.week_number?.toString() || "", session_date: s.session_date, start_time: s.start_time, end_time: s.end_time, zoom_link: s.zoom_link || "", recording_url: s.recording_url || "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("class_sessions").delete().eq("id", id);
    toast({ title: "Deleted" });
    const { data } = await supabase.from("class_sessions").select("*").eq("class_id", selectedClass).order("session_date");
    setSessions(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("class_sessions").update({ status }).eq("id", id);
    const { data } = await supabase.from("class_sessions").select("*").eq("class_id", selectedClass).order("session_date");
    setSessions(data || []);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Class Sessions & Zoom</h1>
        {selectedClass && (
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <DialogTrigger asChild><Button className="gap-1"><Plus className="w-4 h-4" /> Add Session</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Session</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Week 1 - Introduction" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Week #</Label><Input type="number" value={form.week_number} onChange={(e) => setForm(f => ({ ...f, week_number: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.session_date} onChange={(e) => setForm(f => ({ ...f, session_date: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>End Time</Label><Input type="time" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))} /></div>
                </div>
                <div className="space-y-2"><Label>Zoom Meeting Link</Label><Input value={form.zoom_link} onChange={(e) => setForm(f => ({ ...f, zoom_link: e.target.value }))} placeholder="https://zoom.us/j/..." /></div>
                <div className="space-y-2"><Label>Recording URL (optional)</Label><Input value={form.recording_url} onChange={(e) => setForm(f => ({ ...f, recording_url: e.target.value }))} /></div>
                <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"} Session</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        <Label>Select Class</Label>
        <select className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="">— Choose a class —</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedClass && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Week</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Zoom</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                </tr></thead>
                <tbody>
                  {sessions.map(s => (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="p-4 text-foreground">{s.week_number || "—"}</td>
                      <td className="p-4 font-medium text-foreground">{s.title}</td>
                      <td className="p-4 text-muted-foreground">{new Date(s.session_date).toLocaleDateString()}</td>
                      <td className="p-4 text-muted-foreground">{s.start_time} - {s.end_time}</td>
                      <td className="p-4">{s.zoom_link ? <a href={s.zoom_link} target="_blank" className="text-primary hover:underline text-xs">Link</a> : "—"}</td>
                      <td className="p-4">
                        <select className="text-xs rounded border border-input bg-background px-2 py-1" value={s.status} onChange={(e) => updateStatus(s.id, e.target.value)}>
                          <option value="scheduled">Scheduled</option>
                          <option value="live">Live</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No sessions. Add one above.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSessions;
