import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, FileVideo, FileText } from "lucide-react";

interface FileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  label?: string;
  hint?: string;
  showPreview?: boolean;
  previewType?: "image" | "video" | "file";
}

const FileUpload = ({
  value,
  onChange,
  bucket = "thumbnails",
  folder = "uploads",
  accept = "*/*",
  label = "File",
  hint = "Drag & drop or click to browse",
  showPreview = true,
  previewType = "file",
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const renderPreview = () => {
    if (!value || !showPreview) return null;

    if (previewType === "image") {
      return (
        <div className="relative group rounded-lg overflow-hidden border border-border">
          <img src={value} alt={label} className="w-full aspect-video object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
        {previewType === "video" ? (
          <FileVideo className="w-5 h-5 text-muted-foreground shrink-0" />
        ) : (
          <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm text-foreground truncate flex-1">{value.split("/").pop()}</span>
        <button
          onClick={() => onChange(null)}
          className="p-1 rounded-full hover:bg-destructive/10 text-destructive shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value && showPreview ? (
        renderPreview()
      ) : (
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
              <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
          )}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />
    </div>
  );
};

export default FileUpload;
