import UserCollection from "../models/User";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken, verifyToken } from "../functions/jwt";

export const authenticateUser = async (email: string, password: string) => {
    const user = await UserCollection.findOne({ email }).lean();
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;

    const base = { sub: String(user._id), role: user.role, perms: user.permissions, tv: user.tokenVersion };
    const token = signAccessToken(base);
    const refresh = signRefreshToken(base);

    return {
        user: {
            id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            created_at: user.created_at,
        },
        token,
        refresh,
    };
};

export const rotateRefreshToken = async (refreshToken: string) => {
    // Rotation logic removed
    const payload = verifyToken<any>(refreshToken);
    const userId = payload.sub as string;

    const user = await UserCollection.findById(userId).lean();
    if (!user) return null;
    // Invalidate if tokenVersion changed
    if (payload.tv !== user.tokenVersion) return null;

    const base = { sub: String(user._id), role: user.role, perms: user.permissions, tv: user.tokenVersion };
    const token = signAccessToken(base);
    const newRefresh = signRefreshToken(base);

    return {
        token,
        refresh: newRefresh,
        user: {
            id: String(user._id),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            created_at: user.created_at,
        },
    };
};

export const logoutAllSessions = async (userId: string) => {
    await UserCollection.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

export const createUserService = async (input: { name?: string | null; email: string; password: string; role: "admin" | "operations" | "finance" | "support" | "guide"; permissions: string[] }) => {
    const exists = await UserCollection.findOne({ email: input.email }).lean();
    if (exists) throw new Error("User with this email already exists");

    const password_hash = await bcrypt.hash(input.password, 12);

    const doc = await UserCollection.create({
        email: input.email,
        name: input.name,
        role: input.role,
        permissions: input.permissions,
        password_hash,
    });

    // return safe/public fields only
    return {
        id: String(doc._id),
        email: doc.email,
        name: doc.name,
        role: doc.role,
        permissions: doc.permissions,
        created_at: doc.created_at,
    };
};
