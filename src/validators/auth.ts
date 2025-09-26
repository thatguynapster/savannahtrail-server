import Joi from "joi";
import { User } from "../models/User";

export const loginSchemaValidate = async (body: unknown): Promise<{ email: string; password: string }> => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    });

    return (await schema.validateAsync(body, {
        abortEarly: false,
    })) as { email: string; password: string };
};

export const createUserSchemaValidate = async (body: unknown): Promise<User & { password: string }> => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid("admin", "operations", "finance", "support", "guide").default("support"),
        permissions: Joi.array().items(Joi.string()).default([]),
    });

    return (await schema.validateAsync(body, {
        abortEarly: false,
    })) as User & { password: string };
};
