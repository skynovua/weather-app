import type { CityWeatherInfo } from '../types/weather';

export type WeatherTheme = 'clear' | 'clouds' | 'default' | 'mist' | 'rain' | 'snow' | 'storm';

const WEATHER_THEME_BY_CONDITION: Record<string, WeatherTheme> = {
  clear: 'clear',
  clouds: 'clouds',
  drizzle: 'rain',
  rain: 'rain',
  thunderstorm: 'storm',
  snow: 'snow',
  mist: 'mist',
  smoke: 'mist',
  haze: 'mist',
  dust: 'mist',
  fog: 'mist',
  sand: 'mist',
  ash: 'mist',
  squall: 'storm',
  tornado: 'storm',
};

export function getWeatherTheme(weather: CityWeatherInfo | null): WeatherTheme {
  if (!weather?.condition) {
    return 'default';
  }

  return WEATHER_THEME_BY_CONDITION[weather.condition.toLowerCase()] ?? 'default';
}
