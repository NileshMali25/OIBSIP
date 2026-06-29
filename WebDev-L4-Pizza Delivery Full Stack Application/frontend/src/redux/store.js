import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import cartReducer from './cartSlice';

const authTransform = createTransform(
  // Transform state before saving to storage
  (inboundState, key) => {
    if (key === 'auth') {
      return { ...inboundState, loading: false, error: null };
    }
    return inboundState;
  },
  // Transform state when restoring from storage
  (outboundState, key) => {
    if (key === 'auth') {
      return { ...outboundState, loading: false, error: null };
    }
    return outboundState;
  },
  { whitelist: ['auth'] }
);

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'cart'], // Save auth and cart slices to LocalStorage
  transforms: [authTransform]
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
