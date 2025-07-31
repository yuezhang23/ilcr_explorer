import mongoose from "mongoose";
import submissioSchema from "./schema.js";
import { getCurrentYear } from "../config/globalConfig.js";

const models = {
  "2024": mongoose.model("iclr_2024", submissioSchema, "iclr_2024"),
  "2025": mongoose.model("iclr_2025", submissioSchema, "iclr_2025"),
  "2026": mongoose.model("iclr_2026", submissioSchema, "iclr_2026"),
}

// Get the current model based on global year setting
const getCurrentModel = () => {
    const year = getCurrentYear();
    return models[year];
};

export const collection_name = models["2024"].collection.name;

export const createSubmission = (submission) => {
  delete submission._id;
  return getCurrentModel().create(submission);
}

export const createSubmissions = (submissions) => {
  return getCurrentModel().insertMany(submissions);
}

export const getAllSubmissions = () => getCurrentModel().find();

export const getAllSubmissionsWithPartialMetareviews = () => getCurrentModel().find({}, { 
  "metareviews.values.summary": 0,
  "metareviews.values.soundness": 0,
  "metareviews.values.presentation": 0,
  "metareviews.values.contribution": 0,
  "metareviews.values.strengths": 0,
  "metareviews.values.weaknesses": 0,
  "metareviews.values.questions": 0,
  "metareviews.values.limitations": 0,
  "metareviews.rebuttal": 0
});

export const getAllBibData = () => getCurrentModel().find({}).select({ url: 1, title: 1, abstract: 1, authors: 1, year: 1, decision: 1 });

export const findSubmissionsByTitle = (title) =>  getCurrentModel().find({ title : {$regex: new RegExp(title, 'i')}});
export const findSubmissionByUrl = (url) =>  getCurrentModel().findOne({ url : url});
export const findSubmissionById = (id) =>  getCurrentModel().findOne({ _id : id });
export const findSubmissionByRemoteId = (rid) =>  getCurrentModel().findOne({ id : rid });

export const findSubmissionsByAuthor = (author) => getCurrentModel().find({ authors: author });
export const findSubmissionsByDecision = (decision) =>  getCurrentModel().find({ decision : {$regex: new RegExp(decision, 'i')}});
// find all submissions with vague words in abstract
export const findSubmissionByAbstract = (abstract) =>  getCurrentModel().findOne({ abstract : {$regex: new RegExp(abstract, 'i')}});
export const findSubmissionsByAbstract = (words) =>  getCurrentModel().find({ abstract : {$regex: new RegExp(words, 'i')}});

// find all meta reviews by exact url
export const findMetaReviewsByUrl = (url) =>  getCurrentModel().find({ url : url })[0].metareviews;

export const deleteSubmission = (id) => getCurrentModel().deleteOne({ _id: id });
export const getRandomSubmission = (num) => getCurrentModel().aggregate([{ $sample: { size: num } }]);

// Missing functions that are called in routes
export const getReviewsByUser = (userId) => getCurrentModel().find({ "metareviews.rebuttal.comments": { $elemMatch: { reply_id: userId } } });
export const getLikesByUser = (userId) => getCurrentModel().find({ "metareviews.rebuttal.comments": { $elemMatch: { reply_id: userId } } });
export const sorticlrByLikes = (count) => getCurrentModel().aggregate([
  { $addFields: { likeCount: { $size: "$metareviews" } } },
  { $sort: { likeCount: -1 } },
  { $limit: count }
]);

// Pagination methods
export const getSubmissionsWithPagination = (limit, skip) => {
  try {
    return getCurrentModel().find().limit(limit).skip(skip);
  } catch (error) {
    console.error("Error in getSubmissionsWithPagination:", error);
    return [];
  }
}

export const getTotalSubmissionsCount = () => {
  try {
    return getCurrentModel().countDocuments();
  } catch (error) {
    console.error("Error in getTotalSubmissionsCount:", error);
    return 0;
  }
}

export const getSubmissionsWithPaginationAndSearch = (limit, skip, searchTerm) => {
  const searchRegex = new RegExp(searchTerm, 'i');
  try {
    return getCurrentModel().find({
    $or: [
      { title: searchRegex },
      { authors: searchRegex }
    ]
  }).limit(limit).skip(skip);
  } catch (error) {
    console.error("Error in getSubmissionsWithPaginationAndSearch:", error);
    return [];
  }
};

export const getTotalSubmissionsCountWithSearch = (searchTerm) => {
  const searchRegex = new RegExp(searchTerm, 'i');
  try {
    return getCurrentModel().countDocuments({
    $or: [
      { title: searchRegex },
      { authors: searchRegex }
    ]
  });
  } catch (error) {
    console.error("Error in getTotalSubmissionsCountWithSearch:", error);
    return 0;
  }
};




