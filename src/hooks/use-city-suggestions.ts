import { useEffect, useReducer, useRef } from 'react';

import { fetchCitySuggestions } from '../services/weather-service';
import type { GeoLocation } from '../types/weather';

type SuggestionsState = {
  error: string;
  query: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  suggestions: GeoLocation[];
};

type SuggestionsAction =
  | { type: 'loading'; query: string }
  | { type: 'success'; query: string; suggestions: GeoLocation[] }
  | { type: 'error'; error: string; query: string };

const initialSuggestionsState: SuggestionsState = {
  error: '',
  query: '',
  status: 'idle',
  suggestions: [],
};

function suggestionsReducer(state: SuggestionsState, action: SuggestionsAction): SuggestionsState {
  switch (action.type) {
    case 'loading':
      return {
        error: '',
        query: action.query,
        status: 'loading',
        suggestions: [],
      };
    case 'success':
      return {
        error: '',
        query: action.query,
        status: 'success',
        suggestions: action.suggestions,
      };
    case 'error':
      return {
        error: action.error,
        query: action.query,
        status: 'error',
        suggestions: [],
      };
    default:
      return state;
  }
}

export function useCitySuggestions(query: string) {
  const [state, dispatch] = useReducer(suggestionsReducer, initialSuggestionsState);
  const timeoutRef = useRef<number | null>(null);
  const trimmedQuery = query.trim();
  const currentState =
    state.query === trimmedQuery
      ? state
      : {
          error: '',
          query: trimmedQuery,
          status: trimmedQuery.length >= 2 ? ('loading' as const) : ('idle' as const),
          suggestions: [],
        };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (trimmedQuery.length < 2) {
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
    }, 300);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [trimmedQuery]);

  return {
    error: currentState.error,
    hasSearched: currentState.status === 'success' || currentState.status === 'error',
    loading: currentState.status === 'loading',
    suggestions: currentState.suggestions,
  };
}
