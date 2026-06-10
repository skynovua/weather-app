import { MIN_CITY_SEARCH_LENGTH } from '../constants/weather';
import type { FavoriteCity } from '../services/storage';

export function countryToFlag(countryCode: string) {
  if (countryCode.toUpperCase() === 'RU') {
    return '💩';
  }

  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(char.codePointAt(0)! - 65 + 127462))
    .join('');
}

export function getFavoriteCityKey(city: FavoriteCity) {
  return `${city.city.toLowerCase()}-${city.country.toLowerCase()}`;
}

export function getFavoriteCityByName(favoriteCities: FavoriteCity[], city: string) {
  const normalizedCity = city.trim().toLowerCase();

  return favoriteCities.find((favoriteCity) => favoriteCity.city.toLowerCase() === normalizedCity);
}

export function canSearchCity(city: string) {
  return city.trim().length >= MIN_CITY_SEARCH_LENGTH;
}

export function shakeInput(input: HTMLInputElement | null, options: { focus?: boolean } = {}) {
  if (!input) {
    return;
  }

  input.classList.remove('input-error-shake');
  // Примусмово тригерим reflow для коректного повторного застосування анімації
  void input.offsetWidth;
  input.classList.add('input-error-shake');

  if (options.focus) {
    input.focus();
  }
}
