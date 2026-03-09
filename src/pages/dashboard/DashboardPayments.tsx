import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import jsPDF from "jspdf";

const DashboardPayments = () => {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("payments").select("*, enrollments(class_id, recording_id, classes(title), recordings(title))").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*, classes(title, class_type), recordings(title)").eq("user_id", user.id).order("enrolled_at", { ascending: false }),
    ]).then(([payRes, enrRes]) => {
      setPayments(payRes.data || []);
      setEnrollments(enrRes.data || []);
    });
  }, [user]);

  const getExpiryInfo = (e: any) => {
    if (!e.expires_at) return { label: "No expiry", color: "text-muted-foreground", icon: CheckCircle2 };
    const expDate = new Date(e.expires_at);
    if (isPast(expDate)) return { label: "Expired", color: "text-destructive", icon: XCircle };
    const days = differenceInDays(expDate, new Date());
    if (days <= 7) return { label: `Expires in ${formatDistanceToNow(expDate)}`, color: "text-amber-500", icon: AlertTriangle };
    return { label: `Expires in ${formatDistanceToNow(expDate)}`, color: "text-muted-foreground", icon: Clock };
  };

  const generateInvoice = (p: any) => {
    const itemName = p.enrollments?.classes?.title || p.enrollments?.recordings?.title || "Service";
    const lines = [
      "════════════════════════════════════════",
      "              INVOICE",
      "         WebTuto Academy",
      "════════════════════════════════════════",
      "",
      `Invoice Date:    ${format(new Date(p.created_at), "PPP")}`,
      `Invoice #:       INV-${p.id.slice(0, 8).toUpperCase()}`,
      "",
      "────────────────────────────────────────",
      "  BILL TO",
      "────────────────────────────────────────",
      `  Name:          ${profile?.full_name || "Student"}`,
      `  Email:         ${profile?.email || "—"}`,
      `  Admission #:   ${profile?.admission_number || "—"}`,
      "",
      "────────────────────────────────────────",
      "  ITEM DETAILS",
      "────────────────────────────────────────",
      `  Item:          ${itemName}`,
      `  Amount:        ${p.currency} ${p.amount}`,
      `  Method:        ${p.payment_method || "—"}`,
      `  Status:        ${p.payment_status}`,
      `  Reference:     ${p.transaction_ref || "—"}`,
      "",
      "────────────────────────────────────────",
      `  TOTAL:         ${p.currency} ${p.amount}`,
      "────────────────────────────────────────",
      "",
      "  Thank you for your payment!",
      "  WebTuto Academy - webtutoacademy.lovable.app",
      "════════════════════════════════════════",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${p.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Payments & Subscriptions</h1>

      {/* Active Enrollments with Expiry */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">My Enrollments</h2>
        {enrollments.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No enrollments yet.</CardContent></Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {enrollments.map(e => {
              const expiry = getExpiryInfo(e);
              const Icon = expiry.icon;
              const itemName = e.classes?.title || e.recordings?.title || "Unknown";
              const isActive = e.status === "active" && (!e.expires_at || !isPast(new Date(e.expires_at)));
              return (
                <Card key={e.id} className={!isActive ? "opacity-60" : ""}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{itemName}</p>
                        <p className="text-xs text-muted-foreground">{e.class_id ? e.classes?.class_type || "Class" : "Recording"}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        isActive ? "bg-secondary/20 text-secondary" : "bg-destructive/20 text-destructive"
                      }`}>{isActive ? "Active" : "Expired"}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${expiry.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{expiry.label}</span>
                      {e.expires_at && !isPast(new Date(e.expires_at)) && (
                        <span className="text-muted-foreground ml-auto">{format(new Date(e.expires_at), "PP")}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Enrolled: {format(new Date(e.enrolled_at), "PP")}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payment history yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Item</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Reference</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const itemName = p.enrollments?.classes?.title || p.enrollments?.recordings?.title || "—";
                      return (
                        <tr key={p.id} className="border-b border-border last:border-0">
                          <td className="p-4 text-foreground">{format(new Date(p.created_at), "PP")}</td>
                          <td className="p-4 text-foreground text-xs max-w-[150px] truncate">{itemName}</td>
                          <td className="p-4 font-medium text-foreground">{p.currency} {p.amount}</td>
                          <td className="p-4 text-muted-foreground">{p.payment_method || "—"}</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              p.payment_status === "completed" ? "bg-secondary/20 text-secondary" :
                              p.payment_status === "failed" ? "bg-destructive/20 text-destructive" :
                              "bg-muted text-muted-foreground"
                            }`}>{p.payment_status}</span>
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">{p.transaction_ref || "—"}</td>
                          <td className="p-4">
                            {p.payment_status === "completed" && (
                              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => generateInvoice(p)}>
                                <Download className="w-3 h-3" /> Invoice
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPayments;
