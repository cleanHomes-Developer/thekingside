"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useStockfishAnalysis } from "@/lib/play/useStockfishAnalysis";

type BotColor = "w" | "b";

const BOT_DELAY_MS = 700;
const TICK_MS = 250;
const TIME_CONTROLS = [
  { label: "3 + 0", minutes: 3, increment: 0 },
  { label: "5 + 3", minutes: 5, increment: 3 },
  { label: "10 + 0", minutes: 10, increment: 0 },
] as const;

const BOT_LEVELS = [
  { label: "Easy", depth: 8, lichessLevel: 2 },
  { label: "Medium", depth: 12, lichessLevel: 4 },
  { label: "Hard", depth: 16, lichessLevel: 6 },
  { label: "Master", depth: 20, lichessLevel: 8 },
];

function getGameStatus(game: Chess) {
  if (game.isCheckmate()) {
    return `Checkmate. ${game.turn() === "w" ? "Black" : "White"} wins.`;
  }
  if (game.isDraw()) {
    return "Draw.";
  }
  if (game.isCheck()) {
    return "Check.";
  }
  return "Game in progress.";
}

export default function DemoChessBoard() {
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [botColor, setBotColor] = useState<BotColor>("b");
  const [status, setStatus] = useState(getGameStatus(game));
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [timeControl, setTimeControl] = useState(TIME_CONTROLS[1]);
  const [botLevel, setBotLevel] = useState(BOT_LEVELS[2]);
  const [engineReady, setEngineReady] = useState(false);
  const [engineThinking, setEngineThinking] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const engineRef = useRef<Worker | null>(null);
  const fenRef = useRef(game.fen());
  const [playerTimeMs, setPlayerTimeMs] = useState(
    TIME_CONTROLS[1].minutes * 60 * 1000,
  );
  const [botTimeMs, setBotTimeMs] = useState(
    TIME_CONTROLS[1].minutes * 60 * 1000,
  );
  const [timeoutWinner, setTimeoutWinner] = useState<BotColor | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const botTimer = useRef<NodeJS.Timeout | null>(null);
  const engineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(900);
  const [analysisOn, setAnalysisOn] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");

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
  const historyRef = useRef<
    Array<{
      fen: string;
      playerTimeMs: number;
      botTimeMs: number;
      timeoutWinner: BotColor | null;
      status: string;
      botColor: BotColor;
    }>
  >([]);

  const playerColor = botColor === "w" ? "b" : "w";
  const analysis = useStockfishAnalysis(fen, analysisOn);

  const updateState = (nextGame: Chess, options?: { skipHistory?: boolean }) => {
    setGame(nextGame);
    setFen(nextGame.fen());
    setStatus(getGameStatus(nextGame));
    fenRef.current = nextGame.fen();
  };

  const pushHistory = () => {
    historyRef.current.push({
      fen: fenRef.current,
      playerTimeMs,
      botTimeMs,
      timeoutWinner,
      status,
      botColor,
    });
    if (historyRef.current.length > 16) {
      historyRef.current.shift();
    }
    setHistoryCount(historyRef.current.length);
  };

  const restoreSnapshot = (snapshot: {
    fen: string;
    playerTimeMs: number;
    botTimeMs: number;
    timeoutWinner: BotColor | null;
    status: string;
    botColor: BotColor;
  }) => {
    const nextGame = new Chess(snapshot.fen);
    setPlayerTimeMs(snapshot.playerTimeMs);
    setBotTimeMs(snapshot.botTimeMs);
    setTimeoutWinner(snapshot.timeoutWinner);
    setStatus(snapshot.status);
    setBotColor(snapshot.botColor);
    updateState(nextGame, { skipHistory: true });
  };

  const takeBack = () => {
    const snapshot = historyRef.current.pop();
    if (!snapshot) {
      return;
    }
    setHistoryCount(historyRef.current.length);
    restoreSnapshot(snapshot);
  };

  const handleDraw = () => {
    historyRef.current = [];
    setStatus("Draw agreed");
    setTimeoutWinner(null);
    setEngineThinking(false);
    setIsBotThinking(false);
    setHistoryCount(0);
  };

  const resetGame = (color: BotColor, control = timeControl) => {
    const nextGame = new Chess();
    updateState(nextGame);
    setBotColor(color);
    setTimeoutWinner(null);
    setPlayerTimeMs(control.minutes * 60 * 1000);
    setBotTimeMs(control.minutes * 60 * 1000);
    historyRef.current = [];
    setHistoryCount(0);
  };

  const applyEngineMove = (moveStr: string) => {
    pushHistory();
    const nextGame = new Chess(fenRef.current);
    const moveResult = nextGame.move({
      from: moveStr.slice(0, 2),
      to: moveStr.slice(2, 4),
      promotion: moveStr[4] ?? "q",
    });
    if (!moveResult) {
      historyRef.current.pop();
      setHistoryCount(historyRef.current.length);
      console.warn("Engine move invalid:", moveStr, fenRef.current);
      return false;
    }
    setBotTimeMs((prev) => prev + timeControl.increment * 1000);
    updateState(nextGame, { skipHistory: true });
    return true;
  };

  const makeBotMove = () => {
    setIsBotThinking(true);
    botTimer.current = setTimeout(() => {
      const nextGame = new Chess(game.fen());
      if (engineReady && engineRef.current) {
        requestEngineMove(nextGame.fen());
        return;
      }
      const bestMove = findBestMove(nextGame, botLevel.depth);
      if (!bestMove) {
        setIsBotThinking(false);
        return;
      }
      applyEngineMove(bestMove);
      setEngineThinking(false);
      setIsBotThinking(false);
    }, BOT_DELAY_MS);
  };

  useEffect(() => {
    if (game.isGameOver() || timeoutWinner) {
      return;
    }
    if (game.turn() === botColor && !isBotThinking) {
      makeBotMove();
    }
  }, [game, botColor, isBotThinking, timeoutWinner]);

  useEffect(() => {
    return () => {
      if (botTimer.current) {
        clearTimeout(botTimer.current);
      }
      if (engineTimeoutRef.current) {
        clearTimeout(engineTimeoutRef.current);
      }
    };
  }, []);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (game.isGameOver() || game.turn() !== playerColor || timeoutWinner) {
      return false;
    }
    const nextGame = new Chess(game.fen());
    pushHistory();
    const move = nextGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (!move) {
      historyRef.current.pop();
      setHistoryCount(historyRef.current.length);
      return false;
    }
    setPlayerTimeMs((prev) => prev + timeControl.increment * 1000);
    updateState(nextGame);
    return true;
  };

  const moveList = useMemo(() => game.history(), [game]);

  useEffect(() => {
    try {
      const workerUrl = "/stockfish/stockfish-worker.js";
      const engine = new Worker(workerUrl);
      engineRef.current = engine;
      setEngineError(null);
      engine.postMessage("uci");
      engine.postMessage("isready");
      engine.onmessage = (event: MessageEvent<string>) => {
        const line = typeof event.data === "string" ? event.data : "";
        if (line.includes("uciok") || line.includes("readyok")) {
          setEngineReady(true);
        }
        if (line.startsWith("bestmove")) {
          if (engineTimeoutRef.current) {
            clearTimeout(engineTimeoutRef.current);
            engineTimeoutRef.current = null;
          }
          const parts = line.split(" ");
          const move = parts[1];
          if (move && move !== "(none)") {
            applyEngineMove(move);
          }
          setEngineThinking(false);
          setIsBotThinking(false);
        }
      };
      engine.onerror = () => {
        setEngineReady(false);
        setEngineError("Stockfish failed to load. Using local bot.");
      };
    } catch {
      setEngineReady(false);
      setEngineError("Stockfish failed to load. Using local bot.");
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.terminate();
        engineRef.current = null;
      }
    };
  }, []);

  const requestEngineMove = (fenPosition: string) => {
    if (!engineRef.current) {
      return;
    }
    setEngineThinking(true);
    if (engineTimeoutRef.current) {
      clearTimeout(engineTimeoutRef.current);
    }
    engineTimeoutRef.current = setTimeout(() => {
      const nextGame = new Chess(fenPosition);
      const bestMove = findBestMove(nextGame, botLevel.depth);
      if (bestMove) {
        applyEngineMove(bestMove);
      }
      setEngineThinking(false);
      setIsBotThinking(false);
      engineTimeoutRef.current = null;
    }, 2000);
    engineRef.current.postMessage("ucinewgame");
    engineRef.current.postMessage(`position fen ${fenPosition}`);
    engineRef.current.postMessage(`go depth ${botLevel.depth}`);
  };

  useEffect(() => {
    if (game.isGameOver() || timeoutWinner) {
      return;
    }
    const interval = setInterval(() => {
      if (game.turn() === playerColor) {
        setPlayerTimeMs((prev) => {
          const next = Math.max(0, prev - TICK_MS);
          if (next === 0) {
            setTimeoutWinner(botColor);
          }
          return next;
        });
      } else {
        setBotTimeMs((prev) => {
          const next = Math.max(0, prev - TICK_MS);
          if (next === 0) {
            setTimeoutWinner(playerColor);
          }
          return next;
        });
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [game, botColor, playerColor, timeoutWinner]);

  const formattedPlayerTime = formatTime(playerTimeMs);
  const formattedBotTime = formatTime(botTimeMs);

  const formatEval = () => {
    if (!analysisOn) {
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
    if (moveList.length === 0) {
      return "No moves.";
    }
    const lines: string[] = [];
    for (let i = 0; i < moveList.length; i += 2) {
      const white = moveList[i] ?? "";
      const black = moveList[i + 1] ?? "";
      const moveNo = Math.floor(i / 2) + 1;
      lines.push(`${moveNo}. ${white} ${black}`.trim());
    }
    return lines.join("\n");
  };

  const buildReport = () => {
    const lines = [
      "The King Side - Practice Analysis Report",
      `Generated: ${new Date().toISOString()}`,
      `Player Color: ${playerColor === "w" ? "White" : "Black"}`,
      `Time Control: ${timeControl.label}`,
      `Moves: ${moveList.length}`,
      `Stockfish Eval: ${formatEval()}${analysis.depth ? ` (Depth ${analysis.depth})` : ""}`,
    ];
    if (analysis.bestMove) {
      lines.push(`Best Move: ${analysis.bestMove}`);
    }
    lines.push("");
    lines.push("Move List:");
    lines.push(formatMovesList());
    lines.push("");
    lines.push(`Final FEN: ${fen}`);
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
    anchor.download = "the-king-side-practice-analysis.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.5fr_1.5fr]">
      <div className="rounded-3xl border border-white/10 panel-surface p-6 shadow-[0_0_30px_rgba(0,217,255,0.12)] lg:order-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Demo Mode
            </p>
            <h2 className="text-2xl font-semibold text-white">
              Play vs Bot
            </h2>
            <p className="text-sm text-white/60">
              You are playing as {playerColor === "w" ? "White" : "Black"}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Time</span>
              <select
                value={timeControl.label}
                onChange={(event) => {
                  const next = TIME_CONTROLS.find(
                    (item) => item.label === event.target.value,
                  );
                  if (next) {
                    setTimeControl(next);
                    resetGame(botColor, next);
                  }
                }}
                className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-white/80"
              >
                {TIME_CONTROLS.map((control) => (
                  <option key={control.label} value={control.label}>
                    {control.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Bot</span>
              <select
                value={botLevel.label}
                onChange={(event) => {
                  const next = BOT_LEVELS.find(
                    (item) => item.label === event.target.value,
                  );
                  if (next) {
                    setBotLevel(next);
                  }
                }}
                className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-white/80"
              >
                {BOT_LEVELS.map((level) => (
                  <option key={level.label} value={level.label}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => resetGame("b")}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Play White
            </button>
            <button
              type="button"
              onClick={() => resetGame("w")}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-cyan-300"
            >
              Play Black
            </button>
            <button
              type="button"
              onClick={() => resetGame(botColor)}
              className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-cyan-300"
            >
              New Game
            </button>
            <button
              type="button"
              onClick={takeBack}
              disabled={historyCount === 0}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 transition hover:border-cyan-300 disabled:opacity-40"
            >
              Take back
            </button>
            <button
              type="button"
              onClick={handleDraw}
              className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:border-cyan-100"
            >
              Draw
            </button>
          </div>
        </div>

          <div
            ref={boardWrapRef}
            className="mt-6 overflow-hidden rounded-2xl border border-white/10 panel-surface p-4"
            style={{ margin: "0 auto", maxWidth: "1400px" }}
          >
            <Chessboard
              id="demo-bot-board"
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={boardWidth}
              showBoardNotation
              customNotationStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#E2F7FF",
                textShadow: "0 0 3px rgba(0,0,0,0.8)",
              }}
              customBoardStyle={{
                borderRadius: "12px",
                boxShadow: "0 0 20px rgba(0, 217, 255, 0.15)",
              }}
                customLightSquareStyle={{ backgroundColor: "#2f3b5a" }}
                customDarkSquareStyle={{ backgroundColor: "#1f2a44" }}
                boardOrientation={playerColor === "w" ? "white" : "black"}
              />
            </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-white/10 panel-surface p-6 text-sm text-white/70 shadow-[0_0_30px_rgba(0,217,255,0.08)] lg:order-1">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Status
          </p>
          <p className="mt-2 text-white/80">
            {timeoutWinner
              ? `${timeoutWinner === "w" ? "White" : "Black"} wins on time.`
              : status}
          </p>
          {isBotThinking || engineThinking ? (
            <p className="mt-1 text-xs text-cyan-200">Bot is thinking...</p>
          ) : null}
        </div>
        <div className="rounded-xl border border-white/10 panel-soft p-3 text-xs text-white/60">
          <div className="flex items-center justify-between">
            <span>Player</span>
            <span className="font-semibold text-white/80">
              {formattedPlayerTime}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Bot</span>
            <span className="font-semibold text-white/80">
              {formattedBotTime}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 panel-soft p-3 text-xs text-white/60">
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
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Moves
          </p>
          {moveList.length === 0 ? (
            <p className="mt-2 text-white/60">No moves yet.</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {moveList.map((move, index) => (
                <div
                  key={`${move}-${index}`}
                  className="rounded-lg border border-white/10 panel-soft px-2 py-1 text-white/80"
                >
                  {index + 1}. {move}
                </div>
              ))}
            </div>
          )}
        </div>
        {(game.isGameOver() || timeoutWinner) ? (
          <div className="rounded-xl border border-white/10 panel-soft p-3 text-xs text-white/60">
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
        {engineError ? (
          <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {engineError}
          </p>
        ) : null}
        <div className="rounded-xl border border-white/10 panel-soft p-3 text-xs text-white/60">
          Stockfish engine is {engineReady ? "ready" : "loading"}.
        </div>
      </div>
    </div>
  );
}

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function findBestMove(game: Chess, depth: number) {
  const moves = game.moves();
  if (moves.length === 0) {
    return null;
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const nextGame = new Chess(game.fen());
    nextGame.move(move);
    const score = -minimax(nextGame, depth - 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number) {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game);
  }

  let best = -Infinity;
  const moves = game.moves();
  for (const move of moves) {
    const nextGame = new Chess(game.fen());
    nextGame.move(move);
    const score = -minimax(nextGame, depth - 1, -beta, -alpha);
    if (score > best) {
      best = score;
    }
    if (best > alpha) {
      alpha = best;
    }
    if (alpha >= beta) {
      break;
    }
  }

  return best;
}

function evaluatePosition(game: Chess) {
  const board = game.board();
  let score = 0;
  const pieceValues: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000,
  };

  for (const row of board) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }
      const value = pieceValues[piece.type] ?? 0;
      score += piece.color === game.turn() ? value : -value;
    }
  }

  return score;
}
