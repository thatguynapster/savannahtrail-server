import { Request, Response, NextFunction } from "express";
import { createUserSchemaValidate, loginSchemaValidate } from "../validators/auth";
import { authenticateUser, rotateRefreshToken, logoutAllSessions, createUserService } from "../services/auth";

const cookieName = "st_refresh";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const login = await loginSchemaValidate(req.body);

        const result = await authenticateUser(login.email, login.password);

        if (!result) return res.status(401).json({ success: false, message: "Invalid credentials" });

        // Set httpOnly refresh cookie (secure in prod)
        const isProd = process.env.NODE_ENV === "production";
        res.cookie(cookieName, result.refresh, {
            httpOnly: true,
            secure: isProd,
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: Number(process.env.JWT_REFRESH_TTL || 90) * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Login successful",
            response: {
                user: result.user,
                token: result.token,
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // align with access TTL if you changed it
            },
        });
    } catch (error) {
        next(error);
    }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    const fromCookie = req.cookies?.[cookieName] as string | undefined;
    const tokenStr = fromCookie || req.body?.refresh_token; // fallback for non-browser clients
    if (!tokenStr) return res.status(401).json({ success: false, message: "Missing refresh token" });

    try {
        const rotated = await rotateRefreshToken(tokenStr);
        if (!rotated) return res.status(401).json({ success: false, message: "Invalid refresh token" });

        // refresh cookie
        const isProd = process.env.NODE_ENV === "production";
        res.cookie(cookieName, rotated.refresh, {
            httpOnly: true,
            secure: isProd,
            sameSite: "strict",
            path: "/auth/refresh",
            maxAge: Number(process.env.JWT_REFRESH_TTL || 90) * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            code: 200,
            message: "Token refreshed successfully",
            response: {
                user: rotated.user,
                token: rotated.token,
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // align with access TTL if you changed it
            },
        });
    } catch {
        next();
    }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fromCookie = req.cookies?.[cookieName] as string | undefined;
        const tokenStr = fromCookie || req.body?.refresh_token; // fallback for non-browser clients
        if (!tokenStr) return res.status(401).json({ success: false, message: "Missing refresh token" });

        await logoutAllSessions(tokenStr);
        res.clearCookie(cookieName);
        return res.status(200).json({ success: true, message: "Logout successful", code: 200, response: null });
    } catch {
        next();
    }
};

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dto = await createUserSchemaValidate(req.body);
        const user = await createUserService({
            ...dto,
        });

        return res.status(201).json({ success: true, message: "User created successfully", code: 201, response: user });
    } catch (error) {
        next(error);
    }
};

// export const logout = async (req: Request, res: Response) => {
//   try {
//     const { refreshToken } = req.body;
//     await authService.logout(refreshToken);
//     res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const refreshToken = async (req: Request, res: Response) => {
//   try {
//     const { refreshToken } = req.body;
//     const data = await authService.refreshToken(refreshToken);
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
