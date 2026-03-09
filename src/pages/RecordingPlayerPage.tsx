import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft } from "lucide-react";
import PurchaseButton from "@/components/PurchaseButton";

const RecordingPlayerPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [recording, setRecording] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
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
    if (user) {
      supabase.from("enrollments").select("id").eq("user_id", user.id).eq("recording_id", id).eq("status", "active")
        .then(({ data }) => setHasAccess(!!data?.length));
    }
  }, [id, user]);

  if (!recording) return <Layout><div className="pt-28 pb-20 text-center text-muted-foreground">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/recordings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Recordings
          </Link>

          {hasAccess ? (
            <div className="space-y-6">
              <div className="aspect-video bg-foreground/5 rounded-xl overflow-hidden relative">
                {recording.video_url ? (
                  <video controls className="w-full h-full" src={recording.video_url} controlsList="nodownload">
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Play className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{recording.title}</h1>
                <p className="text-muted-foreground mt-1">{recording.teachers?.name || "Tutor"} · {recording.duration_minutes ? `${recording.duration_minutes} min` : ""}</p>
              </div>
              {recording.description && <p className="text-muted-foreground">{recording.description}</p>}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                <Play className="w-20 h-20 text-muted-foreground/30" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">{recording.title}</h1>
              <p className="text-muted-foreground">{recording.description}</p>
              <PurchaseButton
                type="recording"
                itemId={recording.id}
                price={recording.price}
                title={recording.title}
                thumbnail_url={recording.thumbnail_url}
              />
              <p className="text-xs text-muted-foreground">Access for {recording.access_duration_days || 365} days after purchase.</p>
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Related Recordings</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {related.map(r => (
                  <Link key={r.id} to={`/recording/${r.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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

export default RecordingPlayerPage;
