import jwt from "jsonwebtoken";
import moment from "moment";
import RefreshTokenModel, { RefreshToken } from "../models/RefreshToken";
import { User }from "../models/User";



export const login = async (email, password) => {
  const user = User.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const expires_at = moment().add(1, "hour").toISOString();

  const refreshToken = new RefreshTokenModel({
    token: jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET),
    user_id: user._id,
  });

  await refreshToken.save();

  return { user, token, expires_at, refreshToken: refreshToken.token };
};

export const logout = async (refreshToken: string) => {
  await RefreshTokenModel.deleteOne({ token: refreshToken });
};

export const refreshToken = async (token: string) => {
  const refreshToken = await RefreshTokenModel.findOne({ token });

  if (!refreshToken) {
    throw new Error("Invalid refresh token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.userId;

    const newToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const expires_at = moment().add(1, "hour").toISOString();

    return { token: newToken, expires_at };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};
