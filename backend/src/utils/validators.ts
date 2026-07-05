export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// At least 8 chars, one uppercase, one lowercase, one number
export const isValidPassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
};

export const passwordRequirementsMessage =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.";
