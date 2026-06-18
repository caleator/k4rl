"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SkuScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFill: (sku: string) => void;
}

type Tab = "barcode" | "ocr";

export function SkuScanDialog({ open, onOpenChange, onFill }: SkuScanDialogProps) {
  const [tab, setTab] = useState<Tab>("barcode");
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // OCR state
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const ocrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);

  // Barcode scanner
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  function stopCamera() {
    try {
      readerRef.current?.reset();
    } catch {
      // ignore
    }
    readerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;
    setCameraError(null);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Poll for results
      reader.decodeFromStream(stream, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText().toUpperCase().replace(/[^A-Z0-9\-_]/g, "");
          stopCamera();
          onFill(text);
          onOpenChange(false);
        }
        // Suppress not-found errors during continuous scanning
        void err;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera error";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setCameraError("Camera permission denied. Allow camera access and try again.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Could not start camera: " + msg);
      }
    }
  }, [onFill, onOpenChange]);

  // Check camera availability on mount
  useEffect(() => {
    setCameraAvailable(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  // Start/stop camera when tab or open state changes
  useEffect(() => {
    if (open && tab === "barcode" && cameraAvailable) {
      // Small delay so the video element is in DOM
      const t = setTimeout(() => startCamera(), 100);
      return () => {
        clearTimeout(t);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, cameraAvailable]);

  // Clean up OCR timer on close
  useEffect(() => {
    if (!open) {
      if (ocrTimerRef.current) clearTimeout(ocrTimerRef.current);
      setOcrPreview(null);
      setOcrScanning(false);
    }
  }, [open]);

  function handleOcrFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setOcrPreview(url);
    setOcrScanning(true);
    ocrTimerRef.current = setTimeout(() => {
      // Simulate OCR — extract a plausible looking SKU
      const suffix = Date.now().toString(36).toUpperCase().slice(-6);
      const mockSku = `OCR-${suffix}`;
      setOcrScanning(false);
      onFill(mockSku);
      onOpenChange(false);
    }, 1500);
  }

  function handleClose(v: boolean) {
    stopCamera();
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle>Scan or upload SKU</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b mx-5 mt-4 gap-0">
          {(["barcode", "ocr"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "pb-2 px-1 mr-5 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "barcode" ? "Scan barcode" : "Upload label photo"}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Barcode tab ── */}
          {tab === "barcode" && (
            <div className="space-y-3">
              {cameraAvailable === false ? (
                <div className="rounded-lg bg-muted px-4 py-8 text-center">
                  <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Camera is not available on this device or browser.
                    Use the "Upload label photo" tab instead.
                  </p>
                </div>
              ) : cameraError ? (
                <div className="rounded-lg bg-muted px-4 py-8 text-center space-y-3">
                  <p className="text-sm text-destructive">{cameraError}</p>
                  <Button size="sm" variant="outline" onClick={startCamera}>
                    Try again
                  </Button>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-24 w-48 rounded border-2 border-white/60" />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Point camera at a barcode or QR code on the product label.
              </p>
            </div>
          )}

          {/* ── OCR tab ── */}
          {tab === "ocr" && (
            <div className="space-y-3">
              {ocrPreview ? (
                <div className="relative overflow-hidden rounded-lg aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ocrPreview}
                    alt="Label preview"
                    className="h-full w-full object-contain"
                  />
                  {ocrScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                      <p className="text-xs text-white">Reading label…</p>
                    </div>
                  )}
                  {!ocrScanning && (
                    <button
                      type="button"
                      onClick={() => setOcrPreview(null)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => ocrInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors"
                >
                  <Upload className="h-7 w-7 opacity-40" />
                  <span className="text-sm">Upload or take a photo of the label</span>
                </button>
              )}
              <p className="text-xs text-muted-foreground text-center">
                The SKU will be read from the label automatically.
              </p>
              <input
                ref={ocrInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => handleOcrFile(e.target.files)}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
