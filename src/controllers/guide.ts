import { Request, Response, NextFunction } from "express";
import { FilterQuery, PipelineStage } from "mongoose";
import GuideCollection, { Guide } from "../models/Guide";
import { aggregatePaginateGuides, createGuide, getGuideById, updateGuideById } from "../services/guide";
import { CreateGuideValidate, UpdateGuideValidate } from "../validators/guide";
import { uploadImageToS3 } from "../functions/uploader";
import { parseDateRange } from "../functions/utils";

export const getAllGuidesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const options = {
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
      pagination: false,
    };

    const match_query = {} as FilterQuery<Guide>;
    const query = [] as PipelineStage[];

    if (filters.status) {
      match_query.status = filters.status as string;
    }

    query.push({ $match: match_query });

    const guides = await aggregatePaginateGuides(query, options);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Guides retrieved successfully",
      responses: guides,
    });
  } catch (err) {
    next(err);
  }
};

export const paginateGuidesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const match_query = {} as FilterQuery<Guide>;
    const query = [] as PipelineStage[];

    if (filters.status) {
      match_query.status = filters.status as string;
    }

    if (filters.name) {
      match_query.name = {
        $regex: new RegExp(filters.name as string, "i"),
      };
    }

    const guides = await aggregatePaginateGuides(query, options);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Guides retrieved successfully",
      responses: guides,
    });
  } catch (err) {
    next(err);
  }
};

export const getGuideByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const guide = await getGuideById(id);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Guide retrieved successfully",
      response: guide,
    });
  } catch (err) {
    next(err);
  }
};

export const createGuideController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const guideData = req.body;

    // if (!req.file) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "No file uploaded" });
    // }

    //validation
    const guideBody = await CreateGuideValidate(guideData);

    //upload image to s3
    // const folder = "guides";
    // const result = await uploadImageToS3({
    //   file: req.file.buffer,
    //   filename: req.file.originalname,
    //   folder,
    // });

    // guideBody.photo_url = result.url;
    // Create guide
    const newGuide = await createGuide(guideBody);

    return res.status(201).send({
      success: true,
      code: 201,
      message: "Guide created successfully",
      response: newGuide,
    });
  } catch (err) {
    next(err);
  }
};


export const updateGuideController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const guideData = req.body;

    //validation
    const guideBody = await UpdateGuideValidate(guideData);

    if (req.file) {
      //upload image to s3
      const folder = "guides";
      const result = await uploadImageToS3({
        file: req.file.buffer,
        filename: req.file.originalname,
        folder,
      });

      guideBody.photo_url = result.url;
    }

    // Update guide
    const updatedGuide = await updateGuideById(id, guideBody);

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Guide updated successfully",
      response: updatedGuide,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteGuideController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deletedGuide = await updateGuideById(id, { status: "inactive" });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Guide deleted successfully",
      response: deletedGuide,
    });
  } catch (err) {
    next(err);
  }
};

export const availableGuidesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
        // Parse date or range
        const { start, end } = parseDateRange(req.query as { start_date: any; end_date: any; date: any });

        // Optional filters/pagination from query
        const page  = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10) || 20));
        const status = (req.query.status as string) || "active"; // default only active guides
    
        // Booking statuses that make a guide "busy"
        const BUSY_BOOKING_STATUSES = ["pending", "confirmed"];
    
        // --- AGG PIPELINE ---
        const pipeline: PipelineStage[] = [
          // Start from guides (optionally only active)
          { $match: status ? { status } : {} },
    
          // For joining by string id
          { $addFields: { id_str: { $toString: "$_id" } } },
    
          // Lookup bookings that collide with the requested window
          {
            $lookup: {
              from: "Bookings",
              let: { gid: "$id_str" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$assigned_guide_id", "$$gid"] },
                    tour_date: { $gte: start, $lt: end },
                    booking_status: { $in: BUSY_BOOKING_STATUSES },
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "busyBookings",
            },
          },
    
          // Compute busy flag and keep only not-busy
          { $addFields: { is_busy: { $gt: [{ $size: "$busyBookings" }, 0] } } },
          { $match: { is_busy: false } },
    
          // Optional: project away helper fields
          { $project: { busyBookings: 0, is_busy: 0, id_str: 0 } },
        ];

        pipeline.splice(pipeline.length - 1, 0,
          {
            $addFields: {
              blockedOnDate: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$availability",
                        as: "av",
                        cond: {
                          $and: [
                            { $gte: ["$$av.date", start] },
                            { $lt: ["$$av.date", end] },
                            { $eq: ["$$av.available", false] }
                          ]
                        }
                      }
                    }
                  },
                  0
                ]
              }
            }
          },
          { $match: { blockedOnDate: { $ne: true } } },
          { $project: { blockedOnDate: 0 } }
        );
        
    
        // Aggregate + paginate
        const aggregate = GuideCollection.aggregate(pipeline);
        // @ts-ignore - provided by mongoose-aggregate-paginate-v2
        const guides = await GuideCollection.aggregatePaginate(aggregate, {
          page,
          limit,
          sort: { _id: -1 },
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
          lean: true,
          pagination: true,
        });
    
        return res.status(200).json({
          success: true,
          code: 200,
          message: "Available guides retrieved successfully",
          responses: guides,
        });

  } catch (err) {
    next(err);
  }
};