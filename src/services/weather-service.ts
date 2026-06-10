import { CITY_SUGGESTIONS_LIMIT, FORECAST_API_ITEM_LIMIT } from '../constants/weather';
import type {
  CityWeatherInfo,
  ForecastApiResponse,
  ForecastWeatherInfo,
  GeoLocation,
  WeatherApiResponse,
  WeatherCoordinates,
} from '../types/weather';
import { buildGeoUrl, buildWeatherUrl, fetchJson } from './api';

function mapCurrentWeather(data: WeatherApiResponse): CityWeatherInfo {
  return {
    city: data.name,
    condition: data.weather[0]?.main ?? 'Clear',
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed),
    description: data.weather[0]?.description ?? 'Відсутній опис погоди',
    icon: data.weather[0]?.icon ?? '01d',
  };
}

function mapForecastWeather(data: ForecastApiResponse): ForecastWeatherInfo {
  const groupedByDay = new Map<string, ForecastApiResponse['list']>();

  data.list.forEach((item) => {
    const dayKey = new Date((item.dt + data.city.timezone) * 1000).toISOString().slice(0, 10);
    const dayItems = groupedByDay.get(dayKey);

    if (dayItems) {
      dayItems.push(item);
    } else {
      groupedByDay.set(dayKey, [item]);
    }
  });

  const list = Array.from(groupedByDay.values()).map((dayItems) => {
    const representativeItem = dayItems.reduce((closestItem, item) => {
      const closestHour = new Date((closestItem.dt + data.city.timezone) * 1000).getUTCHours();
      const itemHour = new Date((item.dt + data.city.timezone) * 1000).getUTCHours();

      return Math.abs(itemHour - 12) < Math.abs(closestHour - 12) ? item : closestItem;
    });

    return {
      dt: representativeItem.dt,
      temperature: Math.round(representativeItem.main.temp),
      tempMin: Math.round(Math.min(...dayItems.map((item) => item.main.temp_min))),
      tempMax: Math.round(Math.max(...dayItems.map((item) => item.main.temp_max))),
      feelsLike: Math.round(representativeItem.main.feels_like),
      humidity: representativeItem.main.humidity,
      windSpeed: Math.round(representativeItem.wind.speed),
      description: representativeItem.weather[0]?.description ?? 'Відсутній опис погоди',
      icon: representativeItem.weather[0]?.icon ?? '01d',
    };
  });

  return {
    city: {
      name: data.city.name,
      country: data.city.country,
      timezone: data.city.timezone,
    },
    list,
  };
}

function coordinatesToParams(coordinates: WeatherCoordinates) {
  return {
    lat: String(coordinates.lat),
    lon: String(coordinates.lon),
  };
}

export async function fetchCurrentWeather(city: string): Promise<CityWeatherInfo> {
  const data = await fetchJson<WeatherApiResponse>(
    buildWeatherUrl('weather', { q: city, units: 'metric' }),
  );

  return mapCurrentWeather(data);
}

export async function fetchCurrentWeatherByCoordinates(
  coordinates: WeatherCoordinates,
): Promise<CityWeatherInfo> {
  const data = await fetchJson<WeatherApiResponse>(
    buildWeatherUrl('weather', { ...coordinatesToParams(coordinates), units: 'metric' }),
  );

  return mapCurrentWeather(data);
}

export async function fetchForecastWeather(city: string): Promise<ForecastWeatherInfo> {
  const data = await fetchJson<ForecastApiResponse>(
    buildWeatherUrl('forecast', { q: city, units: 'metric', cnt: String(FORECAST_API_ITEM_LIMIT) }),
  );

  return mapForecastWeather(data);
}

export async function fetchForecastWeatherByCoordinates(
  coordinates: WeatherCoordinates,
): Promise<ForecastWeatherInfo> {
  const data = await fetchJson<ForecastApiResponse>(
    buildWeatherUrl('forecast', {
      ...coordinatesToParams(coordinates),
      units: 'metric',
      cnt: String(FORECAST_API_ITEM_LIMIT),
    }),
  );

  return mapForecastWeather(data);
}

export async function fetchCitySuggestions(city: string): Promise<GeoLocation[]> {
  const locations = await fetchJson<GeoLocation[]>(
    buildGeoUrl('direct', { q: city, limit: String(CITY_SUGGESTIONS_LIMIT) }),
  );

  return locations.slice(0, CITY_SUGGESTIONS_LIMIT);
}
