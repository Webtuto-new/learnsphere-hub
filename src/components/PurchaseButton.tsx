import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendEmail, emailTemplates } from "@/lib/email";

interface Props {
  type: "class" | "recording" | "bundle";
  itemId: string;
  price: number;
  title: string;
}

const PurchaseButton = ({ type, itemId, price, title }: Props) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode.toUpperCase()).eq("is_active", true).single();
    if (!data) { toast({ title: "Invalid coupon", variant: "destructive" }); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { toast({ title: "Coupon expired", variant: "destructive" }); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast({ title: "Coupon expired", variant: "destructive" }); return; }
    const d = data.discount_percent ? price * data.discount_percent / 100 : data.discount_amount || 0;
    setDiscount(Math.min(d, price));
    toast({ title: `Discount applied: LKR ${Math.min(d, price)}` });
  };

  const handlePurchase = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);

    // Create enrollment
    const enrollmentData: any = { user_id: user.id, status: "active" };
    if (type === "class") enrollmentData.class_id = itemId;
    else if (type === "recording") enrollmentData.recording_id = itemId;
    else if (type === "bundle") enrollmentData.bundle_id = itemId;

    // Set expiry (30 days for classes, custom for recordings)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    enrollmentData.expires_at = expiry.toISOString();

    const { data: enrollment, error: enrollError } = await supabase.from("enrollments").insert(enrollmentData).select().single();

    if (enrollError) {
      toast({ title: "Error", description: enrollError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Create payment
    const finalPrice = Math.max(price - discount, 0);
    const { error: payError } = await supabase.from("payments").insert({
      user_id: user.id,
      enrollment_id: enrollment.id,
      amount: finalPrice,
      payment_status: "completed",
      payment_method: "manual",
      transaction_ref: `WT-${Date.now()}`,
    });

    if (payError) {
      toast({ title: "Payment error", description: payError.message, variant: "destructive" });
    } else {
      // Update coupon usage
      if (couponCode && discount > 0) {
        try { await supabase.from("coupons").update({ used_count: discount } as any).eq("code", couponCode.toUpperCase()); } catch {}
      }
      toast({ title: "Purchase successful!", description: `You now have access to ${title}` });
      setOpen(false);

      // Send enrollment + payment confirmation emails (best effort)
      const studentName = profile?.full_name || user?.email || "Student";
      const studentEmail = user?.email;
      const transRef = `WT-${Date.now()}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      if (studentEmail) {
        try {
          const enrollEmail = emailTemplates.enrollmentConfirmation(studentName, title, expiryDate.toLocaleDateString());
          await sendEmail({ to: studentEmail, subject: enrollEmail.subject, html: enrollEmail.html });

          const payEmail = emailTemplates.paymentConfirmation(studentName, String(finalPrice), title, transRef, "manual");
          await sendEmail({ to: studentEmail, subject: payEmail.subject, html: payEmail.html });
        } catch (e) {
          console.error("Email send failed:", e);
        }
      }

      navigate("/dashboard/classes");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full gap-2">
          <ShoppingCart className="w-4 h-4" /> Enroll Now — LKR {price}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Complete Purchase</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium text-foreground">{title}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold text-foreground">LKR {price}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-secondary">Discount</span>
                <span className="font-bold text-secondary">-LKR {discount}</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">LKR {Math.max(price - discount, 0)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
            <Button variant="outline" onClick={applyCoupon}><Tag className="w-4 h-4" /></Button>
          </div>
          <Button onClick={handlePurchase} className="w-full" size="lg" disabled={loading}>
            {loading ? "Processing..." : `Pay LKR ${Math.max(price - discount, 0)}`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">This is a demo payment. No real charges.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseButton;
