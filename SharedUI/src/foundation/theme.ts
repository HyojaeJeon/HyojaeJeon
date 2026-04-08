import { sharedUiTokens } from './tokens';

export const sharedUiTheme = {
  name: 'platform-shared-ui',
  tokens: sharedUiTokens,
  surfaces: {
    body: sharedUiTokens.colors.page,
    panel: sharedUiTokens.colors.surface,
    panelMuted: sharedUiTokens.colors.surfaceMuted,
  },
} as const;

