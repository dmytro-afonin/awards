export function formatMemberCount(count: number): string {
  return `${count} ${count === 1 ? "member" : "members"}`;
}

export function formatVoteCount(count: number): string {
  return `${count} ${count === 1 ? "vote" : "votes"}`;
}

export function formatVotePercent(percent: number): string {
  return `${percent}%`;
}

/** Muted participation line: members · votes (percent). */
export function formatCampaignVoteStats(
  memberCount: number,
  voteCount: number,
  votePercent: number,
): string {
  return `${formatMemberCount(memberCount)} · ${formatVoteCount(voteCount)} (${formatVotePercent(votePercent)})`;
}
