import { useCallback, useState } from 'react';

import { fetchCurrentWeather, fetchForecastWeather } from '../services/weather-service';
import type { CityWeatherInfo, ForecastItem } from '../types/weather';

export function useWeather() {
  const [weather, setWeather] = useState<CityWeatherInfo | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCityWeather = useCallback(async (city: string) => {
    const formattedCity = city.trim();

    if (!formattedCity) {
      setError('Введіть назву міста для пошуку погоди.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [currentWeather, forecastWeather] = await Promise.all([
        fetchCurrentWeather(formattedCity),
        fetchForecastWeather(formattedCity),
      ]);

      setWeather(currentWeather);
      setForecast(forecastWeather.list.slice(0, 5));
    } catch (err) {
      setWeather(null);
      setForecast([]);
      setError(
        err instanceof Error ? err.message : 'Ой, сталася помилка при завантаженні даних погоди.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    error,
    forecast,
    loadCityWeather,
    loading,
    weather,
  };
}
