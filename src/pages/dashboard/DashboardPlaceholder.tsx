import { Card, CardContent } from "@/components/ui/card";

const DashboardPlaceholder = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <p>Coming soon. This feature is under development.</p>
      </CardContent>
    </Card>
  </div>
);

export default DashboardPlaceholder;
