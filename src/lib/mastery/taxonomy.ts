export type MasteryCategorySeed = {
  key: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type MasterySkillSeed = {
  key: string;
  categoryKey: string;
  name: string;
  description: string;
  sortOrder: number;
};

export const MASTERY_CATEGORIES: MasteryCategorySeed[] = [
  {
    key: "opening",
    name: "Opening Principles",
    description: "Foundation skills in the first 10-15 moves.",
    sortOrder: 1,
  },
  {
    key: "tactics",
    name: "Tactical Vision",
    description: "Pattern recognition and calculation.",
    sortOrder: 2,
  },
  {
    key: "positional",
    name: "Positional Understanding",
    description: "Strategic concepts that shape the middlegame.",
    sortOrder: 3,
  },
  {
    key: "endgame",
    name: "Endgame Technique",
    description: "Converting advantages and saving tough endings.",
    sortOrder: 4,
  },
  {
    key: "strategy",
    name: "Strategic Planning",
    description: "Long-term planning and phase transitions.",
    sortOrder: 5,
  },
  {
    key: "practical",
    name: "Practical Skills",
    description: "Real-world skills for decision making.",
    sortOrder: 6,
  },
];

export const MASTERY_SKILLS: MasterySkillSeed[] = [
  {
    key: "opening_center_control",
    categoryKey: "opening",
    name: "Control of the Center",
    description: "Claiming and influencing central squares early.",
    sortOrder: 1,
  },
  {
    key: "opening_development",
    categoryKey: "opening",
    name: "Piece Development",
    description: "Developing minor pieces efficiently.",
    sortOrder: 2,
  },
  {
    key: "opening_king_safety",
    categoryKey: "opening",
    name: "King Safety",
    description: "Castling and avoiding early king exposure.",
    sortOrder: 3,
  },
  {
    key: "opening_tempo",
    categoryKey: "opening",
    name: "Tempo & Initiative",
    description: "Gaining time with forcing moves.",
    sortOrder: 4,
  },
  {
    key: "opening_queen_restraint",
    categoryKey: "opening",
    name: "Queen Discipline",
    description: "Avoiding premature queen adventures.",
    sortOrder: 5,
  },
  {
    key: "opening_structure",
    categoryKey: "opening",
    name: "Opening Structure",
    description: "Healthy pawn setup and development.",
    sortOrder: 6,
  },
  {
    key: "tactic_forks",
    categoryKey: "tactics",
    name: "Fork Recognition",
    description: "Spotting multi-attack opportunities.",
    sortOrder: 1,
  },
  {
    key: "tactic_pins",
    categoryKey: "tactics",
    name: "Pin Mastery",
    description: "Creating and exploiting pins.",
    sortOrder: 2,
  },
  {
    key: "tactic_skewers",
    categoryKey: "tactics",
    name: "Skewer Tactics",
    description: "Driving pieces off to win material.",
    sortOrder: 3,
  },
  {
    key: "tactic_discovered",
    categoryKey: "tactics",
    name: "Discovered Attacks",
    description: "Uncovering lines and hidden threats.",
    sortOrder: 4,
  },
  {
    key: "tactic_calculation",
    categoryKey: "tactics",
    name: "Calculation Accuracy",
    description: "Choosing precise tactical continuations.",
    sortOrder: 5,
  },
  {
    key: "tactic_sacrifice",
    categoryKey: "tactics",
    name: "Sacrifice Sense",
    description: "Evaluating material investment.",
    sortOrder: 6,
  },
  {
    key: "positional_pawn_structure",
    categoryKey: "positional",
    name: "Pawn Structure",
    description: "Maintaining healthy pawn formations.",
    sortOrder: 1,
  },
  {
    key: "positional_activity",
    categoryKey: "positional",
    name: "Piece Activity",
    description: "Placing pieces on active squares.",
    sortOrder: 2,
  },
  {
    key: "positional_outposts",
    categoryKey: "positional",
    name: "Outposts & Weak Squares",
    description: "Occupying and creating strong squares.",
    sortOrder: 3,
  },
  {
    key: "positional_space",
    categoryKey: "positional",
    name: "Space Advantage",
    description: "Gaining territory and restricting the opponent.",
    sortOrder: 4,
  },
  {
    key: "positional_prophylaxis",
    categoryKey: "positional",
    name: "Prophylaxis",
    description: "Preventing opponent counterplay.",
    sortOrder: 5,
  },
  {
    key: "positional_exchange",
    categoryKey: "positional",
    name: "Exchange Decisions",
    description: "Trading pieces at the right time.",
    sortOrder: 6,
  },
  {
    key: "endgame_pawn",
    categoryKey: "endgame",
    name: "King & Pawn Endings",
    description: "Promoting and stopping passed pawns.",
    sortOrder: 1,
  },
  {
    key: "endgame_rook",
    categoryKey: "endgame",
    name: "Rook Endgames",
    description: "Activity, checks, and cutting the king.",
    sortOrder: 2,
  },
  {
    key: "endgame_minor",
    categoryKey: "endgame",
    name: "Minor Piece Endings",
    description: "Bishop vs knight technique.",
    sortOrder: 3,
  },
  {
    key: "endgame_queen",
    categoryKey: "endgame",
    name: "Queen Endgames",
    description: "Perpetuals, checks, and king safety.",
    sortOrder: 4,
  },
  {
    key: "endgame_conversion",
    categoryKey: "endgame",
    name: "Conversion Technique",
    description: "Turning small advantages into wins.",
    sortOrder: 5,
  },
  {
    key: "endgame_defense",
    categoryKey: "endgame",
    name: "Defensive Endgames",
    description: "Holding worse positions.",
    sortOrder: 6,
  },
  {
    key: "strategy_plans",
    categoryKey: "strategy",
    name: "Plan Formation",
    description: "Building a coherent middlegame plan.",
    sortOrder: 1,
  },
  {
    key: "strategy_transitions",
    categoryKey: "strategy",
    name: "Phase Transitions",
    description: "Timing the shift between phases.",
    sortOrder: 2,
  },
  {
    key: "strategy_coordination",
    categoryKey: "strategy",
    name: "Piece Coordination",
    description: "Harmonizing pieces for attack or defense.",
    sortOrder: 3,
  },
  {
    key: "strategy_weaknesses",
    categoryKey: "strategy",
    name: "Exploiting Weaknesses",
    description: "Targeting weak pawns and squares.",
    sortOrder: 4,
  },
  {
    key: "strategy_initiative",
    categoryKey: "strategy",
    name: "Initiative Management",
    description: "Keeping pressure and forcing responses.",
    sortOrder: 5,
  },
  {
    key: "strategy_simplify",
    categoryKey: "strategy",
    name: "Simplification",
    description: "Trading to improve the position.",
    sortOrder: 6,
  },
  {
    key: "practical_resilience",
    categoryKey: "practical",
    name: "Resilience",
    description: "Recovering after setbacks.",
    sortOrder: 1,
  },
  {
    key: "practical_accuracy",
    categoryKey: "practical",
    name: "Decision Accuracy",
    description: "Reducing major mistakes.",
    sortOrder: 2,
  },
  {
    key: "practical_conversion",
    categoryKey: "practical",
    name: "Winning Technique",
    description: "Converting winning positions.",
    sortOrder: 3,
  },
  {
    key: "practical_defense",
    categoryKey: "practical",
    name: "Practical Defense",
    description: "Holding difficult positions.",
    sortOrder: 4,
  },
  {
    key: "practical_time",
    categoryKey: "practical",
    name: "Time Awareness",
    description: "Playing efficiently under time pressure.",
    sortOrder: 5,
  },
  {
    key: "practical_focus",
    categoryKey: "practical",
    name: "Focus & Discipline",
    description: "Avoiding impulsive moves.",
    sortOrder: 6,
  },
];

export function xpForLevel(level: number) {
  return 120 + level * 60;
}

export function levelFromXp(xp: number, maxLevel = 10) {
  let level = 0;
  let remaining = xp;
  while (level < maxLevel) {
    const needed = xpForLevel(level);
    if (remaining < needed) {
      break;
    }
    remaining -= needed;
    level += 1;
  }
  return { level, progress: remaining, needed: xpForLevel(level) };
}
