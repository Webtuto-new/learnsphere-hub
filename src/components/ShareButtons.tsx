import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
        <Button variant="outline" size="sm" className="w-full gap-1 text-secondary hover:text-secondary">
          <Share2 className="w-4 h-4" /> WhatsApp
        </Button>
      </a>
    </div>
  );
};

export default ShareButtons;
