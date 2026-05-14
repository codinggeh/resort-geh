type Translate = (key: string, values?: Record<string, string | number>) => string;

type AuthProviderError = {
  code?: string | null;
  message?: string | null;
} | null | undefined;

export function mapAuthValidationMessage(message: string | undefined, t: Translate) {
  if (!message) {
    return null;
  }

  const mappedMessages: Record<string, string> = {
    "Invalid email address": t("validation.invalidEmail"),
    "Password must be at least 6 characters": t("validation.passwordMin"),
    "Name must be at least 2 characters": t("validation.nameMin"),
    "Passwords do not match": t("validation.passwordMismatch"),
  };

  return mappedMessages[message] ?? message;
}

const PROVIDER_CODE_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "provider.invalidCredentials",
  USER_NOT_FOUND: "provider.invalidCredentials",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "provider.invalidCredentials",
  USER_ALREADY_EXISTS: "provider.userAlreadyExists",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "provider.userAlreadyExists",
  INVALID_PASSWORD: "provider.invalidPassword",
  PASSWORD_TOO_SHORT: "provider.invalidPassword",
  PASSWORD_TOO_LONG: "provider.invalidPassword",
};

export function mapAuthProviderError(error: AuthProviderError, t: Translate) {
  if (!error) {
    return null;
  }

  const code = error.code?.toUpperCase();
  if (code && code in PROVIDER_CODE_MESSAGES) {
    return t(PROVIDER_CODE_MESSAGES[code]);
  }

  return error.message ?? null;
}

