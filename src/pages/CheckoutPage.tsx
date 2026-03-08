import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Tag, ShoppingCart, CheckCircle, Building2, Copy } from "lucide-react";

const CheckoutPage = () => {
  const { items, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bankDetails, setBankDetails] = useState<any[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from("bank_details").select("*").eq("is_active", true).then(({ data }) => setBankDetails(data || []));
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({ title: "Please upload an image or PDF", variant: "destructive" });
      return;
    }
    setReceiptFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setReceiptPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const applyCoupon = async () => {
    if (!couponCode) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode.toUpperCase()).eq("is_active", true).single();
    if (!data) { toast({ title: "Invalid coupon", variant: "destructive" }); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { toast({ title: "Coupon expired", variant: "destructive" }); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast({ title: "Coupon expired", variant: "destructive" }); return; }
    const d = data.discount_percent ? total * data.discount_percent / 100 : data.discount_amount || 0;
    setDiscount(Math.min(d, total));
    toast({ title: `Discount applied: LKR ${Math.min(d, total).toFixed(0)}` });
  };

  const handleSubmit = async () => {
    if (!user) { navigate("/login"); return; }
    if (items.length === 0) { toast({ title: "Cart is empty", variant: "destructive" }); return; }
    if (!receiptFile) { toast({ title: "Please upload your payment receipt", variant: "destructive" }); return; }

    setLoading(true);
    try {
      // Upload receipt
      const ext = receiptFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("receipts").upload(path, receiptFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(path);

      const finalAmount = Math.max(total - discount, 0);

      // Create payment with pending status (no enrollment yet)
      const { error: payError } = await supabase.from("payments").insert({
        user_id: user.id,
        amount: finalAmount,
        currency: "LKR",
        payment_method: "bank_transfer",
        payment_status: "pending",
        transaction_ref: `WT-${Date.now()}`,
        receipt_url: urlData.publicUrl,
        items: items.map(i => ({ id: i.id, type: i.type, title: i.title, price: i.price })),
      });

      if (payError) throw payError;

      // Update coupon usage
      if (couponCode && discount > 0) {
        try { await supabase.rpc("increment_coupon_usage" as any, { coupon_code: couponCode.toUpperCase() }); } catch {}
      }

      clearCart();
      setSubmitted(true);
      toast({ title: "Payment submitted!", description: "We'll review your receipt and activate your enrollment soon." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-lg text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Payment Submitted!</h1>
          <p className="text-muted-foreground mb-6">Your receipt has been uploaded. Our team will review it and activate your enrollment within 24 hours.</p>
          <Button onClick={() => navigate("/dashboard/payments")}>View My Payments</Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-lg text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Browse our classes and recordings to get started.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/classes")}>Browse Classes</Button>
            <Button variant="outline" onClick={() => navigate("/recordings")}>Browse Recordings</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Cart Items ({items.length})</h2>
                <div className="divide-y divide-border">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        {item.thumbnail_url && <img src={item.thumbnail_url} alt="" className="w-16 h-12 rounded-lg object-cover" />}
                        <div>
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">LKR {item.price.toLocaleString()}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            {bankDetails.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" /> Bank Transfer Details
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">Please transfer the total amount to one of the following accounts:</p>
                  <div className="space-y-4">
                    {bankDetails.map(bd => (
                      <div key={bd.id} className="p-4 bg-muted/50 rounded-xl space-y-2">
                        <p className="font-semibold text-foreground">{bd.bank_name}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Account Name</span>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground font-medium">{bd.account_name}</span>
                            <button onClick={() => copyToClipboard(bd.account_name)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                          </div>
                          <span className="text-muted-foreground">Account Number</span>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground font-medium">{bd.account_number}</span>
                            <button onClick={() => copyToClipboard(bd.account_number)} className="text-muted-foreground hover:text-foreground"><Copy className="w-3 h-3" /></button>
                          </div>
                          {bd.branch && <>
                            <span className="text-muted-foreground">Branch</span>
                            <span className="text-foreground font-medium">{bd.branch}</span>
                          </>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Receipt Upload */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" /> Upload Payment Receipt
                </h2>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => document.getElementById("receipt-input")?.click()}
                >
                  {receiptFile ? (
                    <div className="space-y-3">
                      {receiptPreview && <img src={receiptPreview} alt="Receipt" className="max-h-48 mx-auto rounded-lg" />}
                      <p className="text-sm font-medium text-foreground">{receiptFile.name}</p>
                      <p className="text-xs text-muted-foreground">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                      <p className="font-medium text-foreground">Drag & drop your receipt here</p>
                      <p className="text-sm text-muted-foreground">or click to browse (Image or PDF)</p>
                    </div>
                  )}
                  <input id="receipt-input" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Order Summary</h2>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[60%]">{item.title}</span>
                      <span className="text-foreground">LKR {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">LKR {total.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600 font-medium">-LKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">LKR {Math.max(total - discount, 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                  <Button variant="outline" size="sm" onClick={applyCoupon}><Tag className="w-4 h-4" /></Button>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading || !receiptFile}>
                  {loading ? "Submitting..." : "Submit Payment"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">Your enrollment will be activated after receipt verification.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
