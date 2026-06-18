"use client";

import { useRef, useState, useCallback } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FactoryContextHeader } from "./factory-context-header";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface CertificateUploadPageProps {
  brandName: string;
  factoryName: string;
  contextSentence: string;
}

type PageState = "idle" | "uploading" | "success" | "error";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ACCEPTED_LABEL = "PDF, JPG, or PNG";
const MAX_FILES = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CertificateUploadPage({
  brandName,
  factoryName,
  contextSentence,
}: CertificateUploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [pageState, setPageState] = useState<PageState>("idle");

  const atCap = files.length >= MAX_FILES;

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const remaining = MAX_FILES - files.length;
    const valid = Array.from(fileList)
      .slice(0, remaining)
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .map((f) => ({ name: f.name, size: f.size, type: f.type }));
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  );

  async function handleSubmit() {
    if (!files.length) return;
    setPageState("uploading");
    // Simulate async upload
    await new Promise((r) => setTimeout(r, 1800));
    setPageState("success");
  }

  if (pageState === "success") {
    return (
      <>
        <FactoryContextHeader
          brandName={brandName}
          factoryName={factoryName}
          contextSentence={contextSentence}
        />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Certificates uploaded
          </h1>
          <p className="text-sm text-muted-foreground">
            {brandName} has been notified. You can close this page.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <FactoryContextHeader
        brandName={brandName}
        factoryName={factoryName}
        contextSentence={contextSentence}
      />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Upload certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your compliance certificates below. {ACCEPTED_LABEL} files accepted.
          </p>
        </div>

        {/* Drop zone */}
        <button
          type="button"
          disabled={atCap || pageState === "uploading"}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
            atCap || pageState === "uploading"
              ? "cursor-not-allowed opacity-50"
              : dragOver
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/30 text-muted-foreground"
          )}
        >
          <UploadCloud className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">
              {atCap ? "Maximum files reached" : "Drag and drop files here"}
            </p>
            {!atCap && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                or click to browse &mdash; {ACCEPTED_LABEL}, up to {MAX_FILES} files
              </p>
            )}
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
        />

        {/* File list */}
        {files.length > 0 && (
          <ul className="mt-4 space-y-2" role="list" aria-label="Files to upload">
            {files.map((file, i) => (
              <li key={file.name + i}>
                <Card className="shadow-none">
                  <CardContent className="flex items-center gap-3 p-3">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      disabled={pageState === "uploading"}
                      className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        {pageState === "error" && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Upload failed. Please try again or contact {brandName}.
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || pageState === "uploading"}
            className="w-full sm:w-auto"
          >
            {pageState === "uploading" ? "Uploading…" : `Submit ${files.length > 0 ? `${files.length} ` : ""}certificate${files.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </main>
    </>
  );
}
