import type { CSSProperties, FC } from 'react';

import type { GeoLocation } from '../types/weather';
import { countryToFlag } from '../utils/city';

const SUGGESTION_SKELETON_COUNT = 4;

interface SearchSuggestionsDropdownProps {
  error: string;
  loading: boolean;
  shouldShowEmpty: boolean;
  suggestions: GeoLocation[];
  onSelectCity: (city: string) => void;
}

export const SearchSuggestionsDropdown: FC<SearchSuggestionsDropdownProps> = (props) => {
  const { error, loading, shouldShowEmpty, suggestions, onSelectCity } = props;

  return (
    <ul className="dropdown-reveal absolute top-[calc(100%-1rem)] right-0 left-0 z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
      {loading &&
        Array.from({ length: SUGGESTION_SKELETON_COUNT }).map((_, index) => (
          <li
            key={index}
            className="dropdown-item border-b border-slate-100 px-4 py-3 last:border-b-0"
            style={{ '--item-index': index } as CSSProperties}
          >
            <div className="skeleton-line h-4 w-36 rounded-full" />
            <div className="skeleton-line mt-2 h-3 w-48 rounded-full" />
            <div className="skeleton-line mt-2 h-3 w-28 rounded-full" />
          </li>
        ))}

      {!loading &&
        suggestions.map((item, index) => (
          <li
            key={`${item.name}-${item.lat}-${item.lon}`}
            className="dropdown-item border-b border-slate-100 last:border-b-0"
            style={{ '--item-index': index } as CSSProperties}
          >
            <button
              type="button"
              onClick={() => onSelectCity(item.name)}
              className="grid w-full gap-1 px-4 py-3 text-left transition-colors duration-150 hover:bg-sky-50 focus:bg-sky-50 focus:outline-none"
            >
              <strong className="text-sm font-semibold text-slate-950">
                {countryToFlag(item.country)} {item.name}
              </strong>
              <span className="text-xs text-slate-600">
                {item.state ? `${item.state}, ${item.country}` : item.country}
              </span>
              <span className="text-xs text-slate-400">
                {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
              </span>
            </button>
          </li>
        ))}

      {shouldShowEmpty && (
        <li className="dropdown-item px-4 py-4 text-sm text-slate-600">
          {error || 'Нічого не знайдено. Спробуйте іншу назву міста.'}
        </li>
      )}
    </ul>
  );
};
