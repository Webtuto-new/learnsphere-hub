import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft, Clock, Lock, ListVideo, ChevronRight } from "lucide-react";
import PurchaseButton from "@/components/PurchaseButton";

interface Lesson {
  id: string;
  title: string;
  video_url: string;
  duration_minutes: number | null;
  episode_number: number | null; // DB field name, displayed as lesson number
  is_active: boolean;
}

const RecordingPlayerPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [recording, setRecording] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    supabase.from("recordings").select("*, teachers(name)").eq("id", id).single()
      .then(({ data }) => {
        setRecording(data);
        if (data?.subject_id) {
          supabase.from("recordings").select("id, title, thumbnail_url").eq("subject_id", data.subject_id).neq("id", id).limit(4)
            .then(({ data: rel }) => setRelated(rel || []));
        }
      });

    // Fetch lessons from recording_videos
    supabase.from("recording_videos").select("*").eq("recording_id", id).eq("is_active", true).order("episode_number", { ascending: true })
      .then(({ data }) => {
        const lessonsData = data || [];
        setLessons(lessonsData);
        if (lessonsData.length > 0) setActiveLesson(lessonsData[0]);
      });

    if (user) {
      supabase.from("enrollments").select("id").eq("user_id", user.id).eq("recording_id", id).eq("status", "active")
        .then(({ data }) => setHasAccess(!!data?.length));
    }
  }, [id, user]);

  if (!recording) {
    return (
      <Layout>
        <div className="pt-28 pb-20 text-center text-muted-foreground">
          <div className="animate-pulse space-y-4 max-w-3xl mx-auto px-4">
            <div className="aspect-video bg-muted rounded-2xl" />
            <div className="h-8 bg-muted rounded-lg w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/3 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  const totalDuration = episodes.reduce((sum, ep) => sum + (ep.duration_minutes || 0), 0);

  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Back nav */}
          <Link to="/recordings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Recordings
          </Link>

          {hasAccess ? (
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              {/* Main player area */}
              <div className="space-y-5">
                {/* Video player */}
                <div className="aspect-video bg-foreground rounded-2xl overflow-hidden relative shadow-lg">
                  {activeEpisode ? (
                    <video
                      key={activeEpisode.id}
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-black"
                      src={activeEpisode.video_url}
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/60 bg-muted/50">
                      <Play className="w-16 h-16 mb-2" />
                      <p className="text-sm">No episodes available yet</p>
                    </div>
                  )}
                </div>

                {/* Now playing info */}
                <div className="space-y-2">
                  <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                    {recording.title}
                  </h1>
                  {activeEpisode && (
                    <p className="text-primary font-medium text-sm">
                      Now Playing: {activeEpisode.title}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {recording.teachers?.name && <span>{recording.teachers.name}</span>}
                    {totalDuration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {totalDuration} min total
                      </span>
                    )}
                    <span>{episodes.length} episode{episodes.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {recording.description && (
                  <p className="text-muted-foreground leading-relaxed">{recording.description}</p>
                )}

                {/* Mobile episode list */}
                <div className="lg:hidden">
                  <EpisodeList
                    episodes={episodes}
                    activeEpisode={activeEpisode}
                    onSelect={setActiveEpisode}
                  />
                </div>
              </div>

              {/* Sidebar episode list (desktop) */}
              <div className="hidden lg:block">
                <EpisodeList
                  episodes={episodes}
                  activeEpisode={activeEpisode}
                  onSelect={setActiveEpisode}
                />
              </div>
            </div>
          ) : (
            /* Purchase view */
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="aspect-video bg-gradient-to-br from-foreground/5 to-foreground/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.08)_0%,_transparent_70%)]" />
                <Lock className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">Purchase to unlock all episodes</p>
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">{recording.title}</h1>
                {recording.description && <p className="text-muted-foreground">{recording.description}</p>}
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  {recording.teachers?.name && <span>{recording.teachers.name}</span>}
                  {episodes.length > 0 && <span>{episodes.length} episode{episodes.length !== 1 ? "s" : ""}</span>}
                </div>
              </div>
              <div className="max-w-sm mx-auto">
                <PurchaseButton
                  type="recording"
                  itemId={recording.id}
                  price={recording.price}
                  title={recording.title}
                  thumbnail_url={recording.thumbnail_url}
                />
              </div>
              <p className="text-xs text-muted-foreground">Access for {recording.access_duration_days || 365} days after purchase.</p>

              {/* Episode preview list */}
              {episodes.length > 0 && (
                <div className="text-left mt-8">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ListVideo className="w-5 h-5 text-primary" /> Course Content
                  </h3>
                  <div className="space-y-2">
                    {episodes.map((ep, i) => (
                      <div key={ep.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                          {ep.episode_number || i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{ep.title}</p>
                          {ep.duration_minutes && (
                            <p className="text-xs text-muted-foreground">{ep.duration_minutes} min</p>
                          )}
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-xl font-bold text-foreground mb-5">Related Recordings</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map(r => (
                  <Link key={r.id} to={`/recording/${r.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 border-border/50">
                      <CardContent className="p-4">
                        <p className="font-medium text-foreground text-sm">{r.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

/* Episode list sidebar component */
const EpisodeList = ({
  episodes,
  activeEpisode,
  onSelect,
}: {
  episodes: Episode[];
  activeEpisode: Episode | null;
  onSelect: (ep: Episode) => void;
}) => (
  <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
    <div className="p-4 border-b border-border/60">
      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
        <ListVideo className="w-4 h-4 text-primary" />
        Episodes ({episodes.length})
      </h3>
    </div>
    <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/40">
      {episodes.map((ep, i) => {
        const isActive = activeEpisode?.id === ep.id;
        return (
          <button
            key={ep.id}
            onClick={() => onSelect(ep)}
            className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors hover:bg-muted/60 ${
              isActive ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {isActive ? <Play className="w-3.5 h-3.5" /> : (ep.episode_number || i + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                {ep.title}
              </p>
              {ep.duration_minutes && (
                <p className="text-xs text-muted-foreground">{ep.duration_minutes} min</p>
              )}
            </div>
            <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
          </button>
        );
      })}
      {episodes.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No episodes added yet.
        </div>
      )}
    </div>
  </div>
);

export default RecordingPlayerPage;
