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
  onAddFavorite: () => void;
  onRemoveFavorite: (favoriteCity: FavoriteCity) => void;
  weather: CityWeatherInfo | null;
}

export const WeatherCard: React.FC<WeatherCardProps> = (props) => {
  const { favoriteCity, forecast, isFavorite, onAddFavorite, onRemoveFavorite, weather } = props;
  const weatherContentKey = weather ? `${weather.city}-${weather.country}` : 'empty-weather-card';

  return (
    <aside className="weather-card rounded-lg border border-white/70 bg-white/75 p-5 shadow-2xl shadow-sky-950/10 backdrop-blur">
      {weather ? (
        <div key={weatherContentKey} className="content-rise space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase">Зараз</p>
              <h2 className="mt-2 text-3xl font-bold">
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
              className="h-20 w-20 shrink-0 rounded-full bg-sky-200"
            />
          </div>

          <div>
            <p className="text-7xl font-bold">{weather.temperature}°</p>
            <p className="mt-2 text-slate-600 capitalize">{weather.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {weatherStats.map((stat) => (
              <div key={stat.key} className="rounded-md border border-slate-200 bg-white/80 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">
                  {weather[stat.key]}
                  {stat.unit}
                </p>
              </div>
            ))}
          </div>

          {forecast.length > 0 && (
            <section className="space-y-3 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase">Прогноз на 5 днів</h3>
              <div className="grid gap-2">
                {forecast.map((day, index) => (
                  <article
                    key={day.dt}
                    className="dropdown-item grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-slate-200 bg-white/80 p-3"
                    style={{ '--item-index': index } as CSSProperties}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                        alt={day.description}
                        className="h-10 w-10 shrink-0 rounded-full bg-sky-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold capitalize">
                          {forecastDateFormatter.format(new Date(day.dt * 1000))}
                        </p>
                        <p className="truncate text-sm text-slate-600 capitalize">
                          {day.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{day.temperature}°</p>
                      <p className="text-xs text-slate-500">вітер {day.windSpeed} км/год</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="content-rise grid min-h-96 place-items-center rounded-md border border-dashed border-slate-300 bg-white/50 p-8 text-center">
          <div className="space-y-3">
            <p className="text-5xl font-bold text-sky-600">24°</p>
            <h2 className="text-xl font-semibold">Почни з пошуку міста</h2>
            <p className="text-sm leading-6 text-slate-600">
              Тут з'явиться картка з температурою, описом погоди та ключовими показниками.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
