"use client";

import { RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { categoryStatusLabel } from "@/components/campaign-run-prototype/campaign-run-mock";
import {
  CampaignRunHeader,
  CampaignRunStateStrip,
  CategoryActionButtons,
  FocusCategoryPanel,
} from "@/components/campaign-run-prototype/campaign-run-shared";
import type { CampaignRunState } from "@/components/campaign-run-prototype/use-campaign-run-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** D — Action queue + jump palette */
export function RunVariantQueue({ run }: { run: CampaignRunState }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const head = run.closeVoteHead ?? run.revealHead;
  const preview = run.focusCategory;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return run.sorted;
    return run.sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, run.sorted]);

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <CampaignRunHeader run={run} />

      <section className="mt-8 rounded-2xl border-2 border-dashed border-primary/25 bg-primary/5 p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Now playing
        </p>
        {head ? (
          <>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {head.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {categoryStatusLabel(head.status)} · suggested next step
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {head.status === "voting_open" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void run.closeCategoryVoting(head.id)}
                >
                  Close voting
                </Button>
              ) : null}
              {head.status === "voting_closed" ? (
                <Button
                  type="button"
                  onClick={() => void run.revealCategoryWinner(head.id)}
                >
                  Show winner
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-4 text-lg font-medium text-emerald-700 dark:text-emerald-300">
            Run complete
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setQuery("");
              setPaletteOpen(true);
            }}
          >
            <RiSearchLine />
            Jump to category…
          </Button>
        </div>
      </section>

      {preview && preview.id !== head?.id ? (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Focus (jumped)
          </p>
          <FocusCategoryPanel run={run} category={preview} />
        </div>
      ) : null}

      {head && preview?.id === head.id ? (
        <div className="mt-6">
          <CategoryActionButtons run={run} category={head} />
        </div>
      ) : null}

      {paletteOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/50 px-4 pt-[15vh]"
          role="dialog"
          aria-modal
          aria-label="Jump to category"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-4 shadow-2xl">
            <Input
              placeholder="Search categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <ul className="mt-3 max-h-64 overflow-y-auto">
              {filtered.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      run.selectCategory(cat.id);
                      setPaletteOpen(false);
                      setQuery("");
                    }}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {categoryStatusLabel(cat.status)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              onClick={() => {
                setPaletteOpen(false);
                setQuery("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <CampaignRunStateStrip run={run} />
    </div>
  );
}
