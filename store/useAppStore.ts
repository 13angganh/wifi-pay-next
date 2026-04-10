// store/useAppStore.ts — Compose semua slices
// authSlice   → uid, email, name
// dataSlice   → appData, syncStatus
// viewSlice   → zone, view, entry state, lock, member tab
// uiSlice     → darkMode, sidebar, PWA prompt
// exportSlice → share/export state

import { create } from 'zustand';
import { createAuthSlice,   type AuthSlice   } from './slices/authSlice';
import { createDataSlice,   type DataSlice   } from './slices/dataSlice';
import { createViewSlice,   type ViewSlice   } from './slices/viewSlice';
import { createUiSlice,     type UiSlice     } from './slices/uiSlice';
import { createExportSlice, type ExportSlice } from './slices/exportSlice';

export type AppStore = AuthSlice & DataSlice & ViewSlice & UiSlice & ExportSlice;

export const useAppStore = create<AppStore>((...a) => ({
  ...createAuthSlice(...a),
  ...createDataSlice(...a),
  ...createViewSlice(...a),
  ...createUiSlice(...a),
  ...createExportSlice(...a),
}));

export type { AuthSlice, DataSlice, ViewSlice, UiSlice, ExportSlice };
