
import { Package, PackageModels } from '../models/Package';
import { PaginateOptions } from 'mongoose';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const listPackages = async (options: PaginateOptions & { status?: string }) => {
  const { status, ...paginateOptions } = options;
  const query: any = {};
  if (status) {
    query.status = status;
  }
  return PackageModels.paginate(query, paginateOptions);
};

export const createPackage = async (data: Partial<Package>) => {
  const slug = slugify(data.title || '');
  const newPackage = new PackageModels({
    ...data,
    slug,
  });
  return newPackage.save();
};

export const getPackageById = async (id: string) => {
  return PackageModels.findById(id);
};

export const updatePackage = async (id: string, data: Partial<Package>) => {
  if (data.title) {
    data.slug = slugify(data.title);
  }
  return PackageModels.findByIdAndUpdate(id, data, { new: true });
};

export const deletePackage = async (id: string) => {
  return PackageModels.findByIdAndDelete(id);
};
