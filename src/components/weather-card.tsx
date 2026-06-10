import type { CSSProperties } from 'react';

import type { FavoriteCity } from '../services/storage';
import type { CityWeatherInfo, ForecastItem } from '../types/weather';
import { getFavoriteCityKey } from '../utils/city';
import { ConfirmDeleteButton } from './confirm-delete-button';

const weatherStats = [
  { key: 'feelsLike', label: 'Відчувається як', unit: '°C' },
  { key: 'humidity', label: 'Вологість', unit: '%' },
  { key: 'windSpeed', label: 'Вітер', unit: ' км/год' },
] as const;

const forecastDateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
});

interface WeatherCardProps {
  favoriteCity: FavoriteCity | null;
  forecast: ForecastItem[];
  isFavorite: boolean;
  loading: boolean;
  onAddFavorite: () => void;
  onRemoveFavorite: (favoriteCity: FavoriteCity) => void;
  weather: CityWeatherInfo | null;
}

const WeatherCardSkeleton: React.FC = () => {
  return (
    <aside className="content-rise weather-card rounded-lg border border-white/70 bg-white/75 p-4 shadow-2xl shadow-sky-950/10 backdrop-blur sm:p-5">
      <span className="sr-only">Завантаження погоди</span>
      <div className="grid min-h-90 gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-5">
          <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-start gap-4">
            <div className="space-y-3">
              <div className="skeleton-line h-4 w-20 rounded-full" />
              <div className="skeleton-line h-8 w-56 max-w-full rounded-full" />
              <div className="skeleton-line h-9 w-36 rounded-md" />
            </div>
            <div className="skeleton-line h-20 w-20 rounded-full" />
          </div>

          <div className="space-y-3">
            <div className="skeleton-line h-20 w-36 rounded-lg" />
            <div className="skeleton-line h-5 w-32 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {weatherStats.map((stat) => (
              <div key={stat.key} className="rounded-md border border-slate-200 bg-white/80 p-3">
                <div className="skeleton-line h-4 w-24 rounded-full" />
                <div className="skeleton-line mt-3 h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 xl:pl-6">
          <div className="space-y-2">
            <div className="skeleton-line h-4 w-20 rounded-full" />
            <div className="skeleton-line h-8 w-32 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <article
                key={index}
                className="dropdown-item grid min-h-40 gap-3 rounded-md border border-slate-200 bg-white/80 p-3.5 xl:p-4"
                style={{ '--item-index': index } as CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="skeleton-line h-5 w-16 rounded-full" />
                    <div className="skeleton-line h-4 w-16 rounded-full" />
                    <div className="skeleton-line h-4 w-14 rounded-full" />
                  </div>
                  <div className="skeleton-line h-10 w-10 shrink-0 rounded-full" />
                </div>
                <div className="space-y-2 self-end">
                  <div className="skeleton-line h-8 w-14 rounded-full" />
                  <div className="skeleton-line h-3 w-20 rounded-full" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

export const WeatherCard: React.FC<WeatherCardProps> = (props) => {
  const { favoriteCity, forecast, isFavorite, loading, onAddFavorite, onRemoveFavorite, weather } =
    props;

  if (!weather) {
    if (loading) {
      return <WeatherCardSkeleton />;
    }

    return null;
  }

  const weatherContentKey = `${weather.city}-${weather.country}`;

  return (
    <aside className="content-rise weather-card rounded-lg border border-white/70 bg-white/75 p-4 shadow-2xl shadow-sky-950/10 backdrop-blur sm:p-5">
      <div
        key={weatherContentKey}
        className="grid min-h-90 gap-5 lg:grid-cols-[420px_minmax(0,1fr)]"
      >
        <section className="space-y-5">
          <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-start gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 uppercase">Зараз</p>
              <h2 className="mt-2 text-2xl leading-tight font-bold text-balance sm:text-3xl lg:text-2xl xl:text-3xl">
                {weather.city}, {weather.country}
              </h2>
              {isFavorite && favoriteCity ? (
                <ConfirmDeleteButton
                  id={getFavoriteCityKey(favoriteCity)}
                  favoriteCity={favoriteCity}
                  onConfirm={() => onRemoveFavorite(favoriteCity)}
                  className="mt-3 inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:border-sky-200 focus:bg-sky-50 focus:text-sky-700 focus:outline-none"
                >
                  Видалити з обраних
                </ConfirmDeleteButton>
              ) : (
                <button
                  type="button"
                  onClick={onAddFavorite}
                  className="mt-3 inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:border-sky-200 focus:bg-sky-50 focus:text-sky-700 focus:outline-none"
                >
                  Додати в обрані
                </button>
              )}
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="h-20 w-20 rounded-full bg-sky-200"
            />
          </div>

          <div>
            <p className="text-7xl font-bold">{weather.temperature}°</p>
            <p className="mt-2 text-slate-600 capitalize">{weather.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {weatherStats.map((stat) => (
              <div key={stat.key} className="rounded-md border border-slate-200 bg-white/80 p-3">
                <p className="text-[11px] leading-4 font-medium text-slate-500 uppercase">
                  {stat.label}
                </p>
                <p className="mt-2 text-base font-semibold whitespace-nowrap sm:text-lg">
                  {weather[stat.key]}
                  {stat.unit}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 xl:pl-6">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase">Прогноз</p>
            <h3 className="mt-1 text-2xl font-bold">На 5 днів</h3>
          </div>

          {forecast.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {forecast.map((day, index) => (
                <article
                  key={day.dt}
                  className="dropdown-item grid min-h-40 gap-3 rounded-md border border-slate-200 bg-white/80 p-3.5 xl:p-4"
                  style={{ '--item-index': index } as CSSProperties}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold capitalize">
                        {forecastDateFormatter.format(new Date(day.dt * 1000))}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 capitalize">{day.description}</p>
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.description}
                      className="h-10 w-10 shrink-0 rounded-full bg-sky-200"
                    />
                  </div>
                  <div className="self-end">
                    <p className="text-3xl font-semibold">{day.temperature}°</p>
                    <p className="mt-1 text-xs text-slate-500">вітер {day.windSpeed} км/год</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
