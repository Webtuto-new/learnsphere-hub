import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WishlistButton = ({ classId }: { classId: string }) => {
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !classId) return;
    supabase.from("wishlists").select("id").eq("user_id", user.id).eq("class_id", classId)
      .then(({ data }) => setInWishlist(!!data?.length));
  }, [user, classId]);

  const toggle = async () => {
    if (!user) { toast({ title: "Please login first", variant: "destructive" }); return; }
    setLoading(true);
    if (inWishlist) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("class_id", classId);
      setInWishlist(false);
      toast({ title: "Removed from wishlist" });
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, class_id: classId });
      setInWishlist(true);
      toast({ title: "Added to wishlist!" });
    }
    setLoading(false);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading} className="gap-1">
      <Heart className={`w-4 h-4 ${inWishlist ? "fill-destructive text-destructive" : ""}`} />
      {inWishlist ? "Saved" : "Wishlist"}
    </Button>
  );
};

export default WishlistButton;
