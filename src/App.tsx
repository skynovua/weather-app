import { useEffect, useState } from 'react';

import { FavoriteCitiesList } from './components/favorite-cities-list';
import { SearchForm } from './components/search-form';
import { WeatherCard } from './components/weather-card';
import { useInitialLocationWeather } from './hooks/use-initial-location-weather';
import { useWeather } from './hooks/use-weather';
import { type FavoriteCity, readFavoriteCities, writeFavoriteCities } from './services/storage';
import { getFavoriteCityByName, getFavoriteCityKey } from './utils/city';

function App() {
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>(readFavoriteCities);
  const {
    weather,
    loading,
    error: weatherError,
    errorVersion: weatherErrorVersion,
    forecast,
    loadCityWeather,
    loadCoordinatesWeather,
    clearError: clearWeatherError,
    cacheCurrentWeather,
    removeCachedWeather,
  } = useWeather();
  const { markManualWeatherRequest } = useInitialLocationWeather({
    loadCoordinatesWeather,
  });
  const currentWeatherFavoriteKey = weather
    ? getFavoriteCityKey({ city: weather.city, country: weather.country })
    : '';
  const isCurrentCityFavorite = favoriteCities.some(
    (favoriteCity) => getFavoriteCityKey(favoriteCity) === currentWeatherFavoriteKey,
  );
  const currentFavoriteCity = weather
    ? {
        city: weather.city,
        country: weather.country,
      }
    : null;

  useEffect(() => {
    writeFavoriteCities(favoriteCities);
  }, [favoriteCities]);

  const handleFavoriteCityOpen = (favoriteCity: FavoriteCity) => {
    if (weather && favoriteCity.city === weather.city) {
      return;
    }

    markManualWeatherRequest();
    clearWeatherError();
    loadCityWeather(favoriteCity.city, { useCache: true });
  };

  const handleFavoriteCityAdd = () => {
    if (!weather) {
      return;
    }

    const favoriteCity = {
      city: weather.city,
      country: weather.country,
    };
    const favoriteCityKey = getFavoriteCityKey(favoriteCity);

    setFavoriteCities((currentFavorites) => {
      if (
        currentFavorites.some(
          (currentFavorite) => getFavoriteCityKey(currentFavorite) === favoriteCityKey,
        )
      ) {
        return currentFavorites;
      }

      return [favoriteCity, ...currentFavorites];
    });
    cacheCurrentWeather();
  };

  const handleFavoriteCityRemove = (favoriteCity: FavoriteCity) => {
    const favoriteCityKey = getFavoriteCityKey(favoriteCity);

    setFavoriteCities((currentFavorites) =>
      currentFavorites.filter(
        (favoriteCity) => getFavoriteCityKey(favoriteCity) !== favoriteCityKey,
      ),
    );
    removeCachedWeather(favoriteCity.city);
  };

  const handleCitySearch = (city: string) => {
    markManualWeatherRequest();
    loadCityWeather(city, {
      useCache: Boolean(getFavoriteCityByName(favoriteCities, city)),
    });
  };

  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 text-slate-950 motion-safe:transition-colors motion-safe:duration-500 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="content-rise relative z-20 space-y-8">
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl font-bold text-balance sm:text-6xl">Weather App</h1>
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

          <SearchForm
            loading={loading}
            onClearWeatherError={clearWeatherError}
            onSearchCity={handleCitySearch}
            weatherError={weatherError}
            weatherErrorVersion={weatherErrorVersion}
          />

          <FavoriteCitiesList
            favoriteCities={favoriteCities}
            selectedCityKey={currentWeatherFavoriteKey}
            onOpenCity={handleFavoriteCityOpen}
            onRemoveCity={handleFavoriteCityRemove}
          />
        </div>

        <WeatherCard
          favoriteCity={currentFavoriteCity}
          forecast={forecast}
          isFavorite={isCurrentCityFavorite}
          onAddFavorite={handleFavoriteCityAdd}
          onRemoveFavorite={handleFavoriteCityRemove}
          weather={weather}
        />
      </section>
    </main>
  );
}

export default App;
