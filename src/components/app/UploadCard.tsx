import { useRef, useState, DragEvent } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  hint: string;
  file: File | null;
  onFile: (f: File | null) => void;
  accent?: "blue" | "cyan";
}

export function UploadCard({ label, hint, file, onFile, accent = "blue" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-300 bg-gradient-card",
        drag ? "border-primary-glow shadow-glow scale-[1.01]" : "border-border hover:border-primary-glow/60 hover:shadow-soft",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center gap-4">
          <div className={cn("h-12 w-12 rounded-xl grid place-items-center", accent === "blue" ? "bg-accent" : "bg-secondary")}>
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · ready</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-3">
          <div className={cn("h-14 w-14 rounded-2xl grid place-items-center transition-transform group-hover:scale-110",
            accent === "blue" ? "bg-gradient-accent" : "bg-primary"
          )}>
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-display font-semibold">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{hint}</p>
          </div>
          <p className="text-xs text-muted-foreground">PDF · DOC · DOCX · TXT · Image</p>
        </div>
      )}
    </div>
  );
}
