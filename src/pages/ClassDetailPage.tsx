import Layout from "@/components/Layout";
import { useParams } from "react-router-dom";
import { sampleClasses } from "@/data/sampleData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Users, Share2 } from "lucide-react";
import { useState } from "react";

const weekSessions = [
  { week: 1, day: "Thursday", time: "8:00 PM - 10:00 PM", status: "upcoming" },
  { week: 2, day: "Thursday", time: "8:00 PM - 10:00 PM", status: "upcoming" },
  { week: 3, day: "Thursday", time: "8:00 PM - 10:00 PM", status: "upcoming" },
  { week: 4, day: "Thursday", time: "8:00 PM - 10:00 PM", status: "upcoming" },
];

const tabs = ["Overview", "Schedule", "Teacher"];

const ClassDetailPage = () => {
  const { id } = useParams();
  const cls = sampleClasses.find((c) => c.id === id) || sampleClasses[0];
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <Layout>
      {/* Banner */}
      <div className="hero-gradient pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{cls.curriculum}</Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80">{cls.grade}</Badge>
              <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/80">{cls.subject}</Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              {cls.title}
            </h1>
            <p className="text-primary-foreground/70 mb-4">{cls.description}</p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {cls.teacherName}</span>
              {cls.sessionCount && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {cls.sessionCount} sessions</span>}
              {cls.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.duration}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-3">About this class</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {cls.description} This class is designed for students who want to excel in their {cls.subject} studies under the {cls.curriculum} syllabus. Our experienced tutor {cls.teacherName} will guide you through all the key topics with interactive sessions, practice problems, and regular assessments.
                  </p>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">What you'll learn</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {["Complete coverage of the syllabus topics", "Past paper practice and exam techniques", "Interactive problem-solving sessions", "Access to session recordings"].map((item) => (
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
                {weekSessions.map((session) => (
                  <div key={session.week} className="flex items-center justify-between bg-card rounded-xl p-4 card-elevated">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <span className="font-display font-bold text-secondary">W{session.week}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Week {session.week} — {session.day}</p>
                        <p className="text-sm text-muted-foreground">{session.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Teacher" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="font-display font-bold text-secondary text-xl">
                      {cls.teacherName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">{cls.teacherName}</h2>
                    <p className="text-muted-foreground">{cls.subject} Specialist</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  An experienced educator with years of teaching experience in {cls.subject} for {cls.curriculum} students. Known for making complex concepts easy to understand through interactive teaching methods.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 card-elevated sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display font-bold text-3xl text-foreground">
                  Rs. {cls.price.toLocaleString()}
                </span>
                {cls.originalPrice && (
                  <span className="text-muted-foreground line-through">
                    Rs. {cls.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {cls.originalPrice && (
                <p className="text-sm text-accent font-medium mb-4">
                  Save Rs. {(cls.originalPrice - cls.price).toLocaleString()}!
                </p>
              )}
              <Button className="w-full mb-3" size="lg">Enroll Now</Button>
              <Button variant="outline" className="w-full" size="lg">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <div className="mt-6 space-y-3 text-sm">
                {[
                  { icon: Calendar, text: `${cls.sessionCount || 1} sessions per month` },
                  { icon: Clock, text: cls.duration || "Varies" },
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
