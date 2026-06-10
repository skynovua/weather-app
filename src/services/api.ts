export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? '';

export function getApiKey(): string {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('Відсутній VITE_OPENWEATHER_API_KEY у змінних середовища.');
  }

  return OPENWEATHER_API_KEY;
}

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';

function buildUrl(baseUrl: string, path: string, params: Record<string, string>): string {
  const url = new URL(path, `${baseUrl}/`);

  url.searchParams.set('appid', getApiKey());
  // Варто зробити вибір мови динамічним у майбутньому,але поки що встановимо українську як мову за замовчуванням.
  url.searchParams.set('lang', 'uk');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function buildWeatherUrl(path: string, params: Record<string, string> = {}): string {
  return buildUrl(WEATHER_API_URL, path, params);
}

export function buildGeoUrl(path: string, params: Record<string, string> = {}): string {
  return buildUrl(GEO_API_URL, path, params);
}

// Базова функція для виконання запитів до API та обробки відповіді з типізацією результату
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Request failed.');
  }

  return (await response.json()) as T;
}
