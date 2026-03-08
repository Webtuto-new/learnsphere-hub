import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, CreditCard, Calendar, Clock, ExternalLink, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DashboardOverview = () => {
  const { user, profile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendTestEmail = async () => {
    if (!user?.email) return;
    setSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: user.email,
          subject: "🎓 Welcome to Webtuto Academy!",
          html: `<div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;"><div style="text-align: center; margin-bottom: 32px;"><h1 style="font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; color: #1a2340; margin: 0;">Welcome to Webtuto Academy</h1></div><p style="font-size: 16px; color: #555; line-height: 1.6;">Hi ${profile?.full_name || "there"}! 👋</p><p style="font-size: 16px; color: #555; line-height: 1.6;">This is a test email from <strong>Webtuto Academy</strong> — Sri Lanka's #1 online learning platform. If you're seeing this, your email system is working perfectly!</p><div style="text-align: center; margin: 32px 0;"><a href="https://edu.webtuto.lk" style="background: #1a3a7a; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Visit Webtuto Academy</a></div><p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">© 2026 Webtuto Academy. All rights reserved.</p></div>`,
        },
      });
      if (error) throw error;
      toast({ title: "Test email sent!", description: `Check your inbox at ${user.email}` });
    } catch (err: any) {
      toast({ title: "Failed to send email", description: err.message, variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {profile?.full_name}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleSendTestEmail} disabled={sendingEmail} variant="outline" size="sm" className="gap-2">
            <Mail className="w-4 h-4" />
            {sendingEmail ? "Sending..." : "Send Test Email"}
          </Button>
        )}
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
