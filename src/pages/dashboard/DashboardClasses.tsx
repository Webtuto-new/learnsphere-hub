import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardClasses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("enrollments").select("*, classes(*)").eq("user_id", user.id).not("class_id", "is", null)
      .then(({ data }) => setEnrollments(data || []));
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">My Classes</h1>
        <Link to="/classes"><Button variant="outline" size="sm">Browse More</Button></Link>
      </div>
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No classes enrolled yet.</p>
            <Link to="/classes"><Button size="sm" className="mt-3">Browse Classes</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((e) => (
            <Card key={e.id} className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-1">{e.classes?.title || "Class"}</h3>
                <p className="text-xs text-muted-foreground mb-2">{e.classes?.short_description || ""}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    e.status === "active" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                  }`}>{e.status}</span>
                  <Link to={`/class/${e.class_id}`}>
                    <Button variant="ghost" size="sm"><ExternalLink className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardClasses;
