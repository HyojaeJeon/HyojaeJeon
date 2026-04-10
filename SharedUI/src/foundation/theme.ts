import { sharedUiTokens } from './tokens';

export const sharedUiTheme = {
  name: 'platform-shared-ui',
  tokens: sharedUiTokens,
} as const;

export type SharedUiTheme = typeof sharedUiTheme;
