import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSentimentStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Data — Sentilytics" },
      { name: "description", content: "Upload a CSV of comments or reviews and batch-analyze sentiment." },
    ],
  }),
  component: UploadPage,
});

const SAMPLE_CSV = `text
"I absolutely love this product, it works perfectly!"
"Terrible experience, app crashed three times in a row."
"It's okay, does what it says on the tin."
"Best customer support I've ever had, super helpful."
"Way too expensive for the quality you get."
"The new dashboard is beautiful and easy to use."
"I hate the latest update, it broke everything."
"Pretty average, nothing exciting but nothing bad either."
"Fantastic product, highly recommend to everyone!"
"Slow, buggy, and the UI is confusing."
`;

function UploadPage() {
  const { addBatch } = useSentimentStore();
  const [preview, setPreview] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data;
        if (rows.length === 0) { toast.error("CSV is empty."); return; }
        const cols = Object.keys(rows[0] ?? {});
        const col = cols.find((c) => /^(text|comment|review|content|message|body)$/i.test(c)) ?? cols[0];
        const texts = rows.map((r) => r[col]).filter((t): t is string => Boolean(t && t.trim()));
        setPreview(texts.slice(0, 50));
        toast.success(`Loaded ${texts.length} rows from "${col}" column.`);
      },
      error: (err) => toast.error(err.message),
    });
  };

  const runBatch = () => {
    if (preview.length === 0) { toast.error("No data to analyze."); return; }
    const batch = addBatch(preview);
    toast.success(`Analyzed ${batch.length} entries.`);
    setPreview([]);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sentilytics-sample.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Upload <span className="gradient-text">Dataset</span></h1>
          <p className="text-muted-foreground mt-1">CSV with a text/comment/review column. Preview, then batch-analyze.</p>
        </div>
        <Button variant="outline" onClick={downloadSample}>
          <Download className="h-4 w-4 mr-2" /> Sample CSV
        </Button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
        }}
        className={`glass-card rounded-2xl p-10 text-center border-dashed border-2 transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <div className="mx-auto h-14 w-14 rounded-2xl gradient-bg grid place-items-center mb-4 shadow-[var(--shadow-glow)]">
          <Upload className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="font-semibold">Drag & drop a CSV file</h3>
        <p className="text-sm text-muted-foreground mt-1">or</p>
        <Button className="mt-3" onClick={() => inputRef.current?.click()}>
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {preview.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Preview ({preview.length} rows)</h3>
            <Button onClick={runBatch} className="gradient-bg text-primary-foreground">
              <Sparkles className="h-4 w-4 mr-2" /> Analyze all
            </Button>
          </div>
          <div className="max-h-96 overflow-auto rounded-md border bg-background/50">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b sticky top-0 bg-background/90 backdrop-blur">
                <tr><th className="text-left p-2 w-12">#</th><th className="text-left p-2">Text</th></tr>
              </thead>
              <tbody>
                {preview.map((t, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2 text-muted-foreground">{i + 1}</td>
                    <td className="p-2">{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
