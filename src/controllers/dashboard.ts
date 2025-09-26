import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard";
import { validateGetKpisQuery } from "../validators/dashboard";
import Joi from "joi";

export const getKpis = async (req: Request, res: Response) => {
    try {
        const validatedQuery = await validateGetKpisQuery(req.query);

        const kpis = await dashboardService.getKpis(validatedQuery.date_from, validatedQuery.date_to);

        res.status(200).json(kpis);
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            const errors = error.details.map((detail) => ({
                message: detail.message,
                path: detail.path,
            }));
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
};
