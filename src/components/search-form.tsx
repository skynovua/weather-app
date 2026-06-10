import {
  type ChangeEvent,
  type FC,
  type FocusEvent,
  type SubmitEvent,
  useRef,
  useState,
} from 'react';

import { MIN_CITY_SEARCH_LENGTH } from '../constants/weather';
import { useCitySuggestions } from '../hooks/use-city-suggestions';
import { useInputErrorFeedback } from '../hooks/use-inpute-error-feedback';
import { canSearchCity, shakeInput } from '../utils/city';
import { cn } from '../utils/cn';
import { SearchSuggestionsDropdown } from './search-suggestions-dropdown';

interface SearchFormProps {
  loading: boolean;
  weatherError: string;
  weatherErrorVersion: number;
  onClearWeatherError: () => void;
  onSearchCity: (city: string) => void;
}

export const SearchForm: FC<SearchFormProps> = (props) => {
  const { loading, weatherError, weatherErrorVersion, onClearWeatherError, onSearchCity } = props;

  const [city, setCity] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchErrorVersion, setSearchErrorVersion] = useState(0);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const {
    error: suggestionsError,
    hasSearched: hasSearchedSuggestions,
    loading: suggestionsLoading,
    suggestions,
  } = useCitySuggestions(city);
  const canSearch = canSearchCity(city);
  const shouldShowSuggestions = isSuggestionsOpen && canSearch;
  const searchInlineError = searchError || weatherError;
  const shouldShowEmptySuggestions =
    shouldShowSuggestions &&
    hasSearchedSuggestions &&
    !suggestionsLoading &&
    suggestions.length === 0;
  const shouldDisableSubmit = loading || (hasSearchedSuggestions && suggestions.length === 0);
  const inputClassName = cn(
    'h-12 w-full rounded-md border bg-white px-4 pr-12 text-base text-slate-950 outline-none transition-[border-color,box-shadow] duration-200',
    searchInlineError
      ? 'border-red-600 focus:border-red-600 focus:ring-0'
      : 'border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100',
  );
  const errorClassName = cn(
    'md:absolute top-full left-0 mt-1 text-sm text-red-600 transition-opacity duration-150',
    searchInlineError ? 'error-reveal opacity-100' : 'pointer-events-none opacity-0',
  );

  useInputErrorFeedback({
    inputRef: cityInputRef,
    searchError,
    searchErrorVersion,
    setSearchError,
    weatherError,
    weatherErrorVersion,
  });

  const handleCityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setCity(value);
    setSearchError('');
    onClearWeatherError();
    setIsSuggestionsOpen(canSearchCity(value));
  };

  const handleCitySelect = (selectedCity: string) => {
    cityInputRef.current?.blur();
    setCity('');
    setIsSuggestionsOpen(false);
    onSearchCity(selectedCity);
  };

  const handleSuggestionsBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsSuggestionsOpen(false);
    }
  };

  const showSearchValidationError = () => {
    setSearchError(`Введіть щонайменше ${MIN_CITY_SEARCH_LENGTH} символи для пошуку погоди.`);
    setSearchErrorVersion((currentVersion) => currentVersion + 1);
    shakeInput(cityInputRef.current, { focus: true });
  };

  const handleSearchSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formattedCity = city.trim();

    if (!canSearchCity(formattedCity)) {
      setIsSuggestionsOpen(false);
      showSearchValidationError();
      return;
    }

    setSearchError('');
    setIsSuggestionsOpen(false);
    onSearchCity(formattedCity);
  };

  return (
    <form
      className="relative z-30 flex w-full flex-col gap-3 md:flex-row"
      onSubmit={handleSearchSubmit}
    >
      <div className="relative min-w-0 flex-1" onBlur={handleSuggestionsBlur}>
        <label className="sr-only" htmlFor="city">
          Назва міста
        </label>
        <input
          ref={cityInputRef}
          id="city"
          value={city}
          onChange={handleCityChange}
          onFocus={() => setIsSuggestionsOpen(canSearch)}
          placeholder="Наприклад, Харків"
          aria-invalid={Boolean(searchInlineError)}
          aria-describedby="search-error"
          className={inputClassName}
          autoComplete="off"
        />
        {searchInlineError && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-6 right-4 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full border-2 border-red-600 text-xs leading-none font-bold text-red-600"
          >
            !
          </span>
        )}

        {shouldShowSuggestions && (
          <SearchSuggestionsDropdown
            error={suggestionsError}
            loading={suggestionsLoading}
            onSelectCity={handleCitySelect}
            shouldShowEmpty={shouldShowEmptySuggestions}
            suggestions={suggestions}
          />
        )}

        <p id="search-error" className={errorClassName} aria-live="polite">
          {searchInlineError || ' '}
        </p>
      </div>

      <button
        type="submit"
        disabled={shouldDisableSubmit}
        className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-6 text-sm text-white shadow-lg shadow-slate-950/20 transition-all duration-200 hover:bg-slate-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? 'Шукаю...' : 'Пошук'}
      </button>
    </form>
  );
};
