import jwt from "jsonwebtoken";
import config from "./config";

export const generateToken = (user: any) => {
  return jwt.sign(
    { user_id: user.user_id, username: user.username, is_admin: user.is_admin },
    config.JWT_ACCESS_TOKEN,
    { expiresIn: config.JWT_EXPIRES_IN_ACCESS }
  );
};
export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { user_id: user.user_id, username: user.username, is_admin: user.is_admin },
    config.JWT_REFRESH_TOKEN,
    { expiresIn: config.JWT_EXPIRES_IN_REFRESH }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.JWT_ACCESS_TOKEN);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_TOKEN);
};