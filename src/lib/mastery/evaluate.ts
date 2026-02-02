import { Chess, Move } from "chess.js";
import { prisma } from "@/lib/db";
import { ensureMasterySeeded } from "@/lib/mastery/seed";
import { levelFromXp } from "@/lib/mastery/taxonomy";

type SkillScore = {
  xp: number;
  notes: string[];
};

type PlayerStats = {
  centerMoves: number;
  minorDeveloped: number;
  castled: boolean;
  earlyQueenMoves: number;
  checks: number;
  captures: number;
  forks: number;
  pins: number;
  skewers: number;
  discoveredChecks: number;
  sacrifices: number;
  doubledPawns: number;
  spacePawns: number;
  activePieces: number;
  outposts: number;
  tradesWhenAhead: number;
  pawnCaptures: number;
  initiativeMoves: number;
  planStreaks: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  resilience: boolean;
  endgameReached: boolean;
  endgameWin: boolean;
  endgameHold: boolean;
  conversion: boolean;
};

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const CENTER_SQUARES = new Set(["d4", "e4", "d5", "e5"]);

function materialScore(game: Chess) {
  let score = 0;
  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }
      const value = PIECE_VALUES[piece.type] ?? 0;
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

function materialCount(game: Chess) {
  let total = 0;
  for (const row of game.board()) {
    for (const piece of row) {
      if (!piece) {
        continue;
      }
      total += PIECE_VALUES[piece.type] ?? 0;
    }
  }
  return total;
}

function squareToCoords(square: string) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1] ?? "1", 10) - 1;
  return { file, rank };
}

function coordsToSquare(file: number, rank: number) {
  return `${String.fromCharCode("a".charCodeAt(0) + file)}${rank + 1}`;
}

function indexToSquare(fileIndex: number, rankIndex: number) {
  const rank = 8 - rankIndex;
  return `${String.fromCharCode("a".charCodeAt(0) + fileIndex)}${rank}`;
}

function inBounds(file: number, rank: number) {
  return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

function getRaySquares(from: string, to: string) {
  const start = squareToCoords(from);
  const end = squareToCoords(to);
  const df = Math.sign(end.file - start.file);
  const dr = Math.sign(end.rank - start.rank);
  if (df === 0 && dr === 0) {
    return [];
  }
  if (df !== 0 && dr !== 0 && Math.abs(end.file - start.file) !== Math.abs(end.rank - start.rank)) {
    return [];
  }
  const squares: string[] = [];
  let f = start.file + df;
  let r = start.rank + dr;
  while (inBounds(f, r)) {
    const sq = coordsToSquare(f, r);
    squares.push(sq);
    if (sq === to) {
      break;
    }
    f += df;
    r += dr;
  }
  return squares;
}

function isPin(game: Chess, move: Move, moverColor: "w" | "b") {
  if (!["b", "r", "q"].includes(move.piece)) {
    return false;
  }
  const kingSquare = findKingSquare(game, moverColor === "w" ? "b" : "w");
  if (!kingSquare) {
    return false;
  }
  const ray = getRaySquares(move.to, kingSquare);
  if (!ray.length) {
    return false;
  }
  let blocking: string | null = null;
  for (const square of ray) {
    if (square === move.to) {
      continue;
    }
    const piece = game.get(square);
    if (!piece) {
      continue;
    }
    if (square === kingSquare) {
      break;
    }
    if (blocking) {
      return false;
    }
    if (piece.color === moverColor) {
      return false;
    }
    blocking = square;
  }
  return Boolean(blocking);
}

function isSkewer(game: Chess, move: Move, moverColor: "w" | "b") {
  if (!["b", "r", "q"].includes(move.piece)) {
    return false;
  }
  const kingSquare = findKingSquare(game, moverColor === "w" ? "b" : "w");
  if (!kingSquare) {
    return false;
  }
  const ray = getRaySquares(move.to, kingSquare);
  if (!ray.length) {
    return false;
  }
  let blocking = false;
  for (const square of ray) {
    if (square === move.to) {
      continue;
    }
    const piece = game.get(square);
    if (!piece) {
      continue;
    }
    if (square === kingSquare) {
      break;
    }
    if (piece.color === moverColor) {
      return false;
    }
    blocking = true;
    break;
  }
  if (blocking) {
    return false;
  }
  const from = squareToCoords(move.to);
  const to = squareToCoords(kingSquare);
  const df = Math.sign(to.file - from.file);
  const dr = Math.sign(to.rank - from.rank);
  let f = to.file + df;
  let r = to.rank + dr;
  while (inBounds(f, r)) {
    const square = coordsToSquare(f, r);
    const piece = game.get(square);
    if (piece && piece.color !== moverColor) {
      return true;
    }
    if (piece) {
      break;
    }
    f += df;
    r += dr;
  }
  return false;
}

function findKingSquare(game: Chess, color: "w" | "b") {
  const board = game.board();
  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    const row = board[rankIndex] ?? [];
    for (let fileIndex = 0; fileIndex < row.length; fileIndex += 1) {
      const piece = row[fileIndex];
      if (piece && piece.type === "k" && piece.color === color) {
        return indexToSquare(fileIndex, rankIndex);
      }
    }
  }
  return null;
}

function countForkTargets(game: Chess, square: string, moverColor: "w" | "b") {
  const moves = game.moves({ square, verbose: true }) as Move[];
  let targets = 0;
  for (const move of moves) {
    if (!move.captured) {
      continue;
    }
    const value = PIECE_VALUES[move.captured] ?? 0;
    if (value >= 300 || move.captured === "k") {
      targets += 1;
    }
  }
  return targets;
}

function pawnAttacksSquare(game: Chess, square: string, color: "w" | "b") {
  const { file, rank } = squareToCoords(square);
  const direction = color === "w" ? 1 : -1;
  const attackRanks = rank - direction;
  for (const df of [-1, 1]) {
    const f = file + df;
    if (!inBounds(f, attackRanks)) {
      continue;
    }
    const piece = game.get(coordsToSquare(f, attackRanks));
    if (piece && piece.type === "p" && piece.color === color) {
      return true;
    }
  }
  return false;
}

function countDoubledPawns(game: Chess, color: "w" | "b") {
  const files = new Array(8).fill(0);
  const board = game.board();
  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    const row = board[rankIndex] ?? [];
    for (let fileIndex = 0; fileIndex < row.length; fileIndex += 1) {
      const piece = row[fileIndex];
      if (piece && piece.type === "p" && piece.color === color) {
        files[fileIndex] += 1;
      }
    }
  }
  return files.filter((count) => count > 1).length;
}

function countSpacePawns(game: Chess, color: "w" | "b") {
  let count = 0;
  const board = game.board();
  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    const row = board[rankIndex] ?? [];
    for (let fileIndex = 0; fileIndex < row.length; fileIndex += 1) {
      const piece = row[fileIndex];
      if (!piece || piece.type !== "p" || piece.color !== color) {
        continue;
      }
      const rank = 8 - rankIndex;
      if (color === "w" ? rank >= 4 : rank <= 5) {
        count += 1;
      }
    }
  }
  return count;
}

function countActivePieces(game: Chess, color: "w" | "b") {
  let count = 0;
  const board = game.board();
  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    const row = board[rankIndex] ?? [];
    for (let fileIndex = 0; fileIndex < row.length; fileIndex += 1) {
      const piece = row[fileIndex];
      if (!piece || piece.color !== color || piece.type === "p") {
        continue;
      }
      const rank = 8 - rankIndex;
      if (color === "w" ? rank >= 5 : rank <= 4) {
        count += 1;
      }
    }
  }
  return count;
}

function isOutpost(game: Chess, move: Move, color: "w" | "b") {
  if (move.piece !== "n") {
    return false;
  }
  if (pawnAttacksSquare(game, move.to, color === "w" ? "b" : "w")) {
    return false;
  }
  return pawnAttacksSquare(game, move.to, color);
}

function buildStats(moves: string[], playerColor: "w" | "b") {
  const game = new Chess();
  const stats: PlayerStats = {
    centerMoves: 0,
    minorDeveloped: 0,
    castled: false,
    earlyQueenMoves: 0,
    checks: 0,
    captures: 0,
    forks: 0,
    pins: 0,
    skewers: 0,
    discoveredChecks: 0,
    sacrifices: 0,
    doubledPawns: 0,
    spacePawns: 0,
    activePieces: 0,
    outposts: 0,
    tradesWhenAhead: 0,
    pawnCaptures: 0,
    initiativeMoves: 0,
    planStreaks: 0,
    blunders: 0,
    mistakes: 0,
    inaccuracies: 0,
    resilience: false,
    endgameReached: false,
    endgameWin: false,
    endgameHold: false,
    conversion: false,
  };

  const evalSeries: number[] = [materialScore(game)];
  const wingMoves: ("kingside" | "queenside" | "center")[] = [];
  let sacrificesWindow: number[] = [];

  for (let ply = 0; ply < moves.length; ply += 1) {
    const beforeEval = materialScore(game);
    const beforePieceCount = materialCount(game);
    const move = game.move(moves[ply] ?? "", { sloppy: true });
    if (!move) {
      break;
    }
    const afterEval = materialScore(game);
    evalSeries.push(afterEval);

    const mover = move.color;
    const moveIndex = ply + 1;
    const isPlayerMove = mover === playerColor;

    if (isPlayerMove) {
      if (CENTER_SQUARES.has(move.to)) {
        stats.centerMoves += 1;
      }
      if (["n", "b"].includes(move.piece)) {
        const rank = parseInt(move.from[1] ?? "1", 10);
        if ((playerColor === "w" && rank === 1) || (playerColor === "b" && rank === 8)) {
          stats.minorDeveloped += 1;
        }
      }
      if (move.flags.includes("k") || move.flags.includes("q")) {
        stats.castled = true;
      }
      if (move.piece === "q" && moveIndex <= 8) {
        stats.earlyQueenMoves += 1;
      }
      if (move.san.includes("+")) {
        stats.checks += 1;
      }
      if (move.captured) {
        stats.captures += 1;
        if (move.captured === "p") {
          stats.pawnCaptures += 1;
        }
      }
      if (countForkTargets(game, move.to, playerColor) >= 2) {
        stats.forks += 1;
      }
      if (isPin(game, move, playerColor)) {
        stats.pins += 1;
      }
      if (isSkewer(game, move, playerColor)) {
        stats.skewers += 1;
      }
      if (game.isCheck() && move.piece !== "q" && move.piece !== "r" && move.piece !== "b") {
        stats.discoveredChecks += 1;
      }
      if (isOutpost(game, move, playerColor)) {
        stats.outposts += 1;
      }

      const delta = playerColor === "w" ? afterEval - beforeEval : beforeEval - afterEval;
      if (delta <= -300) {
        stats.blunders += 1;
      } else if (delta <= -150) {
        stats.mistakes += 1;
      } else if (delta <= -50) {
        stats.inaccuracies += 1;
      }

      if (delta <= -300) {
        sacrificesWindow.push(ply);
      }
      sacrificesWindow = sacrificesWindow.filter((idx) => ply - idx <= 4);
      if (delta >= 300 && sacrificesWindow.length) {
        stats.sacrifices += 1;
        sacrificesWindow = [];
      }

      const file = move.to.charCodeAt(0) - 97;
      if (file <= 2) {
        wingMoves.push("queenside");
      } else if (file >= 5) {
        wingMoves.push("kingside");
      } else {
        wingMoves.push("center");
      }
      const lastThree = wingMoves.slice(-3);
      if (lastThree.length === 3 && new Set(lastThree).size === 1) {
        stats.planStreaks += 1;
      }

      if (move.san.includes("+") || move.captured) {
        stats.initiativeMoves += 1;
      }
    }

    const afterPieceCount = materialCount(game);
    if (isPlayerMove && beforePieceCount > afterPieceCount) {
      const advantage = playerColor === "w" ? beforeEval : -beforeEval;
      if (advantage > 150) {
        stats.tradesWhenAhead += 1;
      }
    }
  }

  stats.doubledPawns = countDoubledPawns(game, playerColor);
  stats.spacePawns = countSpacePawns(game, playerColor);
  stats.activePieces = countActivePieces(game, playerColor);

  const totalMaterial = materialCount(game);
  if (totalMaterial <= 2400) {
    stats.endgameReached = true;
  }

  const finalEval = evalSeries[evalSeries.length - 1] ?? 0;
  const perspectiveEval = playerColor === "w" ? finalEval : -finalEval;
  if (stats.endgameReached) {
    if (perspectiveEval > 200) {
      stats.endgameWin = true;
      stats.conversion = true;
    } else if (perspectiveEval > -150) {
      stats.endgameHold = true;
    }
  }

  const minEval = Math.min(...evalSeries.map((value) => (playerColor === "w" ? value : -value)));
  if (minEval <= -300 && perspectiveEval >= 0) {
    stats.resilience = true;
  }

  return stats;
}

function scoresFromStats(stats: PlayerStats) {
  const scores: Record<string, SkillScore> = {};
  const add = (key: string, xp: number, note: string) => {
    if (!scores[key]) {
      scores[key] = { xp: 0, notes: [] };
    }
    scores[key].xp += xp;
    if (note) {
      scores[key].notes.push(note);
    }
  };

  add("opening_center_control", 4 + stats.centerMoves * 2, "Center influence");
  add("opening_development", 4 + stats.minorDeveloped * 3, "Early development");
  add("opening_king_safety", stats.castled ? 10 : 4, stats.castled ? "Castled" : "Castling delayed");
  add("opening_tempo", 4 + stats.checks + stats.captures, "Forcing moves");
  add(
    "opening_queen_restraint",
    stats.earlyQueenMoves === 0 ? 9 : 4,
    stats.earlyQueenMoves === 0 ? "Queen stayed patient" : "Early queen move",
  );
  add(
    "opening_structure",
    stats.doubledPawns === 0 ? 8 : 4,
    stats.doubledPawns === 0 ? "Healthy structure" : "Doubled pawns",
  );

  add("tactic_forks", 4 + stats.forks * 4, "Fork opportunities");
  add("tactic_pins", 4 + stats.pins * 3, "Pins created");
  add("tactic_skewers", 4 + stats.skewers * 3, "Skewers created");
  add(
    "tactic_discovered",
    4 + stats.discoveredChecks * 3,
    "Discovered attacks",
  );
  add(
    "tactic_calculation",
    Math.max(4, 10 - stats.blunders * 3 - stats.mistakes * 2 - stats.inaccuracies),
    "Tactical precision",
  );
  add("tactic_sacrifice", 4 + stats.sacrifices * 4, "Sacrifices");

  add(
    "positional_pawn_structure",
    stats.doubledPawns <= 1 ? 8 : 4,
    "Pawn structure",
  );
  add(
    "positional_activity",
    4 + Math.min(6, stats.activePieces * 2),
    "Piece activity",
  );
  add("positional_outposts", 4 + stats.outposts * 3, "Outposts");
  add("positional_space", 4 + Math.min(6, stats.spacePawns * 2), "Space");
  add(
    "positional_prophylaxis",
    4 + Math.min(6, stats.planStreaks * 2),
    "Preventive play",
  );
  add(
    "positional_exchange",
    4 + Math.min(6, stats.tradesWhenAhead * 2),
    "Exchange decisions",
  );

  add(
    "endgame_pawn",
    stats.endgameReached ? 6 + (stats.endgameWin ? 6 : 0) : 3,
    "King and pawn ending",
  );
  add(
    "endgame_rook",
    stats.endgameReached ? 5 + (stats.endgameWin ? 5 : 0) : 3,
    "Rook ending",
  );
  add(
    "endgame_minor",
    stats.endgameReached ? 5 + (stats.endgameHold ? 4 : 0) : 3,
    "Minor piece ending",
  );
  add(
    "endgame_queen",
    stats.endgameReached ? 4 + (stats.endgameHold ? 4 : 0) : 3,
    "Queen ending",
  );
  add(
    "endgame_conversion",
    stats.conversion ? 10 : 4,
    "Conversion technique",
  );
  add(
    "endgame_defense",
    stats.endgameHold ? 8 : 4,
    "Defensive endgame",
  );

  add(
    "strategy_plans",
    4 + Math.min(6, stats.planStreaks * 2),
    "Planning",
  );
  add(
    "strategy_transitions",
    4 + Math.min(6, stats.tradesWhenAhead * 2),
    "Transitions",
  );
  add(
    "strategy_coordination",
    4 + Math.min(6, stats.activePieces * 2),
    "Coordination",
  );
  add(
    "strategy_weaknesses",
    4 + Math.min(6, stats.pawnCaptures * 2),
    "Targeting weaknesses",
  );
  add(
    "strategy_initiative",
    4 + Math.min(6, stats.initiativeMoves * 2),
    "Initiative",
  );
  add(
    "strategy_simplify",
    4 + Math.min(6, stats.tradesWhenAhead * 2),
    "Simplification",
  );

  add(
    "practical_resilience",
    stats.resilience ? 10 : 4,
    "Resilience",
  );
  add(
    "practical_accuracy",
    Math.max(4, 10 - stats.blunders * 2 - stats.mistakes),
    "Accuracy",
  );
  add(
    "practical_conversion",
    stats.conversion ? 10 : 4,
    "Winning technique",
  );
  add(
    "practical_defense",
    stats.endgameHold ? 8 : 4,
    "Defense",
  );
  add(
    "practical_time",
    4 + Math.min(6, stats.initiativeMoves),
    "Time awareness",
  );
  add(
    "practical_focus",
    Math.max(4, 10 - stats.blunders * 3),
    "Focus",
  );

  return scores;
}

function buildFeedback(playerName: string, strengths: string[], weaknesses: string[]) {
  const strengthLine = strengths.length
    ? `Your ${strengths[0]} stood out today.`
    : "You showed solid focus today.";
  const weaknessLine = weaknesses.length
    ? `Let’s focus next on ${weaknesses[0]}.`
    : "Keep building consistency in your core skills.";
  return `${playerName}, ${strengthLine} ${weaknessLine}`;
}

export async function evaluateMasteryForMatch(matchId: string) {
  await ensureMasterySeeded();

  const match = await prisma.casualMatch.findUnique({
    where: { id: matchId },
    include: {
      moves: { orderBy: { ply: "asc" } },
      playerWhite: true,
      playerBlack: true,
    },
  });

  if (!match || match.masteryEvaluatedAt) {
    return;
  }

  const moves = match.moves.map((move) => move.san);
  const whiteStats = buildStats(moves, "w");
  const blackStats = buildStats(moves, "b");

  const skills = await prisma.masterySkill.findMany();
  const skillsByKey = new Map(skills.map((skill) => [skill.key, skill]));

  const processPlayer = async (
    tx: typeof prisma,
    playerId: string,
    stats: PlayerStats,
    playerName: string,
  ) => {
    const scoreMap = scoresFromStats(stats);
    const existing = await tx.masteryPlayerSkill.findMany({
      where: { playerId },
    });
    const existingMap = new Map(existing.map((row) => [row.skillId, row]));

    const strengths: Array<{ key: string; xp: number }> = [];
    const weaknesses: Array<{ key: string; xp: number }> = [];

    for (const [key, score] of Object.entries(scoreMap)) {
      const skill = skillsByKey.get(key);
      if (!skill) {
        continue;
      }
      const current = existingMap.get(skill.id);
      const deltaXp = Math.max(2, Math.round(score.xp));
      const totalXp = (current?.xp ?? 0) + deltaXp;
      const levelState = levelFromXp(totalXp, skill.maxLevel);

      if (current) {
        await tx.masteryPlayerSkill.update({
          where: { id: current.id },
          data: {
            xp: totalXp,
            level: levelState.level,
            lastLeveledAt:
              levelState.level > current.level ? new Date() : current.lastLeveledAt,
          },
        });
      } else {
        await tx.masteryPlayerSkill.create({
          data: {
            playerId,
            skillId: skill.id,
            xp: totalXp,
            level: levelState.level,
            lastLeveledAt: levelState.level > 0 ? new Date() : null,
          },
        });
      }

      await tx.masteryGameEvent.create({
        data: {
          matchId,
          playerId,
          skillId: skill.id,
          deltaXp,
          notes: score.notes.join("; "),
        },
      });

      strengths.push({ key: skill.name, xp: deltaXp });
      weaknesses.push({ key: skill.name, xp: deltaXp });
    }

    strengths.sort((a, b) => b.xp - a.xp);
    weaknesses.sort((a, b) => a.xp - b.xp);
    const topStrengths = strengths.slice(0, 3).map((item) => item.key);
    const topWeaknesses = weaknesses.slice(0, 3).map((item) => item.key);
    const summary = buildFeedback(playerName, topStrengths, topWeaknesses);

    await tx.masteryFeedback.create({
      data: {
        matchId,
        playerId,
        summary,
        strengths: topStrengths,
        weaknesses: topWeaknesses,
        recommendations: topWeaknesses,
      },
    });
  };

  await prisma.$transaction(async (tx) => {
    await processPlayer(
      tx,
      match.playerWhiteId,
      whiteStats,
      match.playerWhite.displayName,
    );
    await processPlayer(
      tx,
      match.playerBlackId,
      blackStats,
      match.playerBlack.displayName,
    );
    await tx.casualMatch.update({
      where: { id: matchId },
      data: { masteryEvaluatedAt: new Date() },
    });
  });
}
