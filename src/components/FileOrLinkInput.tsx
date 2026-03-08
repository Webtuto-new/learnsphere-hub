import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Link, FileVideo, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface FileOrLinkInputProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  label?: string;
  linkPlaceholder?: string;
  uploadHint?: string;
  previewType?: "image" | "video" | "file";
}

const FileOrLinkInput = ({
  value,
  onChange,
  bucket = "thumbnails",
  folder = "uploads",
  accept = "*/*",
  label = "File",
  linkPlaceholder = "https://example.com/file.mp4",
  uploadHint = "Drag & drop or click to browse",
  previewType = "file",
}: FileOrLinkInputProps) => {
  const [tab, setTab] = useState<string>("link");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      onChange(publicUrl);
      toast({ title: `${label} uploaded!` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  if (value) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          {previewType === "video" ? (
            <FileVideo className="w-5 h-5 text-muted-foreground shrink-0" />
          ) : previewType === "image" ? (
            <img src={value} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
          ) : (
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm text-foreground truncate flex-1">{value.length > 60 ? value.slice(0, 60) + "…" : value}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 rounded-full hover:bg-destructive/10 text-destructive shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="link" className="gap-1.5 text-xs"><Link className="w-3 h-3" /> Paste Link</TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5 text-xs"><Upload className="w-3 h-3" /> Upload File</TabsTrigger>
        </TabsList>
        <TabsContent value="link" className="mt-2">
          <Input
            placeholder={linkPlaceholder}
            onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) onChange((e.target as HTMLInputElement).value.trim()); }}
          />
        </TabsContent>
        <TabsContent value="upload" className="mt-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{uploadHint}</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileOrLinkInput;
