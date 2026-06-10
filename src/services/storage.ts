import type { CityWeatherInfo, ForecastItem } from '../types/weather';

const WEATHER_APP_STORAGE_KEY = 'weather-app.state';

export interface FavoriteCity {
  city: string;
  country: string;
}

export interface CachedWeather {
  forecast: ForecastItem[];
  savedAt: number;
  weather: CityWeatherInfo;
}

export type WeatherCache = Record<string, CachedWeather>;

interface WeatherAppStorage {
  favoriteCities: FavoriteCity[];
  weatherCache: WeatherCache;
}

const initialStorage: WeatherAppStorage = {
  favoriteCities: [],
  weatherCache: {},
};

function readWeatherAppStorage(): WeatherAppStorage {
  const storedState = window.localStorage.getItem(WEATHER_APP_STORAGE_KEY);

  if (!storedState) {
    return initialStorage;
  }

  try {
    const parsedState = JSON.parse(storedState) as Partial<WeatherAppStorage>;

    return {
      favoriteCities: Array.isArray(parsedState.favoriteCities) ? parsedState.favoriteCities : [],
      weatherCache:
        parsedState.weatherCache && typeof parsedState.weatherCache === 'object'
          ? parsedState.weatherCache
          : {},
    };
  } catch {
    return initialStorage;
  }
}

function writeWeatherAppStorage(nextState: WeatherAppStorage) {
  window.localStorage.setItem(WEATHER_APP_STORAGE_KEY, JSON.stringify(nextState));
}

export function getWeatherCacheKey(city: string) {
  return city.trim().toLowerCase();
}

export function readFavoriteCities() {
  return readWeatherAppStorage().favoriteCities;
}

export function writeFavoriteCities(favoriteCities: FavoriteCity[]) {
  writeWeatherAppStorage({
    ...readWeatherAppStorage(),
    favoriteCities,
  });
}

export function readWeatherCache() {
  return readWeatherAppStorage().weatherCache;
}

export function writeWeatherCache(weatherCache: WeatherCache) {
  writeWeatherAppStorage({
    ...readWeatherAppStorage(),
    weatherCache,
  });
}
