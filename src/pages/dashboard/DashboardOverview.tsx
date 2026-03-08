import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, CreditCard, Calendar, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // Fetch enrollments
    supabase.from("enrollments").select("*, classes(*)").eq("user_id", user.id).eq("status", "active")
      .then(({ data }) => setEnrollments(data || []));
    // Fetch payments
    supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setPayments(data || []));
  }, [user]);

  const stats = [
    { icon: BookOpen, label: "Active Classes", value: enrollments.filter(e => e.class_id).length, color: "text-secondary" },
    { icon: Play, label: "Recordings", value: enrollments.filter(e => e.recording_id).length, color: "text-accent" },
    { icon: CreditCard, label: "Total Payments", value: payments.length, color: "text-primary" },
    { icon: Calendar, label: "Upcoming", value: upcomingSessions.length, color: "text-secondary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {profile?.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">My Classes</CardTitle></CardHeader>
          <CardContent>
            {enrollments.filter(e => e.class_id).length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p className="mb-3">No classes enrolled yet.</p>
                <Link to="/classes"><Button size="sm">Browse Classes</Button></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {enrollments.filter(e => e.class_id).slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.classes?.title || "Class"}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.expires_at ? `Expires: ${new Date(e.expires_at).toLocaleDateString()}` : "Active"}
                      </p>
                    </div>
                    <Link to={`/class/${e.class_id}`}>
                      <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">No payments yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">LKR {p.amount}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.payment_status === "completed" ? "bg-secondary/20 text-secondary" : "bg-muted-foreground/20 text-muted-foreground"
                    }`}>
                      {p.payment_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Profile Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Admission No:</span> <span className="font-medium text-foreground ml-2">{profile?.admission_number || "—"}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-foreground ml-2">{profile?.email || "—"}</span></div>
            <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground ml-2">{profile?.phone || "—"}</span></div>
            <div><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground ml-2">{profile?.address || "—"}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
