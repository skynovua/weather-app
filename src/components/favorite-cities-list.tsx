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
    <section className="content-rise space-y-3">
      <h2 className="text-sm text-slate-500 uppercase">Обрані міста</h2>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {favoriteCities.map((favoriteCity) => {
          const favoriteCityKey = getFavoriteCityKey(favoriteCity);
          const isSelected = favoriteCityKey === selectedCityKey;

          return (
            <article
              key={favoriteCityKey}
              className={cn(
                'grid w-52 shrink-0 grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-2 rounded-md border bg-white/80 p-2 transition-[border-color,box-shadow,transform] duration-200 focus-within:shadow-lg focus-within:shadow-slate-950/10 hover:shadow-lg hover:shadow-slate-950/10 sm:w-56',
                isSelected ? 'border-sky-400 shadow-lg shadow-sky-950/10' : 'border-slate-200',
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
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-lg leading-none text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:border-red-200 focus:bg-red-50 focus:text-red-600 focus:outline-none"
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
