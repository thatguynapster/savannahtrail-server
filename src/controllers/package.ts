
import { Request, Response, NextFunction } from 'express';
import {
  listPackages,
  createPackage,
  getPackageById,
  updatePackage,
  deletePackage,
} from '../services/packages';

export const getPackagesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: { created_at: -1 },
      lean: true,
      customLabels: {
        totalDocs: 'total',
        docs: 'data',
        limit: 'limit',
        page: 'page',
        totalPages: 'pages',
        pagingCounter: false,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: false,
        nextPage: false,
      },
    };
    const packages = await listPackages({ status: status as string, ...options });
    return res.status(200).json(packages);
  } catch (err) {
    next(err);
  }
};

export const createPackageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newPackage = await createPackage(req.body);
    return res.status(201).json(newPackage);
  } catch (err) {
    next(err);
  }
};

export const getPackageByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pkg = await getPackageById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    return res.status(200).json(pkg);
  } catch (err) {
    next(err);
  }
};

export const updatePackageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedPackage = await updatePackage(req.params.id, req.body);
    if (!updatedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }
    return res.status(200).json(updatedPackage);
  } catch (err) {
    next(err);
  }
};

export const deletePackageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedPackage = await deletePackage(req.params.id);
    if (!deletedPackage) {
      return res.status(404).json({ error: 'Package not found' });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
