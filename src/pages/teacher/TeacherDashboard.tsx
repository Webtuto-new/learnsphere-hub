import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Calendar, DollarSign } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<any>(null);
  const [stats, setStats] = useState({ classes: 0, students: 0, sessions: 0, earnings: 0 });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    // Get teacher record by user_id
    const { data: t } = await supabase.from("teachers").select("*").eq("user_id", user!.id).single();
    if (!t) return;
    setTeacher(t);

    const { data: classes } = await supabase.from("classes").select("id").eq("teacher_id", t.id);
    const classIds = (classes || []).map(c => c.id);

    let students = 0, sessions = 0;
    if (classIds.length > 0) {
      const [enrollRes, sessionRes] = await Promise.all([
        supabase.from("enrollments").select("id", { count: "exact" }).in("class_id", classIds).eq("status", "active"),
        supabase.from("class_sessions").select("id", { count: "exact" }).in("class_id", classIds),
      ]);
      students = enrollRes.count || 0;
      sessions = sessionRes.count || 0;

      // Upcoming sessions
      const { data: upcoming } = await supabase.from("class_sessions")
        .select("*, classes:class_id(title)")
        .in("class_id", classIds)
        .gte("session_date", new Date().toISOString().split("T")[0])
        .order("session_date")
        .limit(5);
      setUpcomingSessions(upcoming || []);
    }

    const { data: payouts } = await supabase.from("teacher_payouts").select("amount").eq("teacher_id", t.id);
    const earnings = (payouts || []).reduce((s, p) => s + Number(p.amount), 0);

    setStats({ classes: classIds.length, students, sessions, earnings });
  };

  const statCards = [
    { label: "My Classes", value: stats.classes, icon: BookOpen },
    { label: "Active Students", value: stats.students, icon: Users },
    { label: "Total Sessions", value: stats.sessions, icon: Calendar },
    { label: "Earnings (LKR)", value: stats.earnings.toLocaleString(), icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Teacher Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Upcoming Sessions</CardTitle></CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.classes?.title} • {s.session_date} • {s.start_time}–{s.end_time}</p>
                  </div>
                  {s.zoom_link && (
                    <a href={s.zoom_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Join</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
