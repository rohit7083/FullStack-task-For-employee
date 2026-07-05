import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const JWT_REMEMBER_EXPIRES_IN = process.env.JWT_REMEMBER_EXPIRES_IN || "30d";

export interface TokenPayload {
  id: number;
  role: "Admin" | "Employee";
  email: string;
}

export const generateToken = (payload: TokenPayload, rememberMe = false): string => {
  const options: SignOptions = {
    expiresIn: (rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_EXPIRES_IN) as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
