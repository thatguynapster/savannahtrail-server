import { FilterQuery, PipelineStage } from 'mongoose';
import PackageCollection, { Package } from '../models/Package';


export const getAllPackages = async () => {
  const packages = await PackageCollection.find().sort({ created_at: -1 });
  return packages;
};

export const getPackageById = async (id: string) => {
  const pkg = await PackageCollection.findById(id);
  if (!pkg) {
    throw new Error('Package not found');
  }
  return pkg;
};

export const getOnePackage = async (filter: any) => {
  const pkg = await PackageCollection.findOne(filter);

  if (!pkg) {
    throw new Error('Package not found');
  }
  return pkg;
};

export const paginatePackages = async (filter: FilterQuery<Package>, options: { [key: string]: any }) => {
  const packages = await PackageCollection.paginate(filter, options);
  return packages;
};

export const aggregatePaginatePackages = async (query: PipelineStage[], options: any) => {
  const packages = await PackageCollection.aggregatePaginate(
    PackageCollection.aggregate(query), options
  );
  return packages;
};

export const createPackage = async (data: Package) => {
  const pkg = await PackageCollection.create(data);
  if (!pkg) {
    throw new Error('Package not created');
  }
  return pkg;
};

export const updatePackageById = async (id: string, data: Partial<Package>) => {
  const pkg = await PackageCollection.findByIdAndUpdate(id, data, { new: true });
  if (!pkg) {
    throw new Error('Package not found');
  }
  return pkg;
};

export const deletePackageById = async (id: string) => {
  const pkg = await PackageCollection.findByIdAndDelete(id);
  if (!pkg) {
    throw new Error('Package not found');
  }
  return pkg;
};

