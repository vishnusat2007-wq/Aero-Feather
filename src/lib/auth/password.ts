export const MIN_PASSWORD_LENGTH = 6;

export type PasswordFormState = {
  error?: string;
  success?: boolean;
};

export function validateNewPassword(
  password: string,
  confirm: string,
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password !== confirm) {
    return "Passwords do not match";
  }
  return null;
}
