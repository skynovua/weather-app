import { useCallback, useEffect, useState } from 'react';

import {
  ERROR_MESSAGE_TIMEOUT_MS,
  FORECAST_DAYS_LIMIT,
  WEATHER_CACHE_TTL_MS,
} from '../constants/weather';
import { getWeatherCacheKey, readWeatherCache, writeWeatherCache } from '../services/storage';
import {
  fetchCurrentWeather,
  fetchCurrentWeatherByCoordinates,
  fetchForecastWeather,
  fetchForecastWeatherByCoordinates,
} from '../services/weather-service';
import type { CityWeatherInfo, ForecastItem, WeatherCoordinates } from '../types/weather';

interface LoadCityWeatherOptions {
  useCache?: boolean;
}

function getFreshCachedWeather(city: string) {
  const cachedWeather = readWeatherCache()[getWeatherCacheKey(city)];

  if (!cachedWeather) {
    return null;
  }

  return Date.now() - cachedWeather.savedAt < WEATHER_CACHE_TTL_MS ? cachedWeather : null;
}

function saveWeatherToCache(city: string, weather: CityWeatherInfo, forecast: ForecastItem[]) {
  writeWeatherCache({
    ...readWeatherCache(),
    [getWeatherCacheKey(city)]: {
      forecast,
      savedAt: Date.now(),
      weather,
    },
  });
}

function removeWeatherFromCache(city: string) {
  const cache = readWeatherCache();
  const cacheKey = getWeatherCacheKey(city);

  if (!cache[cacheKey]) {
    return;
  }

  const nextCache = { ...cache };
  delete nextCache[cacheKey];

  writeWeatherCache(nextCache);
}

export function useWeather() {
  const [weather, setWeather] = useState<CityWeatherInfo | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorVersion, setErrorVersion] = useState(0);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timeoutId = window.setTimeout(() => setError(''), ERROR_MESSAGE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [error, errorVersion]);

  const clearError = useCallback(() => setError(''), []);

  const showError = useCallback((message: string) => {
    setError(message);
    setErrorVersion((currentVersion) => currentVersion + 1);
  }, []);

  const cacheCurrentWeather = useCallback(() => {
    if (!weather) {
      return;
    }

    saveWeatherToCache(weather.city, weather, forecast);
  }, [forecast, weather]);

  const removeCachedWeather = useCallback((city: string) => {
    removeWeatherFromCache(city);
  }, []);

  const loadWeatherData = useCallback(
    async (loadWeather: () => Promise<[CityWeatherInfo, ForecastItem[]]>) => {
      setError('');
      setLoading(true);

      try {
        const [currentWeather, forecastWeather] = await loadWeather();

        setWeather(currentWeather);
        setForecast(forecastWeather.slice(0, FORECAST_DAYS_LIMIT));
      } catch (err) {
        setWeather(null);
        setForecast([]);
        showError(
          err instanceof Error ? err.message : 'Ой, сталася помилка при завантаженні даних погоди.',
        );
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  const loadCityWeather = useCallback(
    async (city: string, options: LoadCityWeatherOptions = {}) => {
      const formattedCity = city.trim();

      if (!formattedCity) {
        showError('Введіть назву міста для пошуку погоди.');
        return;
      }

      const cachedWeather = options.useCache ? getFreshCachedWeather(formattedCity) : null;

      if (cachedWeather) {
        setWeather(cachedWeather.weather);
        setForecast(cachedWeather.forecast);
        return;
      }

      await loadWeatherData(async () => {
        const [currentWeather, forecastWeather] = await Promise.all([
          fetchCurrentWeather(formattedCity),
          fetchForecastWeather(formattedCity),
        ]);
        const forecastList = forecastWeather.list.slice(0, FORECAST_DAYS_LIMIT);

        if (options.useCache) {
          saveWeatherToCache(formattedCity, currentWeather, forecastList);
        }

        return [currentWeather, forecastList];
      });
    },
    [loadWeatherData, showError],
  );

  const loadCoordinatesWeather = useCallback(
    async (coordinates: WeatherCoordinates) => {
      await loadWeatherData(async () => {
        const [currentWeather, forecastWeather] = await Promise.all([
          fetchCurrentWeatherByCoordinates(coordinates),
          fetchForecastWeatherByCoordinates(coordinates),
        ]);

        return [currentWeather, forecastWeather.list];
      });
    },
    [loadWeatherData],
  );

  return {
    cacheCurrentWeather,
    clearError,
    error,
    errorVersion,
    forecast,
    loadCityWeather,
    loadCoordinatesWeather,
    loading,
    removeCachedWeather,
    showError,
    weather,
  };
}
