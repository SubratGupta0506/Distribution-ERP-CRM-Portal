import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT) || 5000;

export const JWT_SECRET =
  process.env.JWT_SECRET || "fundstrom_super_secret_key_change_later";