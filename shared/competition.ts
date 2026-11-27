export type MembershipTier = "free" | "regular" | "vip";

/**
 * Pure policy helper only. The caller must supply server-validated listened
 * seconds; a browser/client progress value is not proof of listening.
 */
export function isListenQualified(listenedSeconds: number, durationSeconds: number): boolean {
  if (!Number.isFinite(listenedSeconds) || !Number.isFinite(durationSeconds)) return false;
  if (durationSeconds <= 0 || listenedSeconds < 0 || listenedSeconds > durationSeconds) return false;
  return listenedSeconds >= Math.ceil(durationSeconds * 0.5);
}

/** Competitor participation quota. Free members can still cast eligible votes. */
export function requiredCompetitorVotes(tier: string, cycleNumber: number): number {
  if (tier !== "regular" && tier !== "vip") return 0;
  if (Number.isInteger(cycleNumber) && cycleNumber > 0 && cycleNumber % 3 === 0) return 1;
  return tier === "vip" ? 3 : 5;
}

/** Both competitors must independently meet the same 50% listen threshold. */
export function isBattleListenQualified(
  sideAListenedSeconds: number,
  sideADurationSeconds: number,
  sideBListenedSeconds: number,
  sideBDurationSeconds: number,
): boolean {
  return isListenQualified(sideAListenedSeconds, sideADurationSeconds)
    && isListenQualified(sideBListenedSeconds, sideBDurationSeconds);
}
