import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, HeartOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DashboardWishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchWishlist = () => {
    if (!user) return;
    supabase.from("wishlists").select("*, classes(*)").eq("user_id", user.id)
      .then(({ data }) => setWishlist(data || []));
  };
  useEffect(() => { fetchWishlist(); }, [user]);

  const removeFromWishlist = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    toast({ title: "Removed from wishlist" });
    fetchWishlist();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Your wishlist is empty.</p>
          <Link to="/classes"><Button size="sm" className="mt-3">Browse Classes</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(w => (
            <Card key={w.id}>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-1">{w.classes?.title || "Class"}</h3>
                <p className="text-xs text-muted-foreground mb-2">{w.classes?.short_description || ""}</p>
                <p className="text-sm font-bold text-foreground mb-3">LKR {w.classes?.price || 0}</p>
                <div className="flex gap-2">
                  <Link to={`/class/${w.class_id}`}><Button size="sm">View</Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => removeFromWishlist(w.id)}><HeartOff className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardWishlist;
