export type AiProviderName = 'openai' | 'claude' | 'gemini';

export interface ProviderConfigDto {
  isConfigured: boolean;
  maskedKey: string | null;
  model: string;
  source: string; // 'database' | 'env' | 'unconfigured'
}

export interface EnvatoConfigDto {
  isConfigured: boolean;
  maskedToken: string | null;
  source: string;
}

export interface AiSettingsDataDto {
  activeProvider: AiProviderName | string;
  providers: {
    claude: ProviderConfigDto;
    gemini: ProviderConfigDto;
    openai: ProviderConfigDto;
    [key: string]: ProviderConfigDto;
  };
  envato?: EnvatoConfigDto;
  updatedAt?: string;
}

export interface AiSettingsResponseDto {
  statusCode: number;
  success: boolean;
  message: string;
  data: AiSettingsDataDto;
  meta?: any;
}

export interface UpdateAiSettingsDto {
  activeProvider?: AiProviderName | string;
  openAiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  envatoApiToken?: string;
}

export interface TestAiProviderDto {
  provider: AiProviderName | string;
}

export interface TestAiProviderResponseDto {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: any;
  meta?: any;
}
