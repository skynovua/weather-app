import type { FC } from 'react';

import type { FavoriteCity } from '../services/storage';
import { countryToFlag, getFavoriteCityKey } from '../utils/city';
import { cn } from '../utils/cn';
import { ConfirmDeleteButton } from './confirm-delete-button';

interface FavoriteCitiesListProps {
  favoriteCities: FavoriteCity[];
  selectedCityKey?: string;
  onOpenCity: (favoriteCity: FavoriteCity) => void;
  onRemoveCity: (favoriteCity: FavoriteCity) => void;
}

export const FavoriteCitiesList: FC<FavoriteCitiesListProps> = (props) => {
  const { favoriteCities, selectedCityKey, onOpenCity, onRemoveCity } = props;

  if (favoriteCities.length === 0) {
    return null;
  }

  return (
    <section className="max-w-2xl space-y-3">
      <h2 className="text-sm uppercase text-slate-500">Обрані міста</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {favoriteCities.map((favoriteCity) => {
          const favoriteCityKey = getFavoriteCityKey(favoriteCity);
          const isSelected = favoriteCityKey === selectedCityKey;

          return (
            <article
              key={favoriteCityKey}
              className={cn(
                'grid grid-cols-[minmax(0,1fr)_2.5rem] items-center gap-2 rounded-md border bg-white/80 p-2 transition-colors',
                isSelected ? 'border border-sky-500 ring-4 ring-sky-100' : 'border-slate-200',
              )}
            >
              <button
                type="button"
                onClick={() => onOpenCity(favoriteCity)}
                className="min-w-0 rounded-sm px-2 py-1 text-left transition-colors"
              >
                <span className="block truncate text-sm font-semibold text-slate-950">
                  {favoriteCity.city}
                </span>
                <span className="block text-xs text-slate-500">
                  {countryToFlag(favoriteCity.country)} {favoriteCity.country}
                </span>
              </button>
              <ConfirmDeleteButton
                id={favoriteCityKey}
                favoriteCity={favoriteCity}
                onConfirm={() => onRemoveCity(favoriteCity)}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-lg leading-none text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:border-red-200 focus:bg-red-50 focus:text-red-600 focus:outline-none"
              >
                ×
              </ConfirmDeleteButton>
            </article>
          );
        })}
      </div>
    </section>
  );
};
