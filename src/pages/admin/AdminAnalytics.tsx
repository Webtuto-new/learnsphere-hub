import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, CreditCard, BookOpen } from "lucide-react";

const AdminAnalytics = () => {
  const [data, setData] = useState({ totalRevenue: 0, monthlyRevenue: 0, totalStudents: 0, totalEnrollments: 0, topClasses: [] as any[] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [paymentsRes, studentsRes, enrollmentsRes, topRes] = await Promise.all([
        supabase.from("payments").select("amount, created_at").eq("payment_status", "completed"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("id", { count: "exact", head: true }),
        supabase.from("enrollments").select("class_id, classes(title)").not("class_id", "is", null),
      ]);

      const payments = paymentsRes.data || [];
      const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyRevenue = payments
        .filter((p: any) => new Date(p.created_at) >= thisMonth)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      // Count top classes
      const classCounts: Record<string, { title: string; count: number }> = {};
      (topRes.data || []).forEach((e: any) => {
        if (e.class_id) {
          if (!classCounts[e.class_id]) classCounts[e.class_id] = { title: e.classes?.title || "Unknown", count: 0 };
          classCounts[e.class_id].count++;
        }
      });
      const topClasses = Object.values(classCounts).sort((a, b) => b.count - a.count).slice(0, 5);

      setData({
        totalRevenue,
        monthlyRevenue,
        totalStudents: studentsRes.count || 0,
        totalEnrollments: enrollmentsRes.count || 0,
        topClasses,
      });
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold text-foreground">LKR {data.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">LKR {data.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">This Month</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{data.totalStudents}</p>
          <p className="text-xs text-muted-foreground">Total Students</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <p className="text-2xl font-bold text-foreground">{data.totalEnrollments}</p>
          <p className="text-xs text-muted-foreground">Total Enrollments</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Top Classes by Enrollments</CardTitle></CardHeader>
        <CardContent>
          {data.topClasses.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No enrollment data yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topClasses.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}.</span>
                    <span className="text-sm font-medium text-foreground">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${(c.count / data.topClasses[0].count) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
