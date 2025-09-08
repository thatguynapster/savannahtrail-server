import { FilterQuery, PipelineStage } from 'mongoose';
import GuideCollection , {Guide} from '..//models/Guide'


export const getAllGuides = async () => {
  const guides = await GuideCollection.find().sort({ created_at: -1 });
  return guides;
};

export const getGuideById = async (id: string) => {
  const guide = await GuideCollection.findById(id);
  if(!guide) {
      throw new Error('Guide not found');
  }
  return guide;
};

export const getOneGuide = async (filter: any) => {
    const guide = await GuideCollection.findOne(filter);

    if(!guide) {
        throw new Error('Guide not found');
    }
    return guide;
}

export const paginateGuide = async (filter: FilterQuery<Guide>, options : {[key: string]:any}) => {
  const guides = await GuideCollection.paginate(filter, options);
  return guides;
}

export const aggregatePaginateGuides = async (query: PipelineStage[], options: any) => {
  const guides = await GuideCollection.aggregatePaginate(
    GuideCollection.aggregate(query), options
);
  return guides;
}

export const createGuide = async (data: Guide) => {
  const guide = await GuideCollection.create(data);
  if(!guide) {
      throw new Error('Guide not created');
  }
  return guide;
};

export const updateGuideById = async (id: string, data: Partial<Guide>) => {
  const guide = await GuideCollection.findByIdAndUpdate(id, data, { new: true });
  if(!guide) {
      throw new Error('Guide not found');
  }
  return guide;
};

export const deleteGuideById = async (id: string) => {
  const guide = await GuideCollection.findByIdAndDelete(id);
  if(!guide) {
      throw new Error('Guide not found');
  }
  return guide;
};

export const deleteAllGuides = async () => {
  const result = await GuideCollection.deleteMany({});
  return result;
};