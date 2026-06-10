import { useEffect, useReducer, useRef } from 'react';

import { CITY_SUGGESTIONS_DEBOUNCE_MS, MIN_CITY_SEARCH_LENGTH } from '../constants/weather';
import { fetchCitySuggestions } from '../services/weather-service';
import type { GeoLocation } from '../types/weather';

type SuggestionsStatus = 'idle' | 'loading' | 'success' | 'error';

interface SuggestionsState {
  emptyResultPrefix: string;
  error: string;
  query: string;
  status: SuggestionsStatus;
  suggestions: GeoLocation[];
}

type SuggestionsAction =
  | { type: 'loading'; query: string }
  | { type: 'success'; query: string; suggestions: GeoLocation[] }
  | { type: 'error'; error: string; query: string };

const createIdleResult = (query = ''): SuggestionsState => ({
  emptyResultPrefix: '',
  error: '',
  query,
  status: 'idle',
  suggestions: [],
});

const createLoadingResult = (query: string): SuggestionsState => ({
  emptyResultPrefix: '',
  error: '',
  query,
  status: 'loading',
  suggestions: [],
});

const createSuccessResult = (query: string, suggestions: GeoLocation[]): SuggestionsState => ({
  emptyResultPrefix: suggestions.length === 0 ? query : '',
  error: '',
  query,
  status: 'success',
  suggestions,
});

const initialSuggestionsState: SuggestionsState = {
  ...createIdleResult(),
};

function suggestionsReducer(state: SuggestionsState, action: SuggestionsAction): SuggestionsState {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        error: '',
        query: action.query,
        status: 'loading',
        suggestions: [],
      };
    case 'success': {
      const successResult = createSuccessResult(action.query, action.suggestions);

      return successResult;
    }
    case 'error':
      return {
        ...state,
        emptyResultPrefix: '',
        error: action.error,
        query: action.query,
        status: 'error',
        suggestions: [],
      };
    default:
      return state;
  }
}

function isSearchableQuery(query: string) {
  return query.length >= MIN_CITY_SEARCH_LENGTH;
}

function shouldSkipBecauseEmptyPrefix(query: string, emptyResultPrefix: string) {
  return (
    isSearchableQuery(emptyResultPrefix) &&
    query.length > emptyResultPrefix.length &&
    query.startsWith(emptyResultPrefix)
  );
}

function getVisibleState(query: string, state: SuggestionsState): SuggestionsState {
  if (!isSearchableQuery(query)) {
    return createIdleResult();
  }

  if (shouldSkipBecauseEmptyPrefix(query, state.emptyResultPrefix)) {
    return createSuccessResult(query, []);
  }

  if (state.query === query) {
    return state;
  }

  return createLoadingResult(query);
}

export function useCitySuggestions(query: string) {
  const [state, dispatch] = useReducer(suggestionsReducer, initialSuggestionsState);
  const timeoutRef = useRef<number | null>(null);
  const trimmedQuery = query.trim();
  const shouldSkipRequest = shouldSkipBecauseEmptyPrefix(trimmedQuery, state.emptyResultPrefix);
  const currentState = getVisibleState(trimmedQuery, state);

  const clearPendingRequest = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    clearPendingRequest();

    if (!isSearchableQuery(trimmedQuery)) {
      return;
    }

    if (shouldSkipRequest) {
      return;
    }

    timeoutRef.current = window.setTimeout(async () => {
      dispatch({ type: 'loading', query: trimmedQuery });

      try {
        const results = await fetchCitySuggestions(trimmedQuery);
        dispatch({ type: 'success', query: trimmedQuery, suggestions: results });
      } catch {
        dispatch({
          type: 'error',
          error: 'Не вдалося завантажити підказки міст. Спробуйте ще раз.',
          query: trimmedQuery,
        });
      }
    }, CITY_SUGGESTIONS_DEBOUNCE_MS);

    return clearPendingRequest;
  }, [shouldSkipRequest, trimmedQuery]);

  return {
    error: currentState.error,
    hasSearched: currentState.status === 'success' || currentState.status === 'error',
    loading: currentState.status === 'loading',
    suggestions: currentState.suggestions,
  };
}
