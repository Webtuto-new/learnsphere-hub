import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

const DashboardCertificates = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("certificates").select("*, classes(title)").eq("user_id", user.id).order("issued_at", { ascending: false })
      .then(({ data }) => setCerts(data || []));
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">My Certificates</h1>
      {certs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No certificates yet. Complete a class to earn one!</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map(c => (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="p-6 text-center">
                <Award className="w-10 h-10 mx-auto mb-3 text-accent" />
                <h3 className="font-display font-semibold text-foreground mb-1">{c.title}</h3>
                {(c as any).classes?.title && <p className="text-sm text-muted-foreground mb-2">{(c as any).classes.title}</p>}
                <p className="text-xs font-mono text-muted-foreground">{c.certificate_number}</p>
                <p className="text-xs text-muted-foreground mt-1">Issued: {new Date(c.issued_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCertificates;
