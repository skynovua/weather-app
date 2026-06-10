import { useEffect, useRef } from 'react';

import { DEFAULT_CITY } from '../constants/weather';
import type { WeatherCoordinates } from '../types/weather';

let hasCheckedInitialLocation = false;
let initialLocationRequest: Promise<WeatherCoordinates> | null = null;

type UseInitialLocationWeatherOptions = {
  loadCityWeather: (city: string) => void;
  loadCoordinatesWeather: (coordinates: WeatherCoordinates) => void;
};

function requestCurrentPosition() {
  return new Promise<WeatherCoordinates>(
    (resolve, reject: (error: GeolocationPositionError) => void) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }),
        reject,
        {
          enableHighAccuracy: false,
          maximumAge: 10 * 60 * 1000,
          timeout: 10000,
        },
      );
    },
  );
}

function getInitialLocationRequest() {
  if (!navigator.geolocation) {
    return null;
  }

  initialLocationRequest ??= requestCurrentPosition();

  return initialLocationRequest;
}

export function useInitialLocationWeather({
  loadCityWeather,
  loadCoordinatesWeather,
}: UseInitialLocationWeatherOptions) {
  const hasManualWeatherRequestRef = useRef(false);

  useEffect(() => {
    if (hasCheckedInitialLocation && !initialLocationRequest) {
      return;
    }

    hasCheckedInitialLocation = true;
    const locationRequest = getInitialLocationRequest();

    let ignoreResult = false;
    const loadDefaultCityWeather = () => {
      if (!ignoreResult && !hasManualWeatherRequestRef.current) {
        loadCityWeather(DEFAULT_CITY);
      }
    };

    if (!locationRequest) {
      loadDefaultCityWeather();
      return;
    }

    locationRequest
      .then((coordinates) => {
        if (!ignoreResult && !hasManualWeatherRequestRef.current) {
          loadCoordinatesWeather(coordinates);
        }
      })
      .catch(loadDefaultCityWeather);

    return () => {
      ignoreResult = true;
    };
  }, [loadCityWeather, loadCoordinatesWeather]);

  return {
    markManualWeatherRequest: () => {
      hasManualWeatherRequestRef.current = true;
    },
  };
}
