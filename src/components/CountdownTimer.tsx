import { useState, useEffect } from "react";
import { Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  targetDate: Date;
  sessionTitle: string;
  zoomLink?: string | null;
}

const CountdownTimer = ({ targetDate, sessionTitle, zoomLink }: Props) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        setIsLive(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (isLive) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <div>
            <p className="font-medium text-foreground">LIVE NOW — {sessionTitle}</p>
            <p className="text-sm text-muted-foreground">Class is in progress</p>
          </div>
        </div>
        {zoomLink && (
          <a href={zoomLink} target="_blank" rel="noopener noreferrer">
            <Button className="gap-1"><ExternalLink className="w-4 h-4" /> Join Now</Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Next class: {sessionTitle}</p>
      </div>
      <div className="flex gap-3">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map(t => (
          <div key={t.label} className="bg-card rounded-lg p-3 text-center min-w-[60px] card-elevated">
            <p className="font-display font-bold text-xl text-foreground">{pad(t.value)}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{t.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {targetDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {targetDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
};

export default CountdownTimer;
