import { NextFunction, Request, Response } from "express";
import { uploadImageToS3 } from "../functions/uploader";
import { uploadFileValidator } from "../validators/extension";

export const uploadfileControler = async (req: Request, res: Response, next: NextFunction) => {
    try {

       const file = req.file as Express.Multer.File;

       const {  folder, file_name } = await uploadFileValidator(req.body);

       if (!file) {
           return res.status(400).send({
               success: false,
               code: 400,
               message: "No files uploaded",
           });
       }

         const uploadDetails = await uploadImageToS3({
             file: file.buffer,
                filename: file_name,
                folder: folder ? folder : "others",
         });

       return res.status(200).send({
           success: true,
           code: 200,
           message: "Files uploaded successfully",
           responses: uploadDetails,
       });
   } catch (err) {
       next(err);
   }
};

export const uploadMultipleFilesControler = async (req: Request, res: Response, next: NextFunction) => {
    try {

       const files = req.files as Express.Multer.File[];

       const { file_name,  folder } = await uploadFileValidator(req.body);

       if (!files || files.length === 0) {
           return res.status(400).send({
               success: false,
               code: 400,
               message: "No files uploaded",
           });
       }

         const uploadDetails = await Promise.all(
             files.map(async (file) => {
                 const details = await uploadImageToS3({
                     file: file.buffer,
                     filename: file_name ? file_name : file.originalname,
                     folder: folder ? folder : "others",
                 });
                 return details;
             })
         );

       return res.status(200).send({
           success: true,
           code: 200,
           message: "Files uploaded successfully",
           responses: uploadDetails,
       });
   } catch (err) {
       next(err);
   }
};