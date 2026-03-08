import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("payments").select("*, profiles(full_name, admission_number)").order("created_at", { ascending: false })
      .then(({ data }) => setPayments(data || []));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">All Payments</h1>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
              </tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-foreground">{(p as any).profiles?.full_name || "—"} <span className="text-xs text-muted-foreground">{(p as any).profiles?.admission_number}</span></td>
                    <td className="p-4 font-medium text-foreground">{p.currency} {p.amount}</td>
                    <td className="p-4 text-muted-foreground">{p.payment_method || "—"}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.payment_status === "completed" ? "bg-secondary/20 text-secondary" :
                      p.payment_status === "failed" ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                    }`}>{p.payment_status}</span></td>
                    <td className="p-4 text-muted-foreground text-xs">{p.transaction_ref || "—"}</td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No payments yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
