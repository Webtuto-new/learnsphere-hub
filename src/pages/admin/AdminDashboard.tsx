import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CreditCard, GraduationCap, FileText } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, classes: 0, teachers: 0, payments: 0, applications: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("classes").select("id", { count: "exact", head: true }),
      supabase.from("teachers").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }),
      supabase.from("tutor_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([s, c, t, p, a]) => {
      setStats({
        students: s.count || 0,
        classes: c.count || 0,
        teachers: t.count || 0,
        payments: p.count || 0,
        applications: a.count || 0,
      });
    });
  }, []);

  const cards = [
    { label: "Total Students", value: stats.students, icon: Users, color: "text-secondary" },
    { label: "Total Classes", value: stats.classes, icon: BookOpen, color: "text-primary" },
    { label: "Teachers", value: stats.teachers, icon: GraduationCap, color: "text-accent" },
    { label: "Payments", value: stats.payments, icon: CreditCard, color: "text-secondary" },
    { label: "Pending Applications", value: stats.applications, icon: FileText, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Admin Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 text-center">
              <c.icon className={`w-8 h-8 mx-auto mb-2 ${c.color}`} />
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
