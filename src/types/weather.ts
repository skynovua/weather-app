export interface WeatherApiResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface GeoLocation {
  country: string;
  lat: number;
  local_names?: Record<string, string>;
  lon: number;
  name: string;
  state?: string;
}

export interface WeatherCoordinates {
  lat: number;
  lon: number;
}

export interface CityWeatherInfo {
  city: string;
  condition: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface ForecastItem {
  dt: number;
  temperature: number;
  tempMin: number;
  tempMax: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface ForecastApiResponse {
  city: {
    name: string;
    country: string;
    timezone: number;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      feels_like: number;
      humidity: number;
    };
    wind: {
      speed: number;
    };
    weather: Array<{
      description: string;
      icon: string;
    }>;
  }>;
}

export interface ForecastWeatherInfo extends Omit<ForecastApiResponse, 'list'> {
  list: ForecastItem[];
}
