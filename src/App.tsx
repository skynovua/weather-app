import { useEffect, useState } from 'react';

import { FavoriteCitiesList } from './components/favorite-cities-list';
import { SearchForm } from './components/search-form';
import { WeatherCard } from './components/weather-card';
import { WeatherLogoIcon } from './components/weather-logo-icon';
import { useInitialLocationWeather } from './hooks/use-initial-location-weather';
import { useWeather } from './hooks/use-weather';
import { type FavoriteCity, readFavoriteCities, writeFavoriteCities } from './services/storage';
import { getFavoriteCityByName, getFavoriteCityKey } from './utils/city';
import { getWeatherTheme } from './utils/weather-theme';

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
    <main
      className="app-shell min-h-screen overflow-hidden px-4 py-6 text-slate-950 sm:px-6 lg:px-8"
      data-weather-theme={getWeatherTheme(weather)}
    >
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col justify-center gap-7">
        <div className="content-rise relative z-20 grid items-center gap-5 lg:grid-cols-[520px_minmax(0,1fr)]">
          <h1 className="flex items-center gap-3 text-4xl font-bold text-balance sm:gap-4 sm:text-6xl">
            <WeatherLogoIcon className="h-12 w-12 shrink-0 drop-shadow-sm sm:h-16 sm:w-16" />
            <span className="tracking-tighter">Weather App</span>
          </h1>

          <div className="max-w-4xl">
            <SearchForm
              loading={loading}
              onClearWeatherError={clearWeatherError}
              onSearchCity={handleCitySearch}
              weatherError={weatherError}
              weatherErrorVersion={weatherErrorVersion}
            />
          </div>
        </div>

        <FavoriteCitiesList
          favoriteCities={favoriteCities}
          selectedCityKey={currentWeatherFavoriteKey}
          onOpenCity={handleFavoriteCityOpen}
          onRemoveCity={handleFavoriteCityRemove}
        />

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
