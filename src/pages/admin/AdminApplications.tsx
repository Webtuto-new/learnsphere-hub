import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

const AdminApplications = () => {
  const [apps, setApps] = useState<any[]>([]);
  const { toast } = useToast();

  const fetch = () => {
    supabase.from("tutor_applications").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setApps(data || []));
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("tutor_applications").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Application ${status}` }); fetch(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Tutor Applications</h1>
      {apps.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No applications yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.email} · {a.phone}</p>
                    <p className="text-sm text-muted-foreground">Experience: {a.teaching_experience || "—"}</p>
                    <p className="text-sm text-muted-foreground">Subjects: {a.subjects_can_teach || "—"}</p>
                    <p className="text-sm text-muted-foreground">Online years: {a.online_teaching_years}</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                      a.status === "approved" ? "bg-secondary/20 text-secondary" :
                      a.status === "rejected" ? "bg-destructive/20 text-destructive" :
                      "bg-accent/20 text-accent"
                    }`}>{a.status}</span>
                  </div>
                  {a.status === "pending" && (
                    <div className="flex gap-2 items-start">
                      <Button size="sm" onClick={() => updateStatus(a.id, "approved")} className="gap-1"><Check className="w-3 h-3" /> Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, "rejected")} className="gap-1"><X className="w-3 h-3" /> Reject</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
