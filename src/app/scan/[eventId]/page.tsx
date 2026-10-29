"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import {
  ArrowLeft,
  Download,
  Volume2,
  VolumeX,
  ShieldAlert,
  Camera,
  CameraOff,
  RefreshCw,
  SwitchCamera,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScanResultOverlay, ScanResultOverlayProps } from "@/components/scanner/scan-result-overlay";
import {
  saveOfflinePack,
  getOfflinePack,
  saveOfflineQueue,
  getOfflineQueue,
  clearOfflineQueue,
} from "@/lib/offline/wallet-storage";

type CameraStatus = "idle" | "requesting" | "streaming" | "denied" | "error";

export default function GateScannerPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [manualCode, setManualCode] = useState("");
  const [lastScanResult, setLastScanResult] = useState<ScanResultOverlayProps | null>(null);
  const [stats, setStats] = useState({ admitted: 0, total: 0 });
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlinePack, setOfflinePack] = useState<any | null>(null);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isPackDownloaded, setIsPackDownloaded] = useState(false);
  const [packDownloadTime, setPackDownloadTime] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Camera States
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string>("");
  const lastScannedTimeRef = useRef<number>(0);

  // Stats polling
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/scan/events/${eventId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  }, [eventId]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Load offline pack and pending queue from IndexedDB on mount (AC-F9-11)
  useEffect(() => {
    async function loadSavedOfflineData() {
      try {
        const savedPack = await getOfflinePack(eventId);
        if (savedPack) {
          setOfflinePack(savedPack);
          setIsPackDownloaded(true);
          setPackDownloadTime(savedPack.downloadedAt);
        }
        const savedQueue = await getOfflineQueue();
        if (savedQueue && savedQueue.length > 0) {
          setPendingQueue(savedQueue);
        }
      } catch (e) {}
    }
    loadSavedOfflineData();
  }, [eventId]);

  // Load fallback jsQR script if native BarcodeDetector is absent
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).jsQR) {
      const script = document.createElement("script");
      script.src = "/jsqr.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Audio tone via Web Audio API (AC-F8-12)
  function playAudioFeedback(success: boolean) {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = success ? 880 : 320; // High beep for admit, low buzz for error
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  function triggerHaptic(success: boolean) {
    if (isMuted) return;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(success ? [100, 50, 100] : 300);
    }
  }

  // Handle Scan validation
  const handleValidate = useCallback(
    async (codeToValidate: string) => {
      const code = codeToValidate.trim();
      if (!code) return;

      // 3-second duplicate scan guard (AC-F8-7)
      const now = Date.now();
      if (code === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 3000) {
        return;
      }
      lastScannedCodeRef.current = code;
      lastScannedTimeRef.current = now;

      // Check offline mode
      if (isOfflineMode && offlinePack) {
        const ticket = offlinePack.tickets?.find((t: any) => t.code === code);
        if (!ticket) {
          showResult({ result: "INVALID" });
          return;
        }
        if (ticket.status === "USED") {
          showResult({ result: "ALREADY_USED", usedAt: ticket.usedAt });
          return;
        }
        // Offline admit
        ticket.status = "USED";
        ticket.usedAt = new Date().toISOString();
        const newQueueItem = {
          code,
          clientScanId: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          scannedAt: ticket.usedAt,
        };
        setPendingQueue((prev) => {
          const next = [...prev, newQueueItem];
          saveOfflineQueue(next).catch(() => {});
          return next;
        });
        saveOfflinePack(eventId, offlinePack).catch(() => {});
        showResult({
          result: "ADMITTED",
          attendeeName: ticket.attendeeName,
          tierName: ticket.tierName,
        });
        return;
      }

      try {
        const res = await fetch("/api/scan/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            eventId,
            deviceId: "device_gate_scanner_primary",
          }),
        });

        const data = await res.json();
        showResult({
          result: data.result || "INVALID",
          attendeeName: data.ticket?.attendeeName,
          tierName: data.ticket?.tierName,
          usedAt: data.ticket?.usedAt,
          wrongEventTitle: data.wrongEventTitle,
        });

        setScanHistory((prev) => [
          { code, result: data.result, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9),
        ]);

        fetchStats();
      } catch (e) {
        // Network failure -> auto switch to offline mode
        setIsOfflineMode(true);
      }
    },
    [eventId, isOfflineMode, offlinePack, fetchStats]
  );

  function showResult(resultData: ScanResultOverlayProps) {
    const isSuccess = resultData.result === "ADMITTED";
    playAudioFeedback(isSuccess);
    triggerHaptic(isSuccess);
    setLastScanResult(resultData);

    // Auto-dismiss after 1.5 seconds (PRD F8)
    setTimeout(() => {
      setLastScanResult(null);
    }, 1500);
  }

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("denied");
      setCameraErrorMessage("Camera is not supported on this browser or connection.");
      return;
    }

    setCameraStatus("requesting");
    setCameraErrorMessage(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
      } catch (err: any) {
        // Fallback for laptops/desktops without environment camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraStatus("streaming");
    } catch (err: any) {
      console.warn("Camera init failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraStatus("denied");
        setCameraErrorMessage("Camera permission was denied. Please allow camera permissions in browser settings or use manual entry below.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraStatus("error");
        setCameraErrorMessage("No camera device was detected. Please connect a camera or use manual entry below.");
      } else {
        setCameraStatus("error");
        setCameraErrorMessage(err.message || "Failed to access camera. Please use manual entry below.");
      }
    }
  }, [facingMode]);

  // Stop camera on unmount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // Continuous Camera Frame QR Scanning Loop
  useEffect(() => {
    if (cameraStatus !== "streaming") return;

    isScanningRef.current = true;
    let animationFrameId: number;

    const scan = async () => {
      if (!isScanningRef.current) return;

      const video = videoRef.current;
      if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        try {
          // Priority 1: Built-in native BarcodeDetector API
          if (typeof window !== "undefined" && "BarcodeDetector" in window) {
            const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
              handleValidate(barcodes[0].rawValue);
            }
          } else if (typeof window !== "undefined" && (window as any).jsQR) {
            // Priority 2: Fallback jsQR canvas reader
            if (!canvasRef.current) {
              canvasRef.current = document.createElement("canvas");
            }
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height);
              if (code && code.data) {
                handleValidate(code.data);
              }
            }
          }
        } catch (e) {
          // Swallow intermittent decoding frame errors
        }
      }

      // Schedule next frame scan (~150ms interval keeps CPU light and scanner responsive)
      setTimeout(() => {
        if (isScanningRef.current) {
          animationFrameId = requestAnimationFrame(scan);
        }
      }, 150);
    };

    animationFrameId = requestAnimationFrame(scan);

    return () => {
      isScanningRef.current = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [cameraStatus, handleValidate]);

  async function handleDownloadPack() {
    setIsDownloading(true);
    try {
      const res = await fetch(`/api/scan/events/${eventId}/pack`);
      if (res.ok) {
        const data = await res.json();
        setOfflinePack(data);
        setIsPackDownloaded(true);
        setPackDownloadTime(data.downloadedAt);
        await saveOfflinePack(eventId, data);
      }
    } catch (e) {} finally {
      setIsDownloading(false);
    }
  }

  async function handleSyncQueue() {
    if (pendingQueue.length === 0) return;
    try {
      const res = await fetch("/api/scan/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "device_gate_scanner_primary",
          eventId,
          scans: pendingQueue,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const serverConflicts = (data.results || []).filter((r: any) => r.conflict);
        if (serverConflicts.length > 0) {
          setConflicts((prev) => [...prev, ...serverConflicts]);
        }
        setPendingQueue([]);
        await clearOfflineQueue();
        fetchStats();
      }
    } catch (e) {}
  }

  const isPackStale =
    packDownloadTime && Date.now() - new Date(packDownloadTime).getTime() > 2 * 3600 * 1000;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <Script src="/jsqr.js" strategy="afterInteractive" />

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/scan")}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Scanner</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className="p-2 min-h-[44px] min-w-[44px]"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[var(--accent)]" />}
          </Button>

          <Button
            variant={isOfflineMode ? "danger" : "secondary"}
            size="sm"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className="text-xs"
          >
            {isOfflineMode ? "Mode: Offline" : "Mode: Online"}
          </Button>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {isPackStale && (
        <div className="p-3 bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Warning: Offline pack is older than 2 hours. Tap download to refresh ticket records.</span>
        </div>
      )}

      {/* Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-center">
          <span className="text-xs text-[var(--text-faint)] uppercase tracking-wider block">Admitted</span>
          <span className="text-2xl font-bold font-mono text-[var(--success)]">{stats.admitted}</span>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-center">
          <span className="text-xs text-[var(--text-faint)] uppercase tracking-wider block">Total Expected</span>
          <span className="text-2xl font-bold font-mono text-[var(--text)]">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] text-center col-span-2 sm:col-span-1">
          <span className="text-xs text-[var(--text-faint)] uppercase tracking-wider block">Pending Sync</span>
          <span className="text-2xl font-bold font-mono text-[var(--warning)]">{pendingQueue.length}</span>
        </div>
      </div>

      {/* Interactive Camera Viewfinder Frame */}
      <div className="relative rounded-2xl border-2 border-[var(--border-strong)] bg-neutral-950 overflow-hidden min-h-[280px] sm:min-h-[320px] flex flex-col items-center justify-center">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraStatus === "streaming" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Viewfinder Target Reticle Overlay (Shown when streaming) */}
        {cameraStatus === "streaming" && (
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none w-full h-full p-4">
            <div className="w-48 h-48 sm:w-56 sm:h-56 relative border-2 border-[var(--accent)]/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              {/* Corner accents */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[var(--accent)] rounded-tl" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[var(--accent)] rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[var(--accent)] rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[var(--accent)] rounded-br" />

              {/* Scanning laser animation bar */}
              <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent animate-pulse" />
            </div>

            <span className="mt-4 text-xs font-medium text-white/90 drop-shadow-md bg-black/60 px-3 py-1 rounded-full">
              Point camera at ticket QR code
            </span>
          </div>
        )}

        {/* Camera Switch Floating Control */}
        {cameraStatus === "streaming" && (
          <div className="absolute bottom-3 right-3 z-20">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
              }}
              className="gap-1.5 bg-black/60 hover:bg-black/80 text-white border-white/20 backdrop-blur-sm text-xs"
              title="Flip camera"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>Flip</span>
            </Button>
          </div>
        )}

        {/* Requesting Camera Access State */}
        {cameraStatus === "requesting" && (
          <div className="relative z-10 flex flex-col items-center p-6 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
            <span className="text-xs text-neutral-300 font-medium">Requesting camera access...</span>
            <span className="text-[11px] text-neutral-500 max-w-xs">
              Please allow camera permissions in your browser prompt.
            </span>
          </div>
        )}

        {/* Camera Permission Denied / Error State */}
        {(cameraStatus === "denied" || cameraStatus === "error") && (
          <div className="relative z-10 flex flex-col items-center p-6 text-center space-y-3">
            <CameraOff className="w-10 h-10 text-[var(--warning)]" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-200 block">
                {cameraStatus === "denied" ? "Camera Access Denied" : "Camera Unavailable"}
              </span>
              <p className="text-[11px] text-neutral-400 max-w-xs leading-relaxed">
                {cameraErrorMessage ||
                  "Unable to access the camera. Please allow camera permissions in browser settings or use manual entry below."}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={startCamera} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Camera</span>
            </Button>
          </div>
        )}

        {/* Idle State Fallback */}
        {cameraStatus === "idle" && (
          <div className="relative z-10 flex flex-col items-center p-6 text-center space-y-2">
            <Camera className="w-10 h-10 text-neutral-500" />
            <span className="text-xs text-neutral-400">Camera Viewfinder</span>
            <Button variant="secondary" size="sm" onClick={startCamera} className="text-xs mt-2">
              Start Camera
            </Button>
          </div>
        )}
      </div>

      {/* Demo Tip Panel (PRD F8) */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]/40 text-xs text-[var(--text-muted)] space-y-1.5">
        <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          Demo Tip
        </span>
        <p>
          Book tickets from <span className="text-[var(--text)] font-medium">Discover</span>, open the{" "}
          <span className="text-[var(--text)] font-medium">Digital Wallet</span> on another screen or phone, and point the camera at the QR code. You can also paste ticket codes into the manual entry box below.
        </p>
      </div>

      {/* Manual Code Entry Form (AC-F8-8 & AC-F8-9) */}
      <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text)]">Manual Code Entry</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Type or paste EP1.tkt_... code"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="font-mono text-xs"
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              handleValidate(manualCode);
              setManualCode("");
            }}
          >
            Validate
          </Button>
        </div>
      </div>

      {/* Offline Pack Controls */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-0.5">
          <span className="text-sm font-semibold text-[var(--text)] block">Offline Scan Pack</span>
          <span className="text-xs text-[var(--text-muted)]">
            {isPackDownloaded
              ? `Pack downloaded (${offlinePack?.tickets?.length || 0} tickets cached)`
              : "Download tickets to IndexedDB for 100% offline gate operation"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            isLoading={isDownloading}
            onClick={handleDownloadPack}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isPackDownloaded ? "Refresh Pack" : "Download for offline"}</span>
          </Button>

          {pendingQueue.length > 0 && (
            <Button variant="primary" size="sm" onClick={handleSyncQueue} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync now ({pendingQueue.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Sync Conflicts Review Panel (AC-F9-12) */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--danger)] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Admission Conflicts Detected ({conflicts.length})</span>
          </h3>
          <ul className="divide-y divide-[var(--border)] text-xs text-[var(--text)]">
            {conflicts.map((c, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span>
                  Ticket admitted offline was already used on {c.usedByDevice || "another scanner"}.
                </span>
                <button
                  onClick={() => setConflicts((prev) => prev.filter((_, i) => i !== idx))}
                  className="font-semibold text-[var(--accent)] hover:underline ml-2"
                >
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Scan History (Last 10 Scans) */}
      {scanHistory.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Recent Scans
          </h3>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs">
            {scanHistory.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between">
                <span className="font-mono text-[var(--text-muted)] truncate max-w-[200px]">
                  {item.code}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={item.result === "ADMITTED" ? "success" : "danger"}>
                    {item.result}
                  </Badge>
                  <span className="text-[10px] text-[var(--text-faint)]">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-Screen Result Overlay (1.5s display) */}
      {lastScanResult && (
        <ScanResultOverlay
          {...lastScanResult}
          onDismiss={() => setLastScanResult(null)}
        />
      )}
    </div>
  );
}
