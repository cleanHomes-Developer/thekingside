"use client";

import { useEffect, useRef, useState } from "react";

type AnalysisState = {
  evalCp: number | null;
  mate: number | null;
  bestMove: string | null;
  depth: number;
  ready: boolean;
  error: string | null;
};

const DEFAULT_STATE: AnalysisState = {
  evalCp: null,
  mate: null,
  bestMove: null,
  depth: 0,
  ready: false,
  error: null,
};

export function useStockfishAnalysis(fen: string | null, enabled: boolean) {
  const [state, setState] = useState<AnalysisState>(DEFAULT_STATE);
  const workerRef = useRef<Worker | null>(null);
  const lastFenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      setState(DEFAULT_STATE);
      return;
    }

    try {
      const worker = new Worker("/stockfish/stockfish-worker.js");
      workerRef.current = worker;
      setState((prev) => ({ ...prev, error: null }));

      worker.postMessage("uci");
      worker.postMessage("isready");

      worker.onmessage = (event: MessageEvent<string>) => {
        const line = typeof event.data === "string" ? event.data : "";
        if (line.includes("uciok") || line.includes("readyok")) {
          setState((prev) => ({ ...prev, ready: true }));
        }
        if (line.startsWith("info")) {
          const depthMatch = line.match(/depth (\d+)/);
          const cpMatch = line.match(/score cp (-?\d+)/);
          const mateMatch = line.match(/score mate (-?\d+)/);
          setState((prev) => ({
            ...prev,
            depth: depthMatch ? Number(depthMatch[1]) : prev.depth,
            evalCp: cpMatch ? Number(cpMatch[1]) : prev.evalCp,
            mate: mateMatch ? Number(mateMatch[1]) : prev.mate,
          }));
        }
        if (line.startsWith("bestmove")) {
          const parts = line.split(" ");
          const move = parts[1];
          if (move && move !== "(none)") {
            setState((prev) => ({ ...prev, bestMove: move }));
          }
        }
      };

      worker.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: "Stockfish failed to load.",
          ready: false,
        }));
      };
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Stockfish failed to load.",
        ready: false,
      }));
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !fen || !workerRef.current || !state.ready) {
      return;
    }
    if (fen === lastFenRef.current) {
      return;
    }
    lastFenRef.current = fen;

    workerRef.current.postMessage("stop");
    workerRef.current.postMessage("ucinewgame");
    workerRef.current.postMessage(`position fen ${fen}`);
    workerRef.current.postMessage("go depth 12");
  }, [enabled, fen, state.ready]);

  return state;
}
