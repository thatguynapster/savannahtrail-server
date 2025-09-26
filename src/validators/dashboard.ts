import Joi from "joi";

interface GetKpisQuery {
    date_from: Date;
    date_to: Date;
}

export const validateGetKpisQuery = async (query: unknown): Promise<GetKpisQuery> => {
    const schema = Joi.object({
        date_from: Joi.date().iso().required(),
        date_to: Joi.date().iso().required().min(Joi.ref("date_from")),
    });

    return (await schema.validateAsync(query, {
        abortEarly: false,
        stripUnknown: true,
    })) as GetKpisQuery;
};
