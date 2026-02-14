"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useStockfishAnalysis } from "@/lib/play/useStockfishAnalysis";

type PlayerState = {
  id: string;
  displayName: string;
  rating: number;
};

type QueueState = {
  id: string;
  status: string;
  queuedAt: string;
} | null;

type MatchSnapshot = {
  id: string;
  status: string;
  result: string | null;
  timeControl: string;
  startedAt: string;
  completedAt: string | null;
  white: { id: string; name: string; rating: number };
  black: { id: string; name: string; rating: number };
  fen: string;
  turn: "w" | "b";
  moves: Array<{ ply: number; san: string; createdAt: string }>;
} | null;

type StatePayload = {
  player: PlayerState | null;
  queue: QueueState;
  match: MatchSnapshot;
};

export default function PlayClient() {
  const [state, setState] = useState<StatePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(900);
  const [analysisOn, setAnalysisOn] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const player = state?.player ?? null;
  const match = state?.match ?? null;
  const queue = state?.queue ?? null;

  useEffect(() => {
    let active = true;

    async function init() {
      try {
        await fetch("/api/play/me");
        const response = await fetch("/api/play/state");
        const data = (await response.json()) as StatePayload;
        if (active) {
          setState(data);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError("Unable to connect to the lobby.");
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let fallbackTimer: NodeJS.Timeout | null = null;
    const source = new EventSource("/api/play/stream");

    source.onmessage = (event) => {
      const data = JSON.parse(event.data) as StatePayload;
      setState(data);
    };

    source.onerror = () => {
      source.close();
      if (!fallbackTimer) {
        fallbackTimer = setInterval(async () => {
          const response = await fetch("/api/play/state");
          const data = (await response.json()) as StatePayload;
          setState(data);
        }, 2000);
      }
    };

    return () => {
      source.close();
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
    };
  }, []);

  useEffect(() => {
    const intervalMs = match?.status === "IN_PROGRESS" ? 500 : 2000;
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/play/state");
        const data = (await response.json()) as StatePayload;
        setState(data);
      } catch {
        // Ignore transient polling errors.
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [match?.status]);

  useEffect(() => {
    const element = boardWrapRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      const style = window.getComputedStyle(element);
      const padding =
        Number.parseFloat(style.paddingLeft) +
        Number.parseFloat(style.paddingRight);
      const width = Math.max(0, element.clientWidth - padding);
      const capped = Math.max(700, Math.min(1400, width));
      setBoardWidth(capped);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!match || match.status !== "IN_PROGRESS") {
      return;
    }
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(timer);
  }, [match?.id, match?.status]);

  const game = useMemo(() => {
    const instance = new Chess();
    if (match?.fen) {
      instance.load(match.fen);
    }
    return instance;
  }, [match?.fen]);

  useEffect(() => {
    if (!match || match.moves.length === 0) {
      return;
    }
    const AudioContextClass =
      typeof window !== "undefined"
        ? window.AudioContext || (window as any).webkitAudioContext
        : null;
    if (!AudioContextClass) {
      return;
    }
    try {
      const ctx = new AudioContextClass();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.08;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.05);
      oscillator.onended = () => {
        ctx.close();
      };
    } catch {
      // Ignore audio failures.
    }
  }, [match?.moves.length]);

  const isWhite = match && player ? match.white.id === player.id : false;
  const isBlack = match && player ? match.black.id === player.id : false;
  const isYourTurn =
    match && player
      ? (match.turn === "w" && isWhite) || (match.turn === "b" && isBlack)
      : false;
  const boardOrientation = isBlack ? "black" : "white";
  const lastMoveColor =
    match && match.moves.length
      ? match.moves.length % 2 === 1
        ? "WHITE"
        : "BLACK"
      : null;
  const canTakeBack =
    Boolean(match) &&
    lastMoveColor !== null &&
    ((lastMoveColor === "WHITE" && isWhite) ||
      (lastMoveColor === "BLACK" && isBlack));

  const analysisEnabled = analysisOn && Boolean(match?.fen);
  const analysis = useStockfishAnalysis(match?.fen ?? null, analysisEnabled);

  const clocks = useMemo(() => {
    if (!match) {
      return null;
    }

    const [baseMinutes, incrementSeconds] = match.timeControl
      .split("+")
      .map((value) => Number(value));
    const baseSeconds = Number.isFinite(baseMinutes) ? baseMinutes * 60 : 180;
    const increment = Number.isFinite(incrementSeconds) ? incrementSeconds : 0;

    let whiteTime = baseSeconds;
    let blackTime = baseSeconds;

    const start = new Date(match.startedAt).getTime();
    let lastMoveTime = start;

    match.moves.forEach((move, index) => {
      const mover = index % 2 === 0 ? "WHITE" : "BLACK";
      const moveTime = new Date(move.createdAt).getTime();
      const elapsed = Math.max(0, (moveTime - lastMoveTime) / 1000);
      if (mover === "WHITE") {
        whiteTime -= elapsed;
        whiteTime += increment;
      } else {
        blackTime -= elapsed;
        blackTime += increment;
      }
      lastMoveTime = moveTime;
    });

    if (match.status === "IN_PROGRESS") {
      const active =
        match.turn === "w"
          ? "WHITE"
          : "BLACK";
      const elapsed = Math.max(0, (now - lastMoveTime) / 1000);
      if (active === "WHITE") {
        whiteTime -= elapsed;
      } else {
        blackTime -= elapsed;
      }
    }

    return {
      white: Math.max(0, Math.floor(whiteTime)),
      black: Math.max(0, Math.floor(blackTime)),
    };
  }, [match, now]);

  const formatClock = (seconds: number | undefined) => {
    if (typeof seconds !== "number") {
      return "--:--";
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatEval = () => {
    if (!analysisEnabled) {
      return "Off";
    }
    if (analysis.error) {
      return analysis.error;
    }
    if (!analysis.ready) {
      return "Loading...";
    }
    if (analysis.mate !== null) {
      return `Mate ${analysis.mate > 0 ? "+" : ""}${analysis.mate}`;
    }
    if (analysis.evalCp === null) {
      return "0.0";
    }
    return (analysis.evalCp / 100).toFixed(2);
  };

  const formatMovesList = () => {
    if (!match || match.moves.length === 0) {
      return "No moves.";
    }
    const lines: string[] = [];
    for (let i = 0; i < match.moves.length; i += 2) {
      const white = match.moves[i]?.san ?? "";
      const black = match.moves[i + 1]?.san ?? "";
      const moveNo = Math.floor(i / 2) + 1;
      lines.push(`${moveNo}. ${white} ${black}`.trim());
    }
    return lines.join("\n");
  };

  const buildReport = () => {
    if (!match) {
      return "";
    }
    const lines = [
      "The King Side - Match Analysis Report",
      `Generated: ${new Date().toISOString()}`,
      `Players: ${match.white.name} (White) vs ${match.black.name} (Black)`,
      `Result: ${match.result ?? match.status}`,
      `Time Control: ${match.timeControl}`,
      `Moves: ${match.moves.length}`,
      `Stockfish Eval: ${formatEval()}${analysis.depth ? ` (Depth ${analysis.depth})` : ""}`,
    ];
    if (analysis.bestMove) {
      lines.push(`Best Move: ${analysis.bestMove}`);
    }
    lines.push("");
    lines.push("Move List:");
    lines.push(formatMovesList());
    lines.push("");
    lines.push(`Final FEN: ${match.fen}`);
    return lines.join("\n");
  };

  const openReport = () => {
    const report = buildReport();
    setReportText(report);
    setReportOpen(true);
  };

  const copyReport = async () => {
    if (!reportText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(reportText);
    } catch {
      // Ignore copy failures.
    }
  };

  const downloadReport = () => {
    if (!reportText) {
      return;
    }
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "the-king-side-analysis.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  async function joinQueue() {
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/play/queue", { method: "POST" });
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        queue?: QueueState;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev
            ? {
                ...prev,
                match: data.match ?? prev.match,
                queue: data.queue ?? null,
              }
            : prev,
        );
      }
    } catch {
      setError("Queue request failed.");
    } finally {
      setActionBusy(false);
    }
  }

  async function leaveQueue() {
    setActionBusy(true);
    setError(null);
    try {
      await fetch("/api/play/queue", { method: "DELETE" });
      setState((prev) => (prev ? { ...prev, queue: null } : prev));
    } catch {
      setError("Unable to leave queue.");
    } finally {
      setActionBusy(false);
    }
  }

  async function resign() {
    if (!match) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/resign`, {
        method: "POST",
      });
      const data = (await response.json()) as { match?: MatchSnapshot; error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) => (prev ? { ...prev, match: data.match ?? prev.match } : prev));
      }
    } catch {
      setError("Unable to resign.");
    } finally {
      setActionBusy(false);
    }
  }

  async function offerDraw() {
    if (!match) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/draw`, {
        method: "POST",
      });
      const data = (await response.json()) as { match?: MatchSnapshot; error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) => (prev ? { ...prev, match: data.match ?? prev.match } : prev));
      }
    } catch {
      setError("Unable to offer draw.");
    } finally {
      setActionBusy(false);
    }
  }

  async function takeBack() {
    if (!match) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/takeback`, {
        method: "POST",
      });
      const data = (await response.json()) as { match?: MatchSnapshot; error?: string };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) => (prev ? { ...prev, match: data.match ?? prev.match } : prev));
      }
    } catch {
      setError("Unable to take back.");
    } finally {
      setActionBusy(false);
    }
  }

  async function onDrop(source: string, target: string) {
    if (!match || !isYourTurn) {
      return false;
    }

    const nextGame = new Chess();
    if (match.fen) {
      nextGame.load(match.fen);
    }
    const moveResult = nextGame.move({
      from: source,
      to: target,
      promotion: "q",
    });
    if (!moveResult) {
      return false;
    }

    setState((prev) => {
      if (!prev?.match || prev.match.id !== match.id) {
        return prev;
      }
      const ply = prev.match.moves.length + 1;
      return {
        ...prev,
        match: {
          ...prev.match,
          fen: nextGame.fen(),
          turn: nextGame.turn(),
          moves: [
            ...prev.match.moves,
            {
              ply,
              san: moveResult.san,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };
    });

    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: source, to: target, promotion: "q" }),
      });
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
        const fresh = await fetch("/api/play/state");
        const stateData = (await fresh.json()) as StatePayload;
        setState(stateData);
        return false;
      }
      setState((prev) =>
        prev ? { ...prev, match: data.match ?? prev.match } : prev,
      );
      return true;
    } catch {
      setError("Move failed.");
      try {
        const fresh = await fetch("/api/play/state");
        const stateData = (await fresh.json()) as StatePayload;
        setState(stateData);
      } catch {
        // Ignore refresh failures.
      }
      return false;
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[0.5fr_1.5fr]">
      <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0a111f]/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              Player
            </p>
            <p className="text-lg font-semibold">
              {player?.displayName ?? "Connecting..."}
            </p>
          </div>
          <div className="text-right text-sm text-white/60">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              Rating
            </p>
            <p className="text-lg font-semibold text-cyan-200">
              {player?.rating ?? 1200}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1628] p-4 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Matchmaking
          </p>
          <p className="mt-2 text-white/70">
            {queue
              ? "Searching for an opponent near your rating..."
              : match
                ? "Match found. Good luck."
                : "Queue up for a fair pairing within your level."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {match ? (
              <button
                type="button"
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80"
                disabled
              >
                Match in progress
              </button>
            ) : queue ? (
              <button
                type="button"
                className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm text-cyan-100"
                onClick={leaveQueue}
                disabled={actionBusy}
              >
                Leave queue
              </button>
            ) : (
              <button
                type="button"
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
                onClick={joinQueue}
                disabled={actionBusy}
              >
                Find a match
              </button>
            )}
          </div>
          {queue ? (
            <p className="mt-2 text-xs text-white/50">
              In queue since {new Date(queue.queuedAt).toLocaleTimeString()}.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1628] p-4 text-sm text-white/70">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Fair play rules
          </p>
          <ul className="mt-2 space-y-2 text-xs text-white/60">
            <li>Start rating is 1200 for everyone.</li>
            <li>Opponents are matched within a tight rating band.</li>
            <li>Rating updates after each game result.</li>
          </ul>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-100">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0a111f]/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              Live match
            </p>
            {match ? (
              <div className="space-y-1 text-sm text-white/70">
                <p>
                  {match.white.name} vs {match.black.name} -{" "}
                  {match.timeControl}
                </p>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>
                    White:{" "}
                    <span className="text-cyan-200">
                      {formatClock(clocks?.white)}
                    </span>
                  </span>
                  <span>
                    Black:{" "}
                    <span className="text-cyan-200">
                      {formatClock(clocks?.black)}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/50">
                Join the queue to start playing.
              </p>
            )}
          </div>
          {match ? (
            <div className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
              {match.status === "COMPLETED"
                ? `Result: ${match.result ?? "?"}`
                : isYourTurn
                  ? "Your move"
                  : "Waiting"}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
          <div
            ref={boardWrapRef}
            className="rounded-2xl border border-white/10 bg-[#0b1426] p-4"
            style={{ margin: "0 auto", maxWidth: "1400px" }}
          >
            <Chessboard
              position={game.fen()}
              boardWidth={boardWidth}
              boardOrientation={boardOrientation}
              onPieceDrop={onDrop}
              arePiecesDraggable={Boolean(match && isYourTurn && !actionBusy)}
              showBoardNotation
              customNotationStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#E2F7FF",
                textShadow: "0 0 3px rgba(0,0,0,0.8)",
              }}
              customDarkSquareStyle={{ backgroundColor: "#1f2a44" }}
              customLightSquareStyle={{ backgroundColor: "#2f3b5a" }}
            />
            {match ? (
              <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                <span>
                  You are {isWhite ? "White" : isBlack ? "Black" : "Observer"}
                </span>
                {match.status === "IN_PROGRESS" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={takeBack}
                      className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                      disabled={!canTakeBack || actionBusy}
                      title={
                        canTakeBack
                          ? "Undo your last move"
                          : "You can only undo your last move"
                      }
                    >
                      Take back
                    </button>
                    <button
                      type="button"
                      onClick={offerDraw}
                      className="rounded-full border border-cyan-300/40 px-3 py-1 text-cyan-100"
                      disabled={actionBusy}
                    >
                      Draw
                    </button>
                    <button
                      type="button"
                      onClick={resign}
                      className="rounded-full border border-red-400/40 px-3 py-1 text-red-200"
                      disabled={actionBusy}
                    >
                      Resign
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0b1426] p-4 text-xs text-white/70">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              Moves
            </p>
            <div className="rounded-xl border border-white/10 bg-[#0c1628] p-3 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span>Stockfish</span>
                <button
                  type="button"
                  onClick={() => setAnalysisOn((prev) => !prev)}
                  className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
                >
                  {analysisOn ? "On" : "Off"}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-white/60">
                <span>Eval</span>
                <span className="text-cyan-200">{formatEval()}</span>
              </div>
              {analysis.bestMove ? (
                <div className="mt-1 flex items-center justify-between text-white/60">
                  <span>Best</span>
                  <span className="font-mono text-cyan-200">
                    {analysis.bestMove}
                  </span>
                </div>
              ) : null}
              {analysis.depth ? (
                <div className="mt-1 text-[10px] text-white/40">
                  Depth {analysis.depth}
                </div>
              ) : null}
            </div>
            {match && match.moves.length ? (
              <div className="max-h-96 space-y-1 overflow-y-auto pr-1">
                {match.moves.map((move) => (
                  <div
                    key={move.ply}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0c1628] px-2 py-1"
                  >
                    <span>#{move.ply}</span>
                    <span className="font-mono text-cyan-200">{move.san}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50">Moves will appear here.</p>
            )}
            {match?.status === "COMPLETED" ? (
              <div className="rounded-xl border border-white/10 bg-[#0c1628] p-3 text-xs text-white/70">
                <div className="flex items-center justify-between">
                  <span>Analysis report</span>
                  <button
                    type="button"
                    onClick={openReport}
                    className="rounded-full border border-cyan-300/40 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100"
                  >
                    Generate
                  </button>
                </div>
                {reportOpen ? (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className="w-full rounded-lg border border-white/10 bg-slate-950/50 p-2 text-[11px] text-white/80"
                      rows={8}
                      readOnly
                      value={reportText}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyReport}
                        className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={downloadReport}
                        className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
