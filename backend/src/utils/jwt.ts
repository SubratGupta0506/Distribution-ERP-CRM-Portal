import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

export interface JwtPayload {
  userId: number;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};