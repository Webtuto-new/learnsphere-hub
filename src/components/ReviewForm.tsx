import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  classId: string;
  onReviewAdded?: () => void;
}

const ReviewForm = ({ classId, onReviewAdded }: Props) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      class_id: classId,
      rating,
      comment,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setComment("");
      setRating(5);
      onReviewAdded?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted rounded-lg">
      <p className="font-medium text-sm text-foreground">Write a Review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s} type="button" onClick={() => setRating(s)}>
            <Star className={`w-5 h-5 ${s <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
          </button>
        ))}
      </div>
      <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
      <Button type="submit" size="sm" disabled={loading}>{loading ? "Submitting..." : "Submit Review"}</Button>
    </form>
  );
};

export default ReviewForm;
