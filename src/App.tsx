import { type CSSProperties, type FocusEvent, useRef, useState } from 'react';

import { useCitySuggestions } from './hooks/use-city-suggestions';
import { useWeather } from './hooks/use-weather';

const weatherStats = [
  { key: 'feelsLike', label: 'Відчувається як', unit: '°C' },
  { key: 'humidity', label: 'Вологість', unit: '%' },
  { key: 'windSpeed', label: 'Вітер', unit: ' км/год' },
] as const;

const MIN_SEARCH_LENGTH = 2;

const forecastDateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
});

function countryToFlag(countryCode: string) {
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.codePointAt(0)! - 65 + 127462))
    .join('');
}

function App() {
  const [city, setCity] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const cityInputRef = useRef<HTMLInputElement>(null);
  const {
    error: suggestionsError,
    hasSearched: hasSearchedSuggestions,
    loading: suggestionsLoading,
    suggestions,
  } = useCitySuggestions(city);
  const { weather, loading, error, forecast, loadCityWeather } = useWeather();
  const shouldShowSuggestions = isSuggestionsOpen && city.trim().length >= MIN_SEARCH_LENGTH;
  const shouldShowEmptySuggestions =
    shouldShowSuggestions &&
    hasSearchedSuggestions &&
    !suggestionsLoading &&
    suggestions.length === 0;

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCity(value);
    setSearchError('');
    setIsSuggestionsOpen(value.trim().length >= MIN_SEARCH_LENGTH);
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity('');
    setIsSuggestionsOpen(false);
    loadCityWeather(selectedCity);
  };

  const handleSuggestionsBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsSuggestionsOpen(false);
    }
  };

  const showSearchValidationError = () => {
    setSearchError(`Введіть щонайменше ${MIN_SEARCH_LENGTH} символи для пошуку погоди.`);

    if (cityInputRef.current) {
      cityInputRef.current.classList.remove('input-error-shake');
      void cityInputRef.current.offsetWidth;
      cityInputRef.current.classList.add('input-error-shake');
      cityInputRef.current.focus();
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formattedCity = city.trim();

    if (formattedCity.length < MIN_SEARCH_LENGTH) {
      setIsSuggestionsOpen(false);
      showSearchValidationError();
      return;
    }

    setSearchError('');
    setIsSuggestionsOpen(false);
    loadCityWeather(formattedCity);
  };

  return (
    <main className="min-h-screen overflow-hidden bg- px-4 py-6 text-slate-950 motion-safe:transition-colors motion-safe:duration-500 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-8 motion-safe:animate-[content-rise_500ms_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl font-bold tracking-normal text-balance sm:text-6xl">
              Weather App: Погода в твоєму місті
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
              by Anton Yanovskyi{' '}
              <a
                href="https://github.com/skynovua"
                className="font-medium text-sky-600 hover:underline"
                target="_blank"
              >
                @skynov
              </a>
            </p>
          </div>

          <form
            className="relative flex w-full max-w-2xl flex-col gap-3 md:flex-row"
            onSubmit={handleSearchSubmit}
          >
            <div className="relative min-w-0 flex-1" onBlur={handleSuggestionsBlur}>
              <label className="sr-only" htmlFor="city">
                Назва міста
              </label>
              <input
                ref={cityInputRef}
                id="city"
                value={city}
                onChange={handleCityChange}
                onFocus={() => setIsSuggestionsOpen(city.trim().length >= MIN_SEARCH_LENGTH)}
                placeholder="Наприклад, Харків"
                aria-invalid={Boolean(searchError)}
                aria-describedby={searchError ? 'search-error' : undefined}
                className={`h-12 w-full rounded-md border bg-white px-4 text-base text-slate-950 outline-none transition-[border-color,box-shadow] duration-200 ${
                  searchError
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100'
                }`}
                autoComplete="off"
              />

              {shouldShowSuggestions && (
                <ul className="dropdown-reveal absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
                  {suggestionsLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
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

                  {!suggestionsLoading &&
                    suggestions.map((item, index) => (
                      <li
                        key={`${item.name}-${item.lat}-${item.lon}`}
                        className="dropdown-item border-b border-slate-100 last:border-b-0"
                        style={{ '--item-index': index } as CSSProperties}
                      >
                        <button
                          type="button"
                          onClick={() => handleCitySelect(item.name)}
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

                  {shouldShowEmptySuggestions && (
                    <li className="dropdown-item px-4 py-4 text-sm text-slate-600">
                      {suggestionsError || 'Нічого не знайдено. Спробуйте іншу назву міста.'}
                    </li>
                  )}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 cursor-pointer transition-all duration-200 hover:bg-slate-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Шукаю...' : 'Пошук'}
            </button>
          </form>

          <div className="min-h-8">
            {searchError && (
              <p
                id="search-error"
                className="error-reveal inline-flex rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700"
              >
                {searchError}
              </p>
            )}
            {error && (
              <p className="error-reveal inline-flex rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}
          </div>
        </div>

        <aside className="weather-card rounded-lg border border-white/70 bg-white/75 p-5 shadow-2xl shadow-sky-950/10 backdrop-blur">
          {weather ? (
            <div className="space-y-6 motion-safe:animate-[content-rise_500ms_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                    Зараз
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {weather.city}, {weather.country}
                  </h2>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  className="h-20 w-20 shrink-0 rounded-full bg-sky-200"
                />
              </div>

              <div>
                <p className="text-7xl font-bold tracking-normal">{weather.temperature}°</p>
                <p className="mt-2 capitalize text-slate-600">{weather.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {weatherStats.map((stat) => (
                  <div
                    key={stat.key}
                    className="rounded-md border border-slate-200 bg-white/80 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">
                      {weather[stat.key]}
                      {stat.unit}
                    </p>
                  </div>
                ))}
              </div>

              {forecast.length > 0 && (
                <section className="space-y-3 border-t border-slate-200 pt-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Прогноз на 5 днів
                  </h3>
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
                            <p className="truncate text-sm capitalize text-slate-600">
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
            <div className="grid min-h-96 place-items-center rounded-md border border-dashed border-slate-300 bg-white/50 p-8 text-center motion-safe:animate-[content-rise_500ms_cubic-bezier(0.22,1,0.36,1)_both]">
              <div className="space-y-3">
                <p className="text-5xl font-bold text-sky-600">24°</p>
                <h2 className="text-xl font-semibold">Почни з пошуку міста</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Тут зʼявиться картка з температурою, описом погоди та ключовими показниками.
                </p>
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;
