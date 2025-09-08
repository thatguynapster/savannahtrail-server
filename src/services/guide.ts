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