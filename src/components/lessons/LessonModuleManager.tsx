import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Pencil, Trash2, Video, FileText, ChevronDown, ArrowUp, ArrowDown, Layers } from "lucide-react";
import FileOrLinkInput from "@/components/FileOrLinkInput";

type Parent =
  | { kind: "class"; id: string }
  | { kind: "recording"; id: string };

interface Props {
  parent: Parent;
}

const MAX_VIDEOS_PER_MODULE = 10;

const LessonModuleManager = ({ parent }: Props) => {
  const { toast } = useToast();
  const [modules, setModules] = useState<any[]>([]);
  const [videosByModule, setVideosByModule] = useState<Record<string, any[]>>({});
  const [docsByModule, setDocsByModule] = useState<Record<string, any[]>>({});
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  // module dialog
  const [modOpen, setModOpen] = useState(false);
  const [editingMod, setEditingMod] = useState<any>(null);
  const [modForm, setModForm] = useState({ title: "", description: "" });

  // video dialog
  const [vidOpen, setVidOpen] = useState(false);
  const [vidModuleId, setVidModuleId] = useState<string | null>(null);
  const [editingVid, setEditingVid] = useState<any>(null);
  const [vidForm, setVidForm] = useState({ title: "", video_url: "", description: "", duration_minutes: "" });

  // doc dialog
  const [docOpen, setDocOpen] = useState(false);
  const [docModuleId, setDocModuleId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({ title: "", file_url: "", file_type: "pdf" });

  const parentFilter = parent.kind === "class" ? { class_id: parent.id } : { recording_id: parent.id };

  const fetchAll = async () => {
    const col = parent.kind === "class" ? "class_id" : "recording_id";
    const { data: mods } = await supabase
      .from("lesson_modules" as any)
      .select("*")
      .eq(col, parent.id)
      .order("sort_order", { ascending: true });
    const ms = (mods as any[]) || [];
    setModules(ms);
    if (ms.length === 0) {
      setVideosByModule({});
      setDocsByModule({});
      return;
    }
    const ids = ms.map((m) => m.id);
    const [{ data: vids }, { data: docs }] = await Promise.all([
      supabase.from("lesson_videos" as any).select("*").in("module_id", ids).order("sort_order"),
      supabase.from("lesson_documents" as any).select("*").in("module_id", ids).order("sort_order"),
    ]);
    const vMap: Record<string, any[]> = {};
    const dMap: Record<string, any[]> = {};
    ((vids as any[]) || []).forEach((v) => {
      (vMap[v.module_id] ||= []).push(v);
    });
    ((docs as any[]) || []).forEach((d) => {
      (dMap[d.module_id] ||= []).push(d);
    });
    setVideosByModule(vMap);
    setDocsByModule(dMap);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parent.kind, parent.id]);

  // ---- Module CRUD
  const openNewModule = () => {
    setEditingMod(null);
    setModForm({ title: "", description: "" });
    setModOpen(true);
  };
  const openEditModule = (m: any) => {
    setEditingMod(m);
    setModForm({ title: m.title || "", description: m.description || "" });
    setModOpen(true);
  };
  const saveModule = async () => {
    if (!modForm.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (editingMod) {
      const { error } = await supabase
        .from("lesson_modules" as any)
        .update({ title: modForm.title, description: modForm.description || null })
        .eq("id", editingMod.id);
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      const sort_order = modules.length;
      const { error } = await supabase
        .from("lesson_modules" as any)
        .insert({ ...parentFilter, title: modForm.title, description: modForm.description || null, sort_order });
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
    setModOpen(false);
    toast({ title: editingMod ? "Lesson updated" : "Lesson added" });
    fetchAll();
  };
  const deleteModule = async (id: string) => {
    if (!confirm("Delete this lesson and all its videos & documents?")) return;
    const { error } = await supabase.from("lesson_modules" as any).delete().eq("id", id);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Lesson deleted" });
    fetchAll();
  };
  const moveModule = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= modules.length) return;
    const a = modules[idx];
    const b = modules[target];
    await Promise.all([
      supabase.from("lesson_modules" as any).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("lesson_modules" as any).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchAll();
  };

  // ---- Video CRUD
  const openNewVideo = (moduleId: string) => {
    const count = (videosByModule[moduleId] || []).length;
    if (count >= MAX_VIDEOS_PER_MODULE) {
      toast({ title: `Max ${MAX_VIDEOS_PER_MODULE} videos per lesson`, variant: "destructive" });
      return;
    }
    setVidModuleId(moduleId);
    setEditingVid(null);
    setVidForm({ title: "", video_url: "", description: "", duration_minutes: "" });
    setVidOpen(true);
  };
  const openEditVideo = (v: any) => {
    setVidModuleId(v.module_id);
    setEditingVid(v);
    setVidForm({
      title: v.title || "",
      video_url: v.video_url || "",
      description: v.description || "",
      duration_minutes: v.duration_minutes != null ? String(v.duration_minutes) : "",
    });
    setVidOpen(true);
  };
  const saveVideo = async () => {
    if (!vidForm.title.trim() || !vidForm.video_url.trim()) {
      toast({ title: "Title and Video URL are required", variant: "destructive" });
      return;
    }
    const payload: any = {
      title: vidForm.title,
      video_url: vidForm.video_url,
      description: vidForm.description || null,
      duration_minutes: vidForm.duration_minutes ? parseInt(vidForm.duration_minutes) : null,
    };
    if (editingVid) {
      const { error } = await supabase.from("lesson_videos" as any).update(payload).eq("id", editingVid.id);
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      const sort_order = (videosByModule[vidModuleId!] || []).length;
      const { error } = await supabase.from("lesson_videos" as any).insert({ ...payload, module_id: vidModuleId, sort_order });
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
    setVidOpen(false);
    toast({ title: editingVid ? "Video updated" : "Video added" });
    fetchAll();
  };
  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("lesson_videos" as any).delete().eq("id", id);
    fetchAll();
  };
  const moveVideo = async (moduleId: string, idx: number, dir: -1 | 1) => {
    const list = videosByModule[moduleId] || [];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[idx];
    const b = list[target];
    await Promise.all([
      supabase.from("lesson_videos" as any).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("lesson_videos" as any).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    fetchAll();
  };

  // ---- Doc CRUD
  const openNewDoc = (moduleId: string) => {
    setDocModuleId(moduleId);
    setEditingDoc(null);
    setDocForm({ title: "", file_url: "", file_type: "pdf" });
    setDocOpen(true);
  };
  const openEditDoc = (d: any) => {
    setDocModuleId(d.module_id);
    setEditingDoc(d);
    setDocForm({ title: d.title || "", file_url: d.file_url || "", file_type: d.file_type || "pdf" });
    setDocOpen(true);
  };
  const saveDoc = async () => {
    if (!docForm.title.trim() || !docForm.file_url.trim()) {
      toast({ title: "Title and File/Link are required", variant: "destructive" });
      return;
    }
    const payload: any = { title: docForm.title, file_url: docForm.file_url, file_type: docForm.file_type };
    if (editingDoc) {
      const { error } = await supabase.from("lesson_documents" as any).update(payload).eq("id", editingDoc.id);
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    } else {
      const sort_order = (docsByModule[docModuleId!] || []).length;
      const { error } = await supabase.from("lesson_documents" as any).insert({ ...payload, module_id: docModuleId, sort_order });
      if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
    setDocOpen(false);
    toast({ title: editingDoc ? "Document updated" : "Document added" });
    fetchAll();
  };
  const deleteDoc = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    await supabase.from("lesson_documents" as any).delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Lessons / Modules</h3>
          <Badge variant="outline" className="text-[10px]">{modules.length}</Badge>
        </div>
        <Button size="sm" onClick={openNewModule} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Lesson
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No lessons yet. Create a lesson to organize videos and documents (e.g. <em>Lesson 01: Intro</em>).
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {modules.map((m, idx) => {
            const vids = videosByModule[m.id] || [];
            const docs = docsByModule[m.id] || [];
            const isOpen = openIds[m.id] ?? true;
            return (
              <Card key={m.id} className="overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={(o) => setOpenIds((s) => ({ ...s, [m.id]: o }))}>
                  <div className="flex items-center gap-2 p-3 bg-muted/30">
                    <CollapsibleTrigger className="flex-1 flex items-center gap-2 text-left">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{m.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <Video className="w-3 h-3" /> {vids.length}
                          </span>
                          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {docs.length}
                          </span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveModule(idx, -1)} disabled={idx === 0}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveModule(idx, 1)} disabled={idx === modules.length - 1}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModule(m)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteModule(m.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <CollapsibleContent>
                    <div className="p-3 space-y-3">
                      {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}

                      {/* Videos */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-foreground">Videos ({vids.length}/{MAX_VIDEOS_PER_MODULE})</p>
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openNewVideo(m.id)} disabled={vids.length >= MAX_VIDEOS_PER_MODULE}>
                            <Plus className="w-3 h-3" /> Add Video
                          </Button>
                        </div>
                        {vids.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic px-1">No videos.</p>
                        ) : (
                          <div className="space-y-1">
                            {vids.map((v, i) => (
                              <div key={v.id} className="flex items-center gap-2 p-2 rounded border border-border bg-background">
                                <Video className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 truncate text-xs text-foreground">{v.title}</span>
                                {v.duration_minutes && <span className="text-[10px] text-muted-foreground">{v.duration_minutes}m</span>}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveVideo(m.id, i, -1)} disabled={i === 0}>
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveVideo(m.id, i, 1)} disabled={i === vids.length - 1}>
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditVideo(v)}>
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteVideo(v.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Documents */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-semibold text-foreground">Documents ({docs.length})</p>
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => openNewDoc(m.id)}>
                            <Plus className="w-3 h-3" /> Add Document
                          </Button>
                        </div>
                        {docs.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground italic px-1">No documents.</p>
                        ) : (
                          <div className="space-y-1">
                            {docs.map((d) => (
                              <div key={d.id} className="flex items-center gap-2 p-2 rounded border border-border bg-background">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 truncate text-xs text-foreground">{d.title}</span>
                                <Badge variant="outline" className="text-[9px] uppercase">{d.file_type}</Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDoc(d)}>
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteDoc(d.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Module dialog */}
      <Dialog open={modOpen} onOpenChange={setModOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingMod ? "Edit Lesson" : "New Lesson"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Lesson Title</Label>
              <Input value={modForm.title} onChange={(e) => setModForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Lesson 01: AI Video Generation" />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea value={modForm.description} onChange={(e) => setModForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <Button onClick={saveModule} className="w-full">{editingMod ? "Save changes" : "Create lesson"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video dialog */}
      <Dialog open={vidOpen} onOpenChange={setVidOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingVid ? "Edit Video" : "Add Video"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Video Title</Label>
              <Input value={vidForm.title} onChange={(e) => setVidForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Kling AI Video Generation" />
            </div>
            <FileOrLinkInput
              value={vidForm.video_url || null}
              onChange={(url) => setVidForm((f) => ({ ...f, video_url: url || "" }))}
              bucket="videos"
              folder="lessons"
              accept="video/*"
              label="Video (YouTube URL or upload)"
              linkPlaceholder="https://youtube.com/watch?v=... or direct video URL"
              uploadHint="Drag & drop a video file (up to 500MB)"
              previewType="video"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (min)</Label>
                <Input type="number" value={vidForm.duration_minutes} onChange={(e) => setVidForm((f) => ({ ...f, duration_minutes: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea value={vidForm.description} onChange={(e) => setVidForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <Button onClick={saveVideo} className="w-full">{editingVid ? "Save changes" : "Add video"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document dialog */}
      <Dialog open={docOpen} onOpenChange={setDocOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingDoc ? "Edit Document" : "Add Document"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Document Title</Label>
              <Input value={docForm.title} onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Documents Folder / Cheatsheet PDF" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={docForm.file_type}
                onChange={(e) => setDocForm((f) => ({ ...f, file_type: e.target.value }))}
              >
                <option value="pdf">PDF</option>
                <option value="doc">DOC / DOCX</option>
                <option value="ppt">PPT / PPTX</option>
                <option value="zip">ZIP</option>
                <option value="image">Image</option>
                <option value="link">External Link</option>
                <option value="other">Other</option>
              </select>
            </div>
            <FileOrLinkInput
              value={docForm.file_url || null}
              onChange={(url) => setDocForm((f) => ({ ...f, file_url: url || "" }))}
              bucket="documents"
              folder="lessons"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.webp"
              label="File (Upload or paste link)"
              linkPlaceholder="https://drive.google.com/... or any URL"
              uploadHint="Drag & drop a file (PDF, DOC, PPT, ZIP, image)"
            />
            <Button onClick={saveDoc} className="w-full">{editingDoc ? "Save changes" : "Add document"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonModuleManager;
