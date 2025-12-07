import { Request, Response, NextFunction } from "express";
import { FilterQuery, PipelineStage } from "mongoose";
import { Package } from "../models/Package";
import { aggregatePaginatePackages, createPackage, getPackageById, updatePackageById } from "../services/packages";
import { CreatePackageValidate, UpdatePackageValidate } from "../validators/package";
import { uploadImageToS3 } from "../functions/uploader";

export const getAllPackagesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            sort: { _id: -1 },
            lean: true,
            customLabels: {
                totalDocs: "total",
                limit: "limit",
                page: "page",
                totalPages: "pages",
                pagingCounter: false,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: false,
                nextPage: false,
            },
            pagination: true, // had to set this to true so the limit would work
        };

        const match_query = {} as FilterQuery<Package>;
        const query = [] as PipelineStage[];

        if (filters.status) {
            match_query.status = filters.status as string;
        }

        query.push({ $match: match_query });

        const packages = await aggregatePaginatePackages(query, options);

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Packages retrieved successfully",
            responses: packages,
        });
    } catch (err) {
        next(err);
    }
};

export const paginatePackagesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;

        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            sort: { _id: -1 },
            lean: true,
            customLabels: {
                totalDocs: "total",
                limit: "limit",
                page: "page",
                totalPages: "pages",
                pagingCounter: false,
                hasPrevPage: false,
                hasNextPage: false,
                prevPage: false,
                nextPage: false,
            },
        };

        const query = [] as PipelineStage[];

        const match_query = {} as FilterQuery<Package>;

        if (filters.status) {
            match_query.status = filters.status as string;
        }

        query.push({ $match: match_query });
        const packages = await aggregatePaginatePackages(query, options);

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Packages retrieved successfully",
            responses: packages,
        });
    } catch (err) {
        next(err);
    }
};

export const getPackageByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const pkg = await getPackageById(id);
        return res.status(200).send({
            success: true,
            code: 200,
            message: "Package retrieved successfully",
            responses: pkg,
        });
    } catch (err) {
        next(err);
    }
};

export const createPackageController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const media_files = req.files as Express.Multer.File[]; //get media files

        // let upload_media: string[] = [];
        const data = req.body;
        const package_body = await CreatePackageValidate(data);

        //upload files
        // if (media_files.length > 0) {
        //     upload_media = await Promise.all(
        //         media_files.map(async (media) => {
        //             const upload_details = await uploadImageToS3({
        //                 file: media.buffer,
        //                 filename: media.originalname,
        //                 folder: "packages",
        //             });
        //             return upload_details.url;
        //         })
        //     );
        // }

        // package_body.images = upload_media;
        const pkg = await createPackage(package_body);
        return res.status(201).send({
            success: true,
            code: 201,
            message: "Package created successfully",
            responses: pkg,
        });
    } catch (err) {
        next(err);
    }
};

export const updatePackageByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // const media_files = req.files as Express.Multer.File[]; //get media files

        // let upload_media: string[] = [];
        const pkg = await getPackageById(id);
        const update_body = await UpdatePackageValidate(data);

        // if (media_files.length > 0) {
        //     upload_media = await Promise.all(
        //         media_files.map(async (media) => {
        //             const upload_details = await uploadImageToS3({
        //                 file: media.buffer,
        //                 filename: media.originalname,
        //                 folder: "packages",
        //             });
        //             return upload_details.url;
        //         })
        //     );
        // }

        const updatedPkg = await updatePackageById(pkg._id!.toString(), update_body);
        // update_body.images = upload_media;

        return res.status(200).send({
            success: true,
            code: 200,
            message: "Package updated successfully",
            responses: updatedPkg,
        });
    } catch (err) {
        next(err);
    }
};

export const deletePackageByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const pkg = await updatePackageById(id, { status: "inactive" });
        return res.status(200).send({
            success: true,
            code: 200,
            message: "Package deleted successfully",
            responses: pkg,
        });
    } catch (err) {
        next(err);
    }
};
