import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ShareButtons from "@/components/ShareButtons";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sampleClasses } from "@/data/sampleData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, ExternalLink } from "lucide-react";
import PurchaseButton from "@/components/PurchaseButton";
import WishlistButton from "@/components/WishlistButton";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import CountdownTimer from "@/components/CountdownTimer";

const tabs = ["Overview", "Schedule", "Teacher", "Reviews"];

const ClassDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [dbClass, setDbClass] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);

  // Try to load from DB first
  useEffect(() => {
    if (!id) return;
    supabase.from("classes").select("*, teachers(*)").eq("id", id).single()
      .then(({ data }) => {
        if (data) {
          setDbClass(data);
          setTeacher(data.teachers);
          // Fetch sessions
          supabase.from("class_sessions").select("*").eq("class_id", id).order("session_date")
            .then(({ data: s }) => setSessions(s || []));
        }
      });
    if (user) {
      supabase.from("enrollments").select("id").eq("user_id", user.id).eq("class_id", id).eq("status", "active")
        .then(({ data }) => setIsEnrolled(!!data?.length));
    }
  }, [id, user]);

  // Fallback to sample data if DB class not found
  const sampleCls = sampleClasses.find((c) => c.id === id) || sampleClasses[0];
  const cls = dbClass ? {
    title: dbClass.title,
    description: dbClass.description || dbClass.short_description || "",
    curriculum: "National",
    grade: "—",
    subject: "—",
    teacherName: teacher?.name || "Tutor",
    price: Number(dbClass.price),
    originalPrice: dbClass.original_price ? Number(dbClass.original_price) : undefined,
    sessionCount: sessions.length || 4,
    duration: dbClass.duration_minutes ? `${dbClass.duration_minutes} min` : "2 hrs",
    isLive: dbClass.is_live,
    classType: dbClass.class_type,
    thumbnail: dbClass.thumbnail_url,
  } : sampleCls;

  const classId = dbClass?.id || id || "1";
  const price = dbClass ? Number(dbClass.price) : (sampleCls.price || 0);

  const shareLink = `${window.location.origin}/class/${classId}`;

  // Find next upcoming session for countdown
  const now = new Date();
  const nextSession = sessions.find(s => {
    const sessionDate = new Date(`${s.session_date}T${s.start_time}`);
    return sessionDate > now && s.status === "scheduled";
  });

  return (
    <Layout>
      <SEOHead title={cls.title} description={cls.description} path={`/class/${classId}`} />
      {/* Banner */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{cls.curriculum}</Badge>
              {cls.grade && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80">{cls.grade}</Badge>}
              {cls.subject && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80">{cls.subject}</Badge>}
              {dbClass && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80 capitalize">{cls.classType}</Badge>}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">{cls.title}</h1>
            <p className="text-primary-foreground/70 mb-4">{cls.description}</p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {cls.teacherName}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {cls.sessionCount} sessions</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.duration}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown for next session */}
            {nextSession && isEnrolled && (
              <CountdownTimer targetDate={new Date(`${nextSession.session_date}T${nextSession.start_time}`)} sessionTitle={nextSession.title} zoomLink={nextSession.zoom_link} />
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-3">About this class</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {cls.description} This class is designed for students who want to excel in their studies. Our experienced tutor {cls.teacherName} will guide you through all the key topics with interactive sessions, practice problems, and regular assessments.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">What you'll learn</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {["Complete coverage of the syllabus topics", "Past paper practice and exam techniques", "Interactive problem-solving sessions", "Access to session recordings", "Downloadable notes and resources"].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "Schedule" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold text-foreground">Session Schedule</h2>
                {sessions.length > 0 ? sessions.map((session) => {
                  const sessionDate = new Date(`${session.session_date}T${session.start_time}`);
                  const isJoinable = isEnrolled && session.zoom_link && Math.abs(sessionDate.getTime() - now.getTime()) < 15 * 60 * 1000;
                  return (
                    <div key={session.id} className="flex items-center justify-between bg-card rounded-xl p-4 card-elevated">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <span className="font-display font-bold text-secondary">W{session.week_number || "—"}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{session.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.session_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} · {session.start_time} - {session.end_time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.status === "completed" ? "secondary" : session.status === "live" ? "destructive" : "outline"} className="capitalize">{session.status}</Badge>
                        {isJoinable && (
                          <a href={session.zoom_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="gap-1"><ExternalLink className="w-3 h-3" /> Join</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  // Fallback static schedule
                  [1, 2, 3, 4].map(w => (
                    <div key={w} className="flex items-center justify-between bg-card rounded-xl p-4 card-elevated">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <span className="font-display font-bold text-secondary">W{w}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Week {w} — Thursday</p>
                          <p className="text-sm text-muted-foreground">8:00 PM - 10:00 PM</p>
                        </div>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "Teacher" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="font-display font-bold text-secondary text-xl">{cls.teacherName.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">{cls.teacherName}</h2>
                    <p className="text-muted-foreground">{teacher?.qualifications || `${cls.subject} Specialist`}</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {teacher?.bio || `An experienced educator with years of teaching experience. Known for making complex concepts easy to understand through interactive teaching methods.`}
                </p>
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Reviews</h2>
                <ReviewsList classId={classId} key={reviewKey} />
                {user && <ReviewForm classId={classId} onReviewAdded={() => setReviewKey(k => k + 1)} />}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 card-elevated sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display font-bold text-3xl text-foreground">LKR {price.toLocaleString()}</span>
                {cls.originalPrice && (
                  <span className="text-muted-foreground line-through">LKR {cls.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {cls.originalPrice && (
                <p className="text-sm text-accent font-medium mb-4">Save LKR {(cls.originalPrice - price).toLocaleString()}!</p>
              )}

              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="bg-secondary/10 text-secondary text-center p-3 rounded-lg font-medium text-sm">✓ You're enrolled</div>
                  {nextSession?.zoom_link && (
                    <a href={nextSession.zoom_link} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full gap-2" size="lg"><ExternalLink className="w-4 h-4" /> Join Next Class</Button>
                    </a>
                  )}
                </div>
              ) : (
                <PurchaseButton type="class" itemId={classId} price={price} title={cls.title} />
              )}

              <div className="flex gap-2 mt-3">
                <WishlistButton classId={classId} />
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleShare}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share Link"}
                </Button>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                {[
                  { icon: Calendar, text: `${cls.sessionCount} sessions` },
                  { icon: Clock, text: cls.duration },
                  { icon: Video, text: "Recordings included" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="w-4 h-4 text-secondary" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClassDetailPage;
