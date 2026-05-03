type Translate = (key: string, values?: Record<string, string | number>) => string;

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

export function mapAuthProviderError(message: string | undefined, t: Translate) {
  if (!message) {
    return null;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid email or password") ||
    normalized.includes("invalid credentials") ||
    normalized.includes("user not found")
  ) {
    return t("provider.invalidCredentials");
  }

  if (
    normalized.includes("user already exists") ||
    normalized.includes("email already exists") ||
    normalized.includes("already registered")
  ) {
    return t("provider.userAlreadyExists");
  }

  if (normalized.includes("password")) {
    return t("provider.invalidPassword");
  }

  return message;
}
