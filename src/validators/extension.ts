import Joi from "joi";

export const uploadFileValidator = async (
    body: unknown
  ): Promise<{file_name : string, folder?: string}> => {
    const schema = Joi.object({
        file_name: Joi.string().required(),
        folder : Joi.string().optional(),
    });
  
    return (await schema.validateAsync(body, {
      abortEarly: false,
    })) as {file_name : string, folder?: string};
  };