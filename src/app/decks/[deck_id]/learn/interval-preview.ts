import { CardType } from "../../../../../generated/prisma/enums";
import { SM2_CONFIG } from "@/modules/card/card-service-dto";

export interface CardPreview {
  type: CardType;
  ivl: number;
  factor: number;
  left: number;
}

export interface PreviewIntervals {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

function calculateReviewIntervals(ivl: number, factor: number): PreviewIntervals {
  const MINUTES_PER_DAY = 1440;
  return {
    again: Math.max(1, Math.floor(ivl * SM2_CONFIG.NEW_INTERVAL)) * MINUTES_PER_DAY,
    hard: Math.floor(ivl * SM2_CONFIG.HARD_INTERVAL * SM2_CONFIG.INTERVAL_MODIFIER) * MINUTES_PER_DAY,
    good: Math.floor(ivl * (factor / 1000) * SM2_CONFIG.INTERVAL_MODIFIER) * MINUTES_PER_DAY,
    easy: Math.floor(ivl * (factor / 1000) * SM2_CONFIG.EASY_BONUS * SM2_CONFIG.INTERVAL_MODIFIER) * MINUTES_PER_DAY,
  };
}

function calculateNewCardIntervals(): PreviewIntervals {
  const steps = SM2_CONFIG.LEARNING_STEPS;
  
  return {
    again: steps[0],
    hard: steps.length >= 2 ? (steps[0] + steps[1]) / 2 : steps[0],
    good: steps.length >= 2 ? steps[1] : SM2_CONFIG.GRADUATING_INTERVAL_GOOD * 1440,
    easy: SM2_CONFIG.EASY_INTERVAL * 1440,
  };
}

function calculateLearningIntervals(left: number, isRelearning: boolean): PreviewIntervals {
  const steps = isRelearning ? SM2_CONFIG.RELEARNING_STEPS : SM2_CONFIG.LEARNING_STEPS;
  const stepIndex = Math.floor(left % 1000);
  
  const again = steps[0] ?? 1;
  
  let hard: number;
  if (stepIndex === 0 && steps.length >= 2) {
    const step0 = steps[0] ?? 1;
    const step1 = steps[1] ?? step0;
    hard = (step0 + step1) / 2;
  } else {
    hard = steps[stepIndex] ?? steps[0] ?? 1;
  }
  
  let good: number;
  if (stepIndex < steps.length - 1) {
    good = steps[stepIndex + 1] ?? steps[0] ?? 1;
  } else {
    good = SM2_CONFIG.GRADUATING_INTERVAL_GOOD * 1440;
  }
  
  const easy = SM2_CONFIG.GRADUATING_INTERVAL_EASY * 1440;
  
  return { again, hard, good, easy };
}

export function calculatePreviewIntervals(card: CardPreview): PreviewIntervals {
  switch (card.type) {
    case CardType.NEW:
      return calculateNewCardIntervals();
    case CardType.LEARNING:
      return calculateLearningIntervals(card.left, false);
    case CardType.RELEARNING:
      return calculateLearningIntervals(card.left, true);
    case CardType.REVIEW:
    default:
      return calculateReviewIntervals(card.ivl, card.factor);
  }
}

export function formatPreviewInterval(minutes: number): string {
  if (minutes < 1) return "<1";
  if (minutes < 60) return `${Math.round(minutes)}`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}
