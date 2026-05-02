import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, FileText, Download, Lock, ChevronDown, Video as VideoIcon, Layers } from "lucide-react";

type Parent =
  | { kind: "class"; id: string }
  | { kind: "recording"; id: string };

interface Props {
  parent: Parent;
  hasAccess: boolean;
}

const isYouTube = (url: string) => /(?:youtube\.com|youtu\.be)/i.test(url);
const ytEmbed = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
};

const LessonModuleViewer = ({ parent, hasAccess }: Props) => {
  const [modules, setModules] = useState<any[]>([]);
  const [videosByModule, setVideosByModule] = useState<Record<string, any[]>>({});
  const [docsByModule, setDocsByModule] = useState<Record<string, any[]>>({});
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const col = parent.kind === "class" ? "class_id" : "recording_id";
    supabase
      .from("lesson_modules" as any)
      .select("*")
      .eq(col, parent.id)
      .eq("is_active", true)
      .order("sort_order")
      .then(async ({ data }) => {
        const ms = (data as any[]) || [];
        setModules(ms);
        if (ms.length === 0) return;
        const ids = ms.map((m) => m.id);
        const [{ data: vids }, { data: docs }] = await Promise.all([
          supabase.from("lesson_videos" as any).select("*").in("module_id", ids).order("sort_order"),
          supabase.from("lesson_documents" as any).select("*").in("module_id", ids).order("sort_order"),
        ]);
        const vMap: Record<string, any[]> = {};
        const dMap: Record<string, any[]> = {};
        ((vids as any[]) || []).forEach((v) => (vMap[v.module_id] ||= []).push(v));
        ((docs as any[]) || []).forEach((d) => (dMap[d.module_id] ||= []).push(d));
        setVideosByModule(vMap);
        setDocsByModule(dMap);
        // Open the first lesson by default
        setOpenIds({ [ms[0].id]: true });
      });
  }, [parent.kind, parent.id]);

  if (modules.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">Course Lessons</h2>
        <Badge variant="outline" className="text-[10px]">{modules.length}</Badge>
      </div>

      <div className="space-y-2">
        {modules.map((m, idx) => {
          const vids = videosByModule[m.id] || [];
          const docs = docsByModule[m.id] || [];
          const isOpen = openIds[m.id] ?? idx === 0;
          return (
            <Card key={m.id} className="overflow-hidden">
              <Collapsible open={isOpen} onOpenChange={(o) => setOpenIds((s) => ({ ...s, [m.id]: o }))}>
                <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left">
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{m.title}</p>
                    {m.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{m.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <VideoIcon className="w-3 h-3" /> {vids.length}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <FileText className="w-3 h-3" /> {docs.length}
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 space-y-4">
                    {/* Videos */}
                    {vids.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Videos</p>
                        {vids.map((v) => (
                          <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Play className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
                              {v.duration_minutes && <p className="text-[11px] text-muted-foreground">{v.duration_minutes} min</p>}
                            </div>
                            {hasAccess ? (
                              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPlaying({ url: v.video_url, title: v.title })}>
                                <Play className="w-3.5 h-3.5" /> Watch
                              </Button>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-[10px]"><Lock className="w-3 h-3" /> Locked</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Documents */}
                    {docs.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</p>
                        {docs.map((d) => (
                          <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{d.title}</p>
                              <p className="text-[11px] text-muted-foreground uppercase">{d.file_type}</p>
                            </div>
                            {hasAccess ? (
                              <a href={d.file_url} target="_blank" rel="noopener noreferrer" download>
                                <Button size="sm" variant="outline" className="gap-1.5">
                                  <Download className="w-3.5 h-3.5" /> Open
                                </Button>
                              </a>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-[10px]"><Lock className="w-3 h-3" /> Locked</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {vids.length === 0 && docs.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">This lesson has no content yet.</p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Player dialog */}
      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{playing?.title}</DialogTitle></DialogHeader>
          {playing && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
              {isYouTube(playing.url) ? (
                <iframe
                  src={ytEmbed(playing.url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={playing.url} controls autoPlay className="w-full h-full" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonModuleViewer;
