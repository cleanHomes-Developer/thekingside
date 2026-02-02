
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useStockfishAnalysis } from "@/lib/play/useStockfishAnalysis";

type Mode = "player" | "bot";

type PlayerState = {
  id: string;
  displayName: string;
  rating: number;
};

type QueueState = {
  id: string;
  status: string;
  queuedAt: string;
  timeControl: string;
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
  drawOffer: { byId: string; byName: string; at: string } | null;
  takebackOffer: { byId: string; byName: string; at: string } | null;
} | null;

type StatePayload = {
  player: PlayerState | null;
  queue: QueueState;
  match: MatchSnapshot;
};

type BotColor = "w" | "b";

const BOT_DELAY_MS = 300;
const TICK_MS = 250;
const PLAYER_TIME_CONTROLS = {
  bullet: [
    { label: "1 + 0", value: "1+0" },
    { label: "1 + 1", value: "1+1" },
    { label: "2 + 1", value: "2+1" },
  ],
  blitz: [
    { label: "3 + 0", value: "3+0" },
    { label: "3 + 2", value: "3+2" },
    { label: "5 + 0", value: "5+0" },
  ],
  rapid: [
    { label: "10 + 0", value: "10+0" },
    { label: "15 + 10", value: "15+10" },
    { label: "30 + 0", value: "30+0" },
  ],
};

const BOT_LEVELS = [
  { label: "Easy", depth: 8, lichessLevel: 2 },
  { label: "Medium", depth: 12, lichessLevel: 4 },
  { label: "Hard", depth: 16, lichessLevel: 6 },
  { label: "Master", depth: 20, lichessLevel: 8 },
];

function parseTimeControl(value: string) {
  const [minutesRaw, incrementRaw] = value.split("+");
  const minutes = Number(minutesRaw);
  const increment = Number(incrementRaw);
  return {
    label: `${minutes} + ${increment}`,
    minutes: Number.isFinite(minutes) ? minutes : 3,
    increment: Number.isFinite(increment) ? increment : 0,
  };
}

const DEFAULT_BOT_CONTROL = parseTimeControl("3+2");
const formatTimeControl = (value: string) => {
  const [minutesRaw, incrementRaw] = value.split("+");
  if (!minutesRaw || !incrementRaw) {
    return value;
  }
  return `${minutesRaw} + ${incrementRaw}`;
};

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

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
export default function UnifiedBoard({
  mode,
  variant = "classic",
  minBoardWidth = 700,
  maxBoardWidth = 1400,
}: {
  mode: Mode;
  variant?: "classic" | "mastery";
  minBoardWidth?: number;
  maxBoardWidth?: number;
}) {
  const [state, setState] = useState<StatePayload | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [streamStatus, setStreamStatus] = useState<"connected" | "reconnecting">(
    "connected",
  );
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const [boardWidth, setBoardWidth] = useState(900);
  const [playerTimeControl, setPlayerTimeControl] = useState("3+2");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sseVersion, setSseVersion] = useState(0);
  const prevSoundKeyRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [fullMoves, setFullMoves] = useState<string[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const reconnectNow = () => {
    setStreamStatus("reconnecting");
    setSseVersion((prev) => prev + 1);
  };
  const player = state?.player ?? null;
  const match = state?.match ?? null;
  const queue = state?.queue ?? null;
  const matchInProgress = match?.status === "IN_PROGRESS";
  const canChangeTimeControl = !actionBusy && !queue && !match;
  const drawOfferedByYou =
    Boolean(match?.drawOffer) && match?.drawOffer?.byId === player?.id;
  const drawOfferedToYou =
    Boolean(match?.drawOffer) &&
    match?.drawOffer?.byId !== player?.id &&
    match?.status === "IN_PROGRESS";
  const takebackOfferedByYou =
    Boolean(match?.takebackOffer) && match?.takebackOffer?.byId === player?.id;
  const takebackOfferedToYou =
    Boolean(match?.takebackOffer) &&
    match?.takebackOffer?.byId !== player?.id &&
    match?.status === "IN_PROGRESS";
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDrawOfferByYouRef = useRef(false);
  const prevTakebackOfferByYouRef = useRef(false);
  const prevMovesCountRef = useRef<number | null>(null);
  const prevMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (match?.id !== prevMatchIdRef.current) {
      prevMatchIdRef.current = match?.id ?? null;
      prevDrawOfferByYouRef.current = false;
      prevTakebackOfferByYouRef.current = false;
      prevMovesCountRef.current = match?.moves.length ?? null;
      setNotice(null);
    }
  }, [match?.id, match?.moves.length]);

  useEffect(() => {
    if (!match) {
      return;
    }

    const currentDrawOfferedByYou =
      Boolean(match.drawOffer) && match.drawOffer.byId === player?.id;
    const currentTakebackOfferedByYou =
      Boolean(match.takebackOffer) && match.takebackOffer.byId === player?.id;

    if (
      prevDrawOfferByYouRef.current &&
      !currentDrawOfferedByYou &&
      match.status === "IN_PROGRESS"
    ) {
      setNotice("Draw offer declined.");
    }

    if (
      prevTakebackOfferByYouRef.current &&
      !currentTakebackOfferedByYou &&
      match.status === "IN_PROGRESS"
    ) {
      const prevMoves = prevMovesCountRef.current ?? match.moves.length;
      if (match.moves.length === prevMoves) {
        setNotice("Take back declined.");
      }
    }

    prevDrawOfferByYouRef.current = currentDrawOfferedByYou;
    prevTakebackOfferByYouRef.current = currentTakebackOfferedByYou;
    prevMovesCountRef.current = match.moves.length;
  }, [match, player?.id]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = setTimeout(() => {
      setNotice(null);
    }, 4000);
    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, [notice]);

  useEffect(() => {
    if (mode !== "player") {
      return;
    }
    let active = true;
    async function init() {
      try {
        await fetch("/api/play/me");
        const response = await fetch("/api/play/state");
        const data = (await response.json()) as StatePayload;
        if (active) {
          setState(data);
          // No-op; state loaded.
        }
      } catch {
        if (active) {
          setError("Unable to connect to the lobby.");
        }
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [mode, sseVersion]);

  useEffect(() => {
    if (!soundEnabled || audioUnlocked) {
      return;
    }
    const unlock = async () => {
      const AudioContextClass =
        typeof window !== "undefined"
          ? window.AudioContext || window.webkitAudioContext
          : null;
      if (!AudioContextClass) {
        return;
      }
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      if (audioContextRef.current.state === "suspended") {
        try {
          await audioContextRef.current.resume();
        } catch {
          // Ignore resume failures.
        }
      }
      setAudioUnlocked(true);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [soundEnabled, audioUnlocked]);

  useEffect(() => {
    if (mode !== "player" || typeof window === "undefined") {
      return;
    }

    let fallbackTimer: NodeJS.Timeout | null = null;
    const source = new EventSource("/api/play/stream");

    source.onopen = () => {
      setStreamStatus("connected");
    };

    source.onmessage = (event) => {
      const data = JSON.parse(event.data) as StatePayload;
      setState(data);
      setStreamStatus("connected");
    };

    source.onerror = () => {
      setStreamStatus("reconnecting");
      source.close();
      if (!fallbackTimer) {
        fallbackTimer = setInterval(async () => {
          try {
            const response = await fetch("/api/play/state");
            const data = (await response.json()) as StatePayload;
            setState(data);
            setStreamStatus("connected");
          } catch {
            setStreamStatus("reconnecting");
          }
        }, 2000);
      }
    };

    return () => {
      source.close();
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
    };
  }, [mode]);

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
      const capped = Math.max(minBoardWidth, Math.min(maxBoardWidth, width));
      setBoardWidth(capped);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, [minBoardWidth, maxBoardWidth]);

  useEffect(() => {
    if (mode !== "player") {
      return;
    }
    if (!match || match.status !== "IN_PROGRESS") {
      return;
    }
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(timer);
  }, [mode, match?.id, match?.status]);

  const playerGame = useMemo(() => {
    const instance = new Chess();
    if (match?.fen) {
      instance.load(match.fen);
    }
    return instance;
  }, [match?.fen]);


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
    matchInProgress &&
    lastMoveColor !== null &&
    ((lastMoveColor === "WHITE" && isWhite) ||
      (lastMoveColor === "BLACK" && isBlack));
  useEffect(() => {
    if (mode !== "player") {
      return;
    }
    if (!match?.id) {
      setFullMoves([]);
      return;
    }

    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/play/match/${match.id}/moves`);
        const data = (await response.json()) as {
          moves?: Array<{ san: string }>;
        };
        if (!active) {
          return;
        }
        if (data.moves && Array.isArray(data.moves)) {
          setFullMoves(data.moves.map((move) => move.san));
        }
      } catch {
        // Ignore refresh errors.
      }
    };

    refresh();
    const interval = setInterval(refresh, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [mode, match?.id]);

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
      const active = match.turn === "w" ? "WHITE" : "BLACK";
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

  async function joinQueue(timeControlOverride?: string) {
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/play/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeControl: timeControlOverride ?? playerTimeControl,
        }),
      });
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
    if (!match || !matchInProgress) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/resign`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev ? { ...prev, match: data.match ?? prev.match } : prev,
        );
      }
    } catch {
      setError("Unable to resign.");
    } finally {
      setActionBusy(false);
    }
  }

  async function offerDraw() {
    if (!match || !matchInProgress) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/draw`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev ? { ...prev, match: data.match ?? prev.match } : prev,
        );
      }
    } catch {
      setError("Unable to offer draw.");
    } finally {
      setActionBusy(false);
    }
  }

  async function declineDraw() {
    if (!match || !matchInProgress) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/play/match/${match.id}/draw/decline`,
        {
          method: "POST",
        },
      );
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev ? { ...prev, match: data.match ?? prev.match } : prev,
        );
      }
    } catch {
      setError("Unable to decline draw.");
    } finally {
      setActionBusy(false);
    }
  }

  async function declineTakeback() {
    if (!match || !matchInProgress) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/play/match/${match.id}/takeback/decline`,
        {
          method: "POST",
        },
      );
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev ? { ...prev, match: data.match ?? prev.match } : prev,
        );
      }
    } catch {
      setError("Unable to decline take back.");
    } finally {
      setActionBusy(false);
    }
  }

  async function takeBack() {
    if (!match || !matchInProgress) {
      return;
    }
    setActionBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/play/match/${match.id}/takeback`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        match?: MatchSnapshot;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
      } else {
        setState((prev) =>
          prev ? { ...prev, match: data.match ?? prev.match } : prev,
        );
      }
    } catch {
      setError("Unable to take back.");
    } finally {
      setActionBusy(false);
    }
  }

  async function onDropPlayer(source: string, target: string) {
    if (!match || !matchInProgress || !isYourTurn) {
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
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [botColor, setBotColor] = useState<BotColor>("b");
  const [status, setStatus] = useState(getGameStatus(game));
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [timeControl, setTimeControl] = useState(DEFAULT_BOT_CONTROL);
  const [botLevel, setBotLevel] = useState(BOT_LEVELS[2]);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [botMoves, setBotMoves] = useState<string[]>([]);
  const [botLastMove, setBotLastMove] = useState<{ from: string; to: string } | null>(null);
  const engineRef = useRef<Worker | null>(null);
  const fenRef = useRef(game.fen());
  const [playerTimeMs, setPlayerTimeMs] = useState(
    DEFAULT_BOT_CONTROL.minutes * 60 * 1000,
  );
  const [botTimeMs, setBotTimeMs] = useState(
    DEFAULT_BOT_CONTROL.minutes * 60 * 1000,
  );
  const [timeoutWinner, setTimeoutWinner] = useState<BotColor | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const botTimer = useRef<NodeJS.Timeout | null>(null);
  const engineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const historyRef = useRef<
    Array<{
      fen: string;
      playerTimeMs: number;
      botTimeMs: number;
      timeoutWinner: BotColor | null;
      status: string;
      botColor: BotColor;
      moves: string[];
      lastMove: { from: string; to: string } | null;
    }>
  >([]);

  const playerColor = botColor === "w" ? "b" : "w";
  const moveList = useMemo(() => botMoves, [botMoves]);
  const lastMoveSquares = useMemo(() => {
    if (mode === "player") {
      if (!match || match.moves.length === 0) {
        return null;
      }
      const replay = new Chess();
      for (const move of match.moves) {
        replay.move(move.san, { sloppy: true });
      }
      const history = replay.history({ verbose: true });
      const last = history[history.length - 1];
      if (!last) {
        return null;
      }
      return { from: last.from, to: last.to };
    }

    return botLastMove;
  }, [mode, match?.moves.length, match?.fen, botLastMove]);

  const lastMoveStyles = useMemo(() => {
    if (!lastMoveSquares) {
      return {};
    }
    return {
      [lastMoveSquares.from]: { backgroundColor: "rgba(34, 197, 94, 0.35)" },
      [lastMoveSquares.to]: { backgroundColor: "rgba(34, 197, 94, 0.6)" },
    };
  }, [lastMoveSquares]);

  const updateState = (nextGame: Chess) => {
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
      moves: [...botMoves],
      lastMove: botLastMove,
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
    moves: string[];
    lastMove: { from: string; to: string } | null;
  }) => {
    const nextGame = new Chess(snapshot.fen);
    setPlayerTimeMs(snapshot.playerTimeMs);
    setBotTimeMs(snapshot.botTimeMs);
    setTimeoutWinner(snapshot.timeoutWinner);
    setStatus(snapshot.status);
    setBotColor(snapshot.botColor);
    setBotMoves(snapshot.moves);
    setBotLastMove(snapshot.lastMove);
    updateState(nextGame);
  };

  const takeBackBot = () => {
    const snapshot = historyRef.current.pop();
    if (!snapshot) {
      return;
    }
    setHistoryCount(historyRef.current.length);
    restoreSnapshot(snapshot);
  };

  const handleDrawBot = () => {
    historyRef.current = [];
    setStatus("Draw agreed");
    setTimeoutWinner(null);
    setIsBotThinking(false);
    setHistoryCount(0);
  };

  const resignBot = () => {
    if (game.isGameOver()) {
      return;
    }
    setStatus("You resigned.");
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "backspace" || key === " ") {
        event.preventDefault();
        if (mode === "player") {
          if (matchInProgress && !takebackOfferedByYou) {
            void takeBack();
          }
        } else if (historyCount > 0) {
          takeBackBot();
        }
        return;
      }

      if (key === "d") {
        event.preventDefault();
        if (mode === "player") {
          if (matchInProgress && !drawOfferedByYou) {
            void offerDraw();
          }
        } else {
          handleDrawBot();
        }
      }

      if (key === "r") {
        event.preventDefault();
        if (mode === "player") {
          if (matchInProgress) {
            void resign();
          }
        } else {
          resignBot();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    mode,
    matchInProgress,
    takebackOfferedByYou,
    drawOfferedByYou,
    historyCount,
    takeBack,
    offerDraw,
    resign,
    takeBackBot,
    handleDrawBot,
    resignBot,
  ]);

  const resetGame = (color: BotColor, control = timeControl) => {
    const nextGame = new Chess();
    updateState(nextGame);
    setBotColor(color);
    setTimeoutWinner(null);
    setPlayerTimeMs(control.minutes * 60 * 1000);
    setBotTimeMs(control.minutes * 60 * 1000);
    historyRef.current = [];
    setHistoryCount(0);
    setBotMoves([]);
    setBotLastMove(null);
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
      return false;
    }
    setBotTimeMs((prev) => prev + timeControl.increment * 1000);
    setBotMoves((prev) => [...prev, moveResult.san]);
    setBotLastMove({ from: moveResult.from, to: moveResult.to });
    updateState(nextGame);
    return true;
  };

  const requestEngineMove = (fenPosition: string) => {
    if (!engineRef.current) {
      return;
    }
    engineTimeoutRef.current = setTimeout(() => {
      setIsBotThinking(false);
      setEngineError("Engine timeout. Using local bot.");
    }, 3000);
    engineRef.current.postMessage("ucinewgame");
    engineRef.current.postMessage(`position fen ${fenPosition}`);
    engineRef.current.postMessage(`go depth ${botLevel.depth}`);
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
      setIsBotThinking(false);
    }, BOT_DELAY_MS);
  };

  useEffect(() => {
    if (mode !== "bot") {
      return;
    }
    if (game.isGameOver() || timeoutWinner) {
      return;
    }
    if (game.turn() === botColor && !isBotThinking) {
      makeBotMove();
    }
  }, [mode, game, botColor, isBotThinking, timeoutWinner]);

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

  const onDropBot = (sourceSquare: string, targetSquare: string) => {
    if (game.isGameOver() || game.turn() !== playerColor || timeoutWinner) {
      return false;
    }
    const nextGame = new Chess(game.fen());
    const move = nextGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (!move) {
      return false;
    }
    pushHistory();
    updateState(nextGame);
    setBotMoves((prev) => [...prev, move.san]);
    setBotLastMove({ from: move.from, to: move.to });
    setPlayerTimeMs((prev) => prev + timeControl.increment * 1000);
    return true;
  };

  useEffect(() => {
    if (mode !== "bot") {
      return;
    }
    if (!engineRef.current) {
      try {
        const engine = new Worker("/stockfish/stockfish-worker.js");
        engineRef.current = engine;
        setEngineError(null);
        engine.onmessage = (event: MessageEvent<string>) => {
          const line = typeof event.data === "string" ? event.data : "";
          if (line.includes("uciok") || line.includes("readyok")) {
            setEngineReady(true);
          }
          if (line.startsWith("bestmove")) {
            if (engineTimeoutRef.current) {
              clearTimeout(engineTimeoutRef.current);
            }
            const move = line.split(" ")[1];
            if (move && move !== "(none)") {
              applyEngineMove(move);
            }
            setIsBotThinking(false);
          }
        };
        engine.onerror = () => {
          setEngineReady(false);
          setEngineError("Stockfish failed to load. Using local bot.");
        };
        engine.postMessage("uci");
        engine.postMessage("isready");
      } catch {
        setEngineReady(false);
        setEngineError("Stockfish failed to load. Using local bot.");
      }
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "bot") {
      return;
    }
    if (timeoutWinner || game.isGameOver()) {
      return;
    }
    const timer = setInterval(() => {
      if (game.turn() === playerColor) {
        setPlayerTimeMs((prev) => Math.max(0, prev - TICK_MS));
      } else {
        setBotTimeMs((prev) => Math.max(0, prev - TICK_MS));
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [mode, game, playerColor, timeoutWinner]);

  useEffect(() => {
    if (mode !== "bot") {
      return;
    }
    if (playerTimeMs <= 0 && !timeoutWinner) {
      setTimeoutWinner(playerColor);
    }
    if (botTimeMs <= 0 && !timeoutWinner) {
      setTimeoutWinner(botColor);
    }
  }, [mode, botTimeMs, playerTimeMs, timeoutWinner, botColor, playerColor]);

  const formattedPlayerTime = formatTime(playerTimeMs);
  const formattedBotTime = formatTime(botTimeMs);

  const analysisOn = true;
  const analysisFen = mode === "player" ? match?.fen ?? null : fen;
  const analysisEnabled = Boolean(analysisFen);
  const analysis = useStockfishAnalysis(analysisFen, analysisOn && analysisEnabled);

  const formatEval = () => {
    if (!analysisOn || !analysisEnabled) {
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
    if (activeMoves.length === 0) {
      return "No moves.";
    }
    const lines: string[] = [];
    for (let i = 0; i < activeMoves.length; i += 2) {
      const white = activeMoves[i] ?? "";
      const black = activeMoves[i + 1] ?? "";
      const moveNo = Math.floor(i / 2) + 1;
      lines.push(`${moveNo}. ${white} ${black}`.trim());
    }
    return lines.join("\n");
  };

  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  const buildReport = () => {
    if (mode === "player") {
      if (!match) {
        return "";
      }
      const lines = [
        "The King Side - Match Analysis Report",
        `Generated: ${new Date().toISOString()}`,
        `Players: ${match.white.name} (White) vs ${match.black.name} (Black)`,
        `Result: ${match.result ?? match.status}`,
        `Time Control: ${formatTimeControl(match.timeControl)}`,
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
    }

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
    anchor.download =
      mode === "player"
        ? "the-king-side-analysis.txt"
        : "the-king-side-practice-analysis.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const activePosition = mode === "player" ? playerGame.fen() : fen;
  const activeOrientation =
    mode === "player" ? boardOrientation : playerColor === "w" ? "white" : "black";
  const activeOnDrop = mode === "player" ? onDropPlayer : onDropBot;
  const activeDraggable =
    mode === "player"
      ? Boolean(match && matchInProgress && isYourTurn && !actionBusy)
      : !game.isGameOver() && game.turn() === playerColor && !timeoutWinner;
  const activeMoves =
    mode === "player"
      ? fullMoves.length
        ? fullMoves
        : match?.moves.map((move) => move.san) ?? []
      : moveList;
  const activeMovesKey = useMemo(() => activeMoves.join("|"), [activeMoves]);
  useEffect(() => {
    if (!soundEnabled || !audioUnlocked) {
      prevSoundKeyRef.current = activeMovesKey;
      return;
    }
    if (!activeMovesKey) {
      prevSoundKeyRef.current = activeMovesKey;
      return;
    }
    if (prevSoundKeyRef.current === null) {
      prevSoundKeyRef.current = activeMovesKey;
      return;
    }
    if (activeMovesKey === prevSoundKeyRef.current) {
      return;
    }

    prevSoundKeyRef.current = activeMovesKey;
    const playSound = async () => {
      try {
        let ctx = audioContextRef.current;
        if (!ctx) {
          const AudioContextClass =
            typeof window !== "undefined"
              ? window.AudioContext || window.webkitAudioContext
              : null;
          if (!AudioContextClass) {
            return;
          }
          ctx = new AudioContextClass();
          audioContextRef.current = ctx;
        }
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.value = 0.08;
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
      } catch {
        // Ignore audio failures.
      }
    };
    void playSound();
  }, [activeMovesKey, soundEnabled, audioUnlocked]);
  const outerGridClass =
    variant === "mastery"
      ? "mt-8 grid gap-8 lg:grid-cols-[0.4fr_1.6fr]"
      : "mt-8 grid gap-6 lg:grid-cols-[0.5fr_1.5fr]";
  const boardGridClass =
    variant === "mastery"
      ? "mt-6 grid gap-6 lg:grid-cols-[1.6fr_0.4fr]"
      : "mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.5fr]";
  const movePairs = useMemo(() => {
    const pairs: Array<{ no: number; white: string; black: string }> = [];
    for (let i = 0; i < activeMoves.length; i += 2) {
      pairs.push({
        no: Math.floor(i / 2) + 1,
        white: activeMoves[i] ?? "",
        black: activeMoves[i + 1] ?? "",
      });
    }
    return pairs;
  }, [activeMoves]);
  const evalSeries = useMemo(
    () => buildMaterialEvalSeries(activeMoves),
    [activeMovesKey],
  );
  const analysisSummary = useMemo(
    () => summarizeMoveQuality(evalSeries),
    [evalSeries],
  );
  const fullHistoryText = useMemo(() => formatMovesList(), [activeMovesKey]);
  const inlineHistoryText = useMemo(
    () => fullHistoryText.replace(/\s+/g, " ").trim(),
    [fullHistoryText],
  );
  const copyHistory = async () => {
    if (!fullHistoryText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(fullHistoryText);
      setNotice("Move history copied.");
    } catch {
      // Ignore copy failures.
    }
  };
  const botTimeControlValue = `${timeControl.minutes}+${timeControl.increment}`;
  const activeTimeControlValue =
    mode === "player"
      ? queue?.timeControl ?? playerTimeControl
      : botTimeControlValue;
  const whiteClockLabel =
    mode === "player"
      ? match
        ? isWhite
          ? "You (White)"
          : "Opponent (White)"
        : "White"
      : playerColor === "w"
        ? "You (White)"
        : "Bot (White)";
  const blackClockLabel =
    mode === "player"
      ? match
        ? isBlack
          ? "You (Black)"
          : "Opponent (Black)"
        : "Black"
      : playerColor === "b"
        ? "You (Black)"
        : "Bot (Black)";
  const whiteClockTime =
    mode === "player"
      ? formatClock(clocks?.white)
      : playerColor === "w"
        ? formattedPlayerTime
        : formattedBotTime;
  const blackClockTime =
    mode === "player"
      ? formatClock(clocks?.black)
      : playerColor === "b"
        ? formattedPlayerTime
        : formattedBotTime;
  return (
    <div className={outerGridClass}>
      <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0a111f]/80 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70">
            Casual lobby
          </p>
          <p className="text-lg font-semibold">Play while you wait</p>
          <p className="text-sm text-white/60">
            Jump into live matchmade games or practice against the bot with
            feature-rich controls.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              Session
            </p>
            <p className="text-lg font-semibold">
              {mode === "player"
                ? player?.displayName ?? "Connecting..."
                : "Stockfish Bot"}
            </p>
            <p className="text-sm text-white/60">
              {mode === "player"
                ? queue || match
                  ? "Searching for the best match now."
                  : "Select a time control, then press Play now."
                : `You are playing as ${playerColor === "w" ? "White" : "Black"}.`}
            </p>
          </div>
          <div className="text-right text-sm text-white/60">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              {mode === "player"
                ? variant === "mastery"
                  ? "Mastery Path"
                  : "Rating"
                : "Bot level"}
            </p>
            <p className="text-lg font-semibold text-cyan-200">
              {mode === "player"
                ? variant === "mastery"
                  ? "Hidden"
                  : player?.rating ?? 1200
                : botLevel.label}
            </p>
            {mode === "player" && variant === "mastery" ? (
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Matchmaking uses a hidden rating
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1628] p-4 text-sm text-white/70 min-h-[180px]">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Controls
          </p>
          <p className="mt-2 text-white/70">
            {mode === "player"
              ? queue
                ? "Searching for an opponent near your rating..."
                : match
                  ? "Match found. Good luck."
                  : "Select a time control and press Play now to queue."
              : "Configure time control and bot strength, then start a new game."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                <span>Time</span>
                {(["bullet", "blitz", "rapid"] as const).map((group) => (
                  <div key={group} className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {group}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PLAYER_TIME_CONTROLS[group].map((control) => {
                        const selected = activeTimeControlValue === control.value;
                        return (
                          <button
                            key={control.value}
                            type="button"
                            onClick={async () => {
                              if (selected) {
                                return;
                              }
                              if (mode === "player") {
                                if (!canChangeTimeControl) {
                                  return;
                                }
                                setPlayerTimeControl(control.value);
                                if (queue) {
                                  await leaveQueue();
                                }
                                return;
                              }
                              const next = parseTimeControl(control.value);
                              setTimeControl(next);
                              resetGame(botColor, next);
                            }}
                            disabled={mode === "player" ? !canChangeTimeControl : false}
                            className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                              selected
                                ? "border-cyan-300 bg-cyan-400 text-slate-900"
                                : "border-white/20 text-white/70 hover:border-cyan-300/60"
                            } disabled:opacity-60`}
                          >
                            {control.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <label
                className={`flex items-center gap-2 text-xs text-white/70 ${
                  mode === "bot" ? "" : "invisible"
                }`}
              >
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
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {mode === "player" ? (
              match ? (
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80"
                  disabled
                >
                  Match live
                </button>
              ) : queue ? (
                <button
                  type="button"
                  className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm text-cyan-100"
                  onClick={leaveQueue}
                  disabled={actionBusy}
                >
                  Cancel queue
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
                  onClick={() => joinQueue(playerTimeControl)}
                  disabled={actionBusy || !player}
                >
                  Play {formatTimeControl(playerTimeControl)}
                </button>
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => resetGame("b")}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80"
                >
                  Play White
                </button>
                <button
                  type="button"
                  onClick={() => resetGame("w")}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80"
                >
                  Play Black
                </button>
                <button
                  type="button"
                  onClick={() => resetGame(botColor)}
                  className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-900"
                >
                  New Game
                </button>
              </>
            )}
            {mode === "player" ? (
              <>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 invisible"
                  aria-hidden
                >
                  Play White
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 invisible"
                  aria-hidden
                >
                  Play Black
                </button>
              </>
            ) : null}
          </div>
            {mode === "player" && queue ? (
            <p className="mt-2 text-xs text-white/50">
              In queue since {new Date(queue.queuedAt).toLocaleTimeString()} -{" "}
              {formatTimeControl(queue.timeControl)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-white/50 opacity-0">Spacer</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0c1628] p-4 text-sm text-white/70 min-h-[120px]">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">
            Details
          </p>
          {mode === "player" ? (
            <ul className="mt-2 space-y-2 text-xs text-white/60">
              <li>Everyone starts at 1200.</li>
              <li>Matchmaking stays near your rating.</li>
              <li>Ratings update after every game.</li>
            </ul>
          ) : (
            <div className="mt-2 space-y-2 text-xs text-white/60">
              <div className="flex items-center justify-between">
                <span>Player</span>
                <span className="text-cyan-200">{formattedPlayerTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bot</span>
                <span className="text-cyan-200">{formattedBotTime}</span>
              </div>
              <div className="flex items-center justify-between opacity-0">
                <span>Spacer</span>
                <span>00:00</span>
              </div>
            </div>
          )}
        </div>

        {mode === "player" && error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-100">
            {error}
          </div>
        ) : mode === "bot" && engineError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-100">
            {engineError}
          </div>
        ) : (
          <div className="rounded-2xl border border-transparent p-3 text-xs text-transparent">
            Spacer
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0a111f]/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              {mode === "player" ? "Live match" : "Practice match"}
            </p>
            {mode === "player" ? (
              match ? (
                <div className="space-y-1 text-sm text-white/70">
                  <p>
                    {match.white.name} vs {match.black.name} -{" "}
                    {formatTimeControl(match.timeControl)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>
                      White: <span className="text-cyan-200">{formatClock(clocks?.white)}</span>
                    </span>
                    <span>
                      Black: <span className="text-cyan-200">{formatClock(clocks?.black)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    <span>
                      Live feed:{" "}
                      {streamStatus === "connected" ? "Connected" : "Reconnecting"}
                    </span>
                    {streamStatus === "reconnecting" ? (
                      <button
                        type="button"
                        onClick={reconnectNow}
                        className="rounded-full border border-cyan-300/30 px-2 py-1 text-[9px] text-cyan-100"
                      >
                        Reconnect now
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-white/70">
                  <p>Waiting for a match...</p>
                  <p className="text-xs text-white/60">
                    Time control: {formatTimeControl(playerTimeControl)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span>White: <span className="text-cyan-200">--:--</span></span>
                    <span>Black: <span className="text-cyan-200">--:--</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    <span>
                      Live feed:{" "}
                      {streamStatus === "connected" ? "Connected" : "Reconnecting"}
                    </span>
                    {streamStatus === "reconnecting" ? (
                      <button
                        type="button"
                        onClick={reconnectNow}
                        className="rounded-full border border-cyan-300/30 px-2 py-1 text-[9px] text-cyan-100"
                      >
                        Reconnect now
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-1 text-sm text-white/70">
                <p>Bot level: {botLevel.label}</p>
                <p className="text-xs text-white/60">
                  Time control: {timeControl.label}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Live feed: Local
                </p>
              </div>
            )}
          </div>
          <div className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
            {mode === "player"
              ? match
                ? match.status === "COMPLETED"
                  ? `Result: ${match.result ?? "?"}`
                  : isYourTurn
                    ? "Your move"
                    : "Waiting"
                : "Idle"
              : timeoutWinner
                ? `${timeoutWinner === "w" ? "White" : "Black"} wins on time`
                : status}
          </div>
        </div>
        {notice ? (
          <div className="mt-3 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-100">
            {notice}
          </div>
        ) : null}

        <div className={boardGridClass}>
          <div
            ref={boardWrapRef}
            className="relative rounded-2xl border border-white/10 bg-[#0b1426] p-4"
            style={{ margin: "0 auto", maxWidth: `${maxBoardWidth}px` }}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0c1628] px-3 py-2 text-xs text-white/70">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {whiteClockLabel}
                </p>
                <p className="text-sm font-semibold text-cyan-200">
                  {whiteClockTime}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {blackClockLabel}
                </p>
                <p className="text-sm font-semibold text-cyan-200">
                  {blackClockTime}
                </p>
              </div>
            </div>
            <Chessboard
              position={activePosition}
              boardWidth={boardWidth}
              boardOrientation={activeOrientation}
              onPieceDrop={activeOnDrop}
              arePiecesDraggable={activeDraggable}
              showBoardNotation
              customSquareStyles={lastMoveStyles}
              customNotationStyle={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#E2F7FF",
                textShadow: "0 0 3px rgba(0,0,0,0.8)",
              }}
              customDarkSquareStyle={{ backgroundColor: "#1f2a44" }}
              customLightSquareStyle={{ backgroundColor: "#2f3b5a" }}
              customBoardStyle={{
                borderRadius: "12px",
                boxShadow: "0 0 20px rgba(0, 217, 255, 0.15)",
              }}
            />
            {mode === "player" && matchInProgress && playerGame.isCheckmate() ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70 p-6">
                <div className="rounded-2xl border border-cyan-300/30 bg-[#0c1628] px-6 py-4 text-center text-sm text-white/80 shadow-[0_0_35px_rgba(0,217,255,0.2)]">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                    Checkmate
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {isWhite ? "Black wins" : isBlack ? "White wins" : "Game over"}
                  </p>
                </div>
              </div>
            ) : null}
            {mode === "bot" && game.isCheckmate() ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70 p-6">
                <div className="rounded-2xl border border-cyan-300/30 bg-[#0c1628] px-6 py-4 text-center text-sm text-white/80 shadow-[0_0_35px_rgba(0,217,255,0.2)]">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                    Checkmate
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {playerColor === "w" ? "Black wins" : "White wins"}
                  </p>
                </div>
              </div>
            ) : null}
            {mode === "player" && (drawOfferedToYou || takebackOfferedToYou) ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70 p-6">
                <div className="w-full max-w-sm rounded-2xl border border-cyan-300/30 bg-[#0c1628] p-5 text-sm text-white/80 shadow-[0_0_35px_rgba(0,217,255,0.2)]">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                    {drawOfferedToYou ? "Draw offer" : "Take back request"}
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">
                    {drawOfferedToYou
                      ? `${match?.drawOffer?.byName ?? "Opponent"} offered a draw.`
                      : `${match?.takebackOffer?.byName ?? "Opponent"} wants to take back the last move.`}
                  </p>
                  <p className="mt-2 text-xs text-white/60">
                    {drawOfferedToYou
                      ? "Accept to end the game as a draw or decline to keep playing."
                      : "Accept to undo the last move or decline to keep playing."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={drawOfferedToYou ? offerDraw : takeBack}
                      className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900"
                      disabled={actionBusy}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={drawOfferedToYou ? declineDraw : declineTakeback}
                      className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80"
                      disabled={actionBusy}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <span>
                {mode === "player"
                  ? `You are ${isWhite ? "White" : isBlack ? "Black" : "Observer"}`
                  : `You are ${playerColor === "w" ? "White" : "Black"}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={mode === "player" ? takeBack : takeBackBot}
                  className="rounded-full border border-white/20 px-3 py-1 text-white/80"
                  disabled={
                    mode === "player"
                      ? !canTakeBack ||
                        actionBusy ||
                        takebackOfferedByYou ||
                        !matchInProgress
                      : historyCount === 0
                  }
                >
                  {mode === "player" && takebackOfferedByYou
                    ? "Take back sent"
                    : "Take back"}
                </button>
                <button
                  type="button"
                  onClick={mode === "player" ? offerDraw : handleDrawBot}
                  className="rounded-full border border-cyan-300/40 px-3 py-1 text-cyan-100"
                  disabled={
                    actionBusy ||
                    (mode === "player" &&
                      (drawOfferedByYou || !matchInProgress))
                  }
                >
                  {mode === "player" && drawOfferedByYou ? "Draw sent" : "Draw"}
                </button>
                <button
                  type="button"
                  onClick={mode === "player" ? resign : resignBot}
                  className="rounded-full border border-red-400/40 px-3 py-1 text-red-200"
                  disabled={actionBusy || (mode === "player" && !matchInProgress)}
                >
                  Resign
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
              Shortcuts: Left Arrow / Space = Take back, D = Draw, R = Resign
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0b1426] p-4 text-base text-white/70">
            <p className="text-base uppercase tracking-[0.25em] text-white/40">
              Moves
            </p>
            <div className="rounded-xl border border-white/10 bg-[#0c1628] p-3 text-base text-white/70">
              <div className="flex items-center justify-between">
                <span>Stockfish</span>
                <span className="text-sm uppercase tracking-[0.2em] text-white/60">
                  On
                </span>
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
                <div className="mt-1 text-sm text-white/40">
                  Depth {analysis.depth}
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between text-sm text-white/60">
                <span>Move sound</span>
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                    soundEnabled
                      ? "border-cyan-300/40 text-cyan-100"
                      : "border-white/20 text-white/60"
                  }`}
                >
                  {soundEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>
            {movePairs.length ? (
              <div className="space-y-1 text-base">
                {movePairs.slice(-6).map((pair) => (
                  <div
                    key={`pair-${pair.no}`}
                    className="grid grid-cols-[48px_1fr_1fr] items-center gap-2 rounded-lg border border-white/10 bg-[#0c1628] px-2 py-1"
                  >
                    <span className="text-white/50">{pair.no}.</span>
                    <span className="font-mono text-cyan-200">
                      {pair.white || "--"}
                    </span>
                    <span className="font-mono text-cyan-200">
                      {pair.black || "--"}
                    </span>
                  </div>
                ))}
                {movePairs.length > 6 ? (
                  <p className="text-xs text-white/40">
                    Showing last 6 of {movePairs.length} moves.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-base text-white/50">Moves will appear here.</p>
            )}
            <div className="rounded-xl border border-white/10 bg-[#0c1628] p-3 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span>History</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFullHistory((prev) => !prev)}
                    className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
                  >
                    {showFullHistory ? "Hide" : "Show all"}
                  </button>
                  <button
                    type="button"
                    onClick={copyHistory}
                    className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {showFullHistory ? (
                <div className="mt-2 rounded-lg border border-white/10 bg-slate-950/50 p-2 text-[11px] text-white/80">
                  {inlineHistoryText || "No moves yet."}
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-white/50">
                  Full history hidden to keep this view clean.
                </p>
              )}
            </div>
            {(mode === "player" && match?.status === "COMPLETED") ||
            (mode === "bot" && (game.isGameOver() || timeoutWinner)) ? (
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
                {analysisSummary ? (
                  <div className="mt-2 space-y-1 text-[11px] text-white/70">
                    <div className="flex items-center justify-between">
                      <span>Blunders</span>
                      <span className="text-red-300">{analysisSummary.blunders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mistakes</span>
                      <span className="text-orange-300">{analysisSummary.mistakes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inaccuracies</span>
                      <span className="text-yellow-300">{analysisSummary.inaccuracies}</span>
                    </div>
                  </div>
                ) : null}
                {evalSeries.length > 1 ? (
                  <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/40 p-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Eval trend
                    </p>
                    <Sparkline series={evalSeries} />
                  </div>
                ) : null}
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

function materialEval(game: Chess) {
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
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

function buildMaterialEvalSeries(moves: string[]) {
  const game = new Chess();
  const series: number[] = [materialEval(game)];
  for (const move of moves) {
    const result = game.move(move, { sloppy: true });
    if (!result) {
      break;
    }
    series.push(materialEval(game));
  }
  return series;
}

function summarizeMoveQuality(series: number[]) {
  if (series.length < 2) {
    return null;
  }
  let blunders = 0;
  let mistakes = 0;
  let inaccuracies = 0;
  for (let i = 1; i < series.length; i += 1) {
    const before = series[i - 1];
    const after = series[i];
    const moveIndex = i - 1;
    const moverIsWhite = moveIndex % 2 === 0;
    const delta = moverIsWhite ? after - before : before - after;
    if (delta <= -300) {
      blunders += 1;
    } else if (delta <= -150) {
      mistakes += 1;
    } else if (delta <= -50) {
      inaccuracies += 1;
    }
  }
  return { blunders, mistakes, inaccuracies };
}

function Sparkline({ series }: { series: number[] }) {
  const width = 240;
  const height = 40;
  const padding = 4;
  const clamped = series.map((value) => Math.max(-1000, Math.min(1000, value)));
  const min = Math.min(...clamped);
  const max = Math.max(...clamped);
  const range = max - min || 1;
  const step = (width - padding * 2) / Math.max(1, clamped.length - 1);
  const points = clamped
    .map((value, index) => {
      const x = padding + index * step;
      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="rgba(34, 197, 94, 0.8)"
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}
