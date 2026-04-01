import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

const TeacherEarnings = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadPayouts();
  }, [user]);

  const loadPayouts = async () => {
    const { data: t } = await supabase.from("teachers").select("id").eq("user_id", user!.id).single();
    if (!t) return;
    const { data } = await supabase.from("teacher_payouts").select("*").eq("teacher_id", t.id).order("created_at", { ascending: false });
    setPayouts(data || []);
    setTotal((data || []).reduce((s, p) => s + Number(p.amount), 0));
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Earnings</h1>

      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <DollarSign className="w-8 h-8 text-primary" />
          <div>
            <p className="text-2xl font-bold text-foreground">LKR {total.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Payout History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Period</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Notes</th>
              </tr></thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-foreground">{p.period_start} → {p.period_end}</td>
                    <td className="p-4 font-medium text-foreground">{p.currency} {Number(p.amount).toLocaleString()}</td>
                    <td className="p-4"><Badge variant={p.status === "paid" ? "default" : "secondary"}>{p.status}</Badge></td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">{p.notes || "—"}</td>
                  </tr>
                ))}
                {payouts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No payouts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherEarnings;
