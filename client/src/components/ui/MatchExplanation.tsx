import { Image as ImageIcon, Type, Tag, FolderOpen, Palette, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { ScoreBar } from '@/components/ui/ScoreBar';

/**
 * The per-dimension match scores returned by the match engine. Mirrors the
 * `scores` object on MatchResult and the re-computed breakdown used in admin
 * claim review.
 */
export interface MatchScores {
  imageScore?: number;
  titleScore?: number;
  brandScore?: number;
  colorScore?: number;
  categoryScore?: number;
  locationScore?: number;
  dateScore?: number;
  overallScore?: number;
  explanation?: string[];
  summary?: string;
}

interface MatchExplanationProps {
  scores: MatchScores;
  /** Show the "Why this match?" checklist below the bars. Defaults to true. */
  showExplanation?: boolean;
}

const DIMENSIONS: { key: keyof MatchScores; label: string; icon: typeof Type }[] = [
  { key: 'imageScore', label: 'Image', icon: ImageIcon },
  { key: 'titleScore', label: 'Title', icon: Type },
  { key: 'brandScore', label: 'Brand', icon: Tag },
  { key: 'categoryScore', label: 'Category', icon: FolderOpen },
  { key: 'colorScore', label: 'Color', icon: Palette },
  { key: 'locationScore', label: 'Location', icon: MapPin },
  { key: 'dateScore', label: 'Date', icon: Calendar },
];

/**
 * Shared "Why this match?" panel: confidence breakdown bars for every match
 * dimension plus the human-readable explanation checklist. Used on the student
 * AI match results page and the admin claim review page so the explanation is
 * presented identically everywhere matches appear.
 */
export function MatchExplanation({ scores, showExplanation = true }: MatchExplanationProps) {
  const explanation = scores.explanation ?? [];

  return (
    <div className="space-y-3">
      {/* Natural-language summary */}
      {scores.summary && (
        <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm italic text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
          {scores.summary}
        </p>
      )}

      <div className="space-y-1.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
        {DIMENSIONS.map(({ key, label, icon: Icon }) => (
          <ScoreBar key={key} label={label} value={(scores[key] as number) ?? 0} icon={<Icon size={12} />} />
        ))}
      </div>

      {showExplanation && explanation.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Why this match?</p>
          <ul className="space-y-1.5">
            {explanation.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                <CheckCircle size={15} className="mt-0.5 shrink-0 text-green-500" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
