import { gql } from '@apollo/client';

// ── E-Invoice Provider ──

export const EINVOICE_PROVIDERS_QUERY = gql`
  query SettingsEinvoiceProviders {
    einvoiceProviders {
      success {
        data {
          id
          providerType
          displayName
          description
          isActive
          configs {
            id
            environment
            baseUrl
            defaultCurrencyCode
            defaultSerialPrefix
            defaultFormNo
            defaultPaymentMethod
            isActive
          }
        }
      }
      error { code message }
    }
  }
`;

export const UPDATE_EINVOICE_PROVIDER_CONFIG_MUTATION = gql`
  mutation UpdateEinvoiceProviderConfig($input: UpdateEInvoiceProviderConfigInput!) {
    updateEinvoiceProviderConfig(input: $input) {
      success { data { id baseUrl isActive } }
      error { code message }
    }
  }
`;

export const TOGGLE_EINVOICE_PROVIDER_MUTATION = gql`
  mutation ToggleEinvoiceProvider($id: ID!, $isActive: Boolean!) {
    toggleEinvoiceProvider(id: $id, isActive: $isActive) {
      success { data }
      error { code message }
    }
  }
`;

export interface EinvoiceProviderRow {
  id: string;
  providerType: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  configs: EinvoiceProviderConfigRow[];
}

export interface EinvoiceProviderConfigRow {
  id: string;
  environment: string;
  baseUrl: string;
  defaultSerialPrefix: string;
  defaultFormNo: string;
  defaultCurrencyCode: string;
  defaultPaymentMethod: string;
  isActive: boolean;
}

export const UPDATE_EINVOICE_CREDENTIALS_MUTATION = gql`
  mutation UpdateEinvoiceProviderCredentials($configId: ID!, $credentials: String!) {
    updateEinvoiceProviderCredentials(configId: $configId, credentials: $credentials) {
      success { data }
      error { code message }
    }
  }
`;

export interface EinvoiceProvidersData {
  einvoiceProviders: {
    success: { data: EinvoiceProviderRow[] } | null;
    error: { code: string; message: string } | null;
  };
}

// ── Notification ──

export const MY_NOTIFICATION_CHANNELS_QUERY = gql`
  query SettingsNotificationChannels {
    myNotificationChannels {
      success {
        data {
          id
          channelType
          config
          isActive
        }
      }
      error { code message }
    }
  }
`;

export const MY_NOTIFICATION_PREFERENCES_QUERY = gql`
  query SettingsNotificationPreferences {
    myNotificationPreferences {
      success {
        data {
          id
          eventType
          channels
          isEnabled
        }
      }
      error { code message }
    }
  }
`;

export const UPSERT_NOTIFICATION_CHANNEL_MUTATION = gql`
  mutation UpsertNotificationChannel($input: UpsertNotificationChannelInput!) {
    upsertNotificationChannel(input: $input) {
      success { data { id channelType isActive } }
      error { code message }
    }
  }
`;

export const UPSERT_NOTIFICATION_PREFERENCE_MUTATION = gql`
  mutation UpsertNotificationPreference($input: UpsertNotificationPreferenceInput!) {
    upsertNotificationPreference(input: $input) {
      success { data { id eventType channels isEnabled } }
      error { code message }
    }
  }
`;

export const DELETE_NOTIFICATION_CHANNEL_MUTATION = gql`
  mutation DeleteNotificationChannel($channelType: String!) {
    deleteNotificationChannel(channelType: $channelType) {
      success { data }
      error { code message }
    }
  }
`;

export interface NotificationChannelRow {
  id: string;
  channelType: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface NotificationPreferenceRow {
  id: string;
  eventType: string;
  channels: string[];
  isEnabled: boolean;
}

// ── Platform Info ──

export const PLATFORM_INFO_QUERY = gql`
  query SettingsPlatformInfo {
    platformInfo {
      success {
        data {
          version
          nodeVersion
          uptimeSeconds
          environment
          timestamp
          services {
            database
            redis
          }
        }
      }
      error { code message }
    }
  }
`;

export interface PlatformInfoData {
  platformInfo: {
    success: {
      data: {
        version: string;
        nodeVersion: string;
        uptimeSeconds: number;
        environment: string;
        timestamp: string;
        services: { database: string; redis: string };
      };
    } | null;
    error: { code: string; message: string } | null;
  };
}
