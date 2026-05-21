export type CategoryRunStatus =
  | "voting_open"
  | "voting_closed"
  | "winner_revealed";

export type MockNominee = {
  id: string;
  name: string;
  voteCount: number;
};

export type MockCategory = {
  id: string;
  name: string;
  sortOrder: number;
  status: CategoryRunStatus;
  /** Set when voting closes; public reveal is a separate step */
  winnerNomineeId?: string;
  nominees: MockNominee[];
};

export const MOCK_CAMPAIGN = {
  name: "Studio Awards 2026",
  lifecycle: "vote_live" as const,
};

export const INITIAL_CATEGORIES: MockCategory[] = [
  {
    id: "cat-1",
    name: "Best Cinematography",
    sortOrder: 0,
    status: "voting_open",
    nominees: [
      { id: "n-1a", name: "Northern Lights", voteCount: 142 },
      { id: "n-1b", name: "Glass Harbor", voteCount: 118 },
      { id: "n-1c", name: "Midnight Run", voteCount: 89 },
    ],
  },
  {
    id: "cat-2",
    name: "Best Original Score",
    sortOrder: 1,
    status: "voting_open",
    nominees: [
      { id: "n-2a", name: "Echo Chamber", voteCount: 201 },
      { id: "n-2b", name: "River Suite", voteCount: 187 },
    ],
  },
  {
    id: "cat-3",
    name: "Best Lead Actor",
    sortOrder: 2,
    status: "voting_open",
    nominees: [
      { id: "n-3a", name: "Alex Mercer", voteCount: 310 },
      { id: "n-3b", name: "Jordan Hale", voteCount: 298 },
      { id: "n-3c", name: "Sam Okonkwo", voteCount: 156 },
    ],
  },
  {
    id: "cat-4",
    name: "Best Lead Actress",
    sortOrder: 3,
    status: "voting_open",
    nominees: [
      { id: "n-4a", name: "Mira Chen", voteCount: 276 },
      { id: "n-4b", name: "Elena Voss", voteCount: 264 },
    ],
  },
  {
    id: "cat-5",
    name: "Best Ensemble",
    sortOrder: 4,
    status: "voting_open",
    nominees: [
      { id: "n-5a", name: "The Last Signal", voteCount: 188 },
      { id: "n-5b", name: "City of Wire", voteCount: 175 },
      { id: "n-5c", name: "Open Water", voteCount: 92 },
    ],
  },
  {
    id: "cat-6",
    name: "Best Director",
    sortOrder: 5,
    status: "voting_open",
    nominees: [
      { id: "n-6a", name: "R. Nakamura", voteCount: 245 },
      { id: "n-6b", name: "T. Alvarez", voteCount: 231 },
    ],
  },
  {
    id: "cat-7",
    name: "Best Picture",
    sortOrder: 6,
    status: "voting_open",
    nominees: [
      { id: "n-7a", name: "Afterglow", voteCount: 402 },
      { id: "n-7b", name: "Static Bloom", voteCount: 389 },
      { id: "n-7c", name: "Paper Comet", voteCount: 201 },
    ],
  },
  {
    id: "cat-8",
    name: "Audience Choice",
    sortOrder: 7,
    status: "voting_open",
    nominees: [
      { id: "n-8a", name: "Fan Favorite A", voteCount: 512 },
      { id: "n-8b", name: "Fan Favorite B", voteCount: 498 },
    ],
  },
];

export function pickAutoWinner(
  category: MockCategory,
): MockNominee | undefined {
  if (category.nominees.length === 0) return undefined;
  return [...category.nominees].sort((a, b) => b.voteCount - a.voteCount)[0];
}

export function getNominee(
  category: MockCategory,
  nomineeId: string,
): MockNominee | undefined {
  return category.nominees.find((n) => n.id === nomineeId);
}

export function categoryStatusLabel(status: CategoryRunStatus): string {
  switch (status) {
    case "voting_open":
      return "Voting open";
    case "voting_closed":
      return "Voting closed";
    case "winner_revealed":
      return "Winner revealed";
  }
}
