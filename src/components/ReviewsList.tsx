import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

const ReviewsList = ({ classId }: { classId: string }) => {
  const [reviews, setReviews] = useState<any[]>([]);

  const fetchReviews = () => {
    supabase.from("reviews").select("*, profiles(full_name)").eq("class_id", classId).order("created_at", { ascending: false })
      .then(({ data }) => setReviews(data || []));
  };

  useEffect(() => { fetchReviews(); }, [classId]);

  if (reviews.length === 0) return <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>;

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{avg.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
      </div>
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-xs font-medium text-foreground">{(r as any).profiles?.full_name || "Student"}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
