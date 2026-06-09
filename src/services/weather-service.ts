import type {
  CityWeatherInfo,
  ForecastApiResponse,
  ForecastWeatherInfo,
  GeoLocation,
  WeatherApiResponse,
} from '../types/weather';
import { buildGeoUrl, buildWeatherUrl, fetchJson } from './api';

export async function fetchCurrentWeather(city: string): Promise<CityWeatherInfo> {
  const data = await fetchJson<WeatherApiResponse>(
    buildWeatherUrl('weather', { q: city, units: 'metric' }),
  );

  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed),
    description: data.weather[0]?.description ?? 'Відсутній опис погоди',
    icon: data.weather[0]?.icon ?? '01d',
  };
}

export async function fetchForecastWeather(city: string): Promise<ForecastWeatherInfo> {
  const data = await fetchJson<ForecastApiResponse>(
    buildWeatherUrl('forecast', { q: city, units: 'metric', cnt: '40' }),
  );

  const groupedByDay = new Map<string, ForecastApiResponse['list'][number]>();

  data.list.forEach((item) => {
    const dayKey = new Date(item.dt * 1000).toISOString().slice(0, 10);

    if (!groupedByDay.has(dayKey)) {
      groupedByDay.set(dayKey, item);
    }
  });

  const list = Array.from(groupedByDay.values()).map((item) => ({
    dt: item.dt,
    temperature: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    windSpeed: Math.round(item.wind.speed),
    description: item.weather[0]?.description ?? 'Відсутній опис погоди',
    icon: item.weather[0]?.icon ?? '01d',
  }));

  return {
    city: {
      name: data.city.name,
      country: data.city.country,
    },
    list,
  };
}

export async function fetchCoordinates(city: string, limit = 1): Promise<GeoLocation[]> {
  const locations = await fetchJson<GeoLocation[]>(
    buildGeoUrl('direct', { q: city, limit: String(limit) }),
  );

  if (!locations.length) {
    throw new Error('City not found.');
  }

  return locations.slice(0, limit);
}

export async function fetchCitySuggestions(city: string): Promise<GeoLocation[]> {
  return fetchCoordinates(city, 5);
}
