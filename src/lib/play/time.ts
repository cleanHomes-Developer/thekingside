type TimeControl = {
  minutes: number;
  increment: number;
};

type MoveLike = {
  createdAt: Date;
};

export function parseTimeControl(value: string | null | undefined): TimeControl {
  if (!value) {
    return { minutes: 3, increment: 0 };
  }
  const [minutesRaw, incrementRaw] = value.split("+");
  const minutes = Number(minutesRaw);
  const increment = Number(incrementRaw);
  return {
    minutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 3,
    increment: Number.isFinite(increment) && increment >= 0 ? increment : 0,
  };
}

export function computeRemainingTimes(
  startedAt: Date,
  moves: MoveLike[],
  timeControl: string | null,
  now: Date,
) {
  const control = parseTimeControl(timeControl);
  let whiteMs = control.minutes * 60 * 1000;
  let blackMs = control.minutes * 60 * 1000;
  let lastTime = startedAt.getTime();
  let turn: "w" | "b" = "w";

  for (const move of moves) {
    const moveTime = move.createdAt.getTime();
    const elapsed = Math.max(0, moveTime - lastTime);
    if (turn === "w") {
      whiteMs = Math.max(0, whiteMs - elapsed);
      whiteMs += control.increment * 1000;
    } else {
      blackMs = Math.max(0, blackMs - elapsed);
      blackMs += control.increment * 1000;
    }
    lastTime = moveTime;
    turn = turn === "w" ? "b" : "w";
  }

  const elapsedNow = Math.max(0, now.getTime() - lastTime);
  if (turn === "w") {
    whiteMs = Math.max(0, whiteMs - elapsedNow);
  } else {
    blackMs = Math.max(0, blackMs - elapsedNow);
  }

  return { whiteMs, blackMs, turn, control };
}

