import { type Dispatch, type RefObject, type SetStateAction, useEffect } from 'react';

import { ERROR_MESSAGE_TIMEOUT_MS } from '../constants/weather';
import { shakeInput } from '../utils/city';

export function useInputErrorFeedback({
  inputRef,
  searchError,
  searchErrorVersion,
  setSearchError,
  weatherError,
  weatherErrorVersion,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  searchError: string;
  searchErrorVersion: number;
  setSearchError: Dispatch<SetStateAction<string>>;
  weatherError: string;
  weatherErrorVersion: number;
}) {
  useEffect(() => {
    if (!searchError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSearchError('');
      inputRef.current?.classList.remove('input-error-shake');
    }, ERROR_MESSAGE_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [inputRef, searchError, searchErrorVersion, setSearchError]);

  useEffect(() => {
    if (weatherError) {
      shakeInput(inputRef.current);
    }
  }, [inputRef, weatherError, weatherErrorVersion]);
}
