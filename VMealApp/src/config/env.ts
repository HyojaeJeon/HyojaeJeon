import Config from 'react-native-config';

export const ENV = {
  CENTRAL_API_HTTP: Config.CENTRAL_API_HTTP ?? 'http://localhost:4000/graphql',
  CENTRAL_API_WS: Config.CENTRAL_API_WS ?? 'ws://localhost:4000/graphql',
  GOOGLE_MAPS_API_KEY: Config.GOOGLE_MAPS_API_KEY ?? '',
} as const;
