// apps/rider/src/components/common/RankBadge.tsx
"use client";

import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { TranslationKey } from "@/lib/i18n";
import { useTranslation } from "@/providers/LanguageProvider";
import type { RiderRank } from "@/types/rider";

const RANK_LABEL_KEYS: Record<RiderRank, TranslationKey> = {
  bronze: "rewards.rankBronze",
  silver: "rewards.rankSilver",
  gold: "rewards.rankGold",
};

const RANK_ICONS: Record<RiderRank, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

const RANK_TONES: Record<RiderRank, BadgeTone> = {
  bronze: "brand",
  silver: "muted",
  gold: "gold",
};

/** Bronze / Silver / Gold tag. */
export function RankBadge({ rank }: { rank: RiderRank }) {
  const { t } = useTranslation();

  return (
    <Badge tone={RANK_TONES[rank]}>
      <span aria-hidden="true">{RANK_ICONS[rank]}</span>
      {t(RANK_LABEL_KEYS[rank])}
    </Badge>
  );
  }
