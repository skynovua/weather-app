import { type FC, type ReactNode } from 'react';

import type { FavoriteCity } from '../services/storage';
import { countryToFlag } from '../utils/city';

interface ConfirmDeleteButtonProps {
  id: string;
  children: ReactNode;
  className: string;
  favoriteCity: FavoriteCity;
  onConfirm: () => void;
}

export const ConfirmDeleteButton: FC<ConfirmDeleteButtonProps> = (props) => {
  const { id, children, className, favoriteCity, onConfirm } = props;
  return (
    <>
      <button type="button" command="show-modal" commandfor={id} className={className}>
        {children}
      </button>

      <dialog
        className="confirm-dialog w-[min(92vw,420px)] rounded-lg border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl shadow-slate-950/20 backdrop:bg-slate-950/35"
        closedby="any"
        id={id}
      >
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <p className="text-sm text-slate-500 uppercase">Обране місто</p>
            <h2 className="text-2xl font-semibold">Видалити {favoriteCity.city}?</h2>
            <p className="text-sm leading-6 text-slate-600">
              {countryToFlag(favoriteCity.country)} {favoriteCity.city}, {favoriteCity.country} буде
              прибрано зі списку обраних. Кеш погоди для цього міста також очиститься.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              value="cancel"
              command="close"
              commandfor={id}
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 focus:border-sky-200 focus:bg-sky-50 focus:text-sky-700 focus:outline-none"
            >
              Скасувати
            </button>
            <button
              type="submit"
              value="delete"
              onClick={onConfirm}
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm text-white shadow-lg shadow-slate-950/20 transition-colors hover:bg-slate-700 focus:bg-slate-700 focus:outline-none"
            >
              Видалити
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};
