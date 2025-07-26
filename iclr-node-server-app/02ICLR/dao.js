import mongoose from "mongoose";
import submissioSchema from "./schema.js";

const model = mongoose.model("iclr_2024", submissioSchema);
export const collection_name = "iclr_2024";

export const createSubmission = (submission) => {
  delete submission._id;
  return model.create(submission);
}

export const createSubmissions = (submissions) => {
  return model.insertMany(submissions);
}

export const getAllSubmissions = () => model.find();

export const getAllSubmissionsWithoutMetareviews = () => model.find({}, { metareviews: 0 });
export const getAllBibData = () => model.find({}).select({ url: 1, title: 1, abstract: 1, authors: 1, year: 1, decision: 1 });

export const findSubmissionsByTitle = (title) =>  model.find({ title : {$regex: new RegExp(title, 'i')}});
export const findSubmissionByUrl = (url) =>  model.findOne({ url : url});
export const findSubmissionById = (id) =>  model.findOne({ _id : id });
export const findSubmissionByRemoteId = (rid) =>  model.findOne({ id : rid });

export const findSubmissionsByAuthor = (author) => model.find({ authors: author });
export const findSubmissionsByDecision = (decision) =>  model.find({ decision : {$regex: new RegExp(decision, 'i')}});
export const findSubmissionByYear = (year) =>  model.find({ year : {$regex: new RegExp(year, 'i')}});
// find all submissions with vague words in abstract
export const findSubmissionByAbstract = (abstract) =>  model.findOne({ abstract : {$regex: new RegExp(abstract, 'i')}});
export const findSubmissionsByAbstract = (words) =>  model.find({ abstract : {$regex: new RegExp(words, 'i')}});

// find all meta reviews by exact url
export const findMetaReviewsByUrl = (url) =>  model.find({ url : url })[0].metareviews;


export const deleteSubmission = (id) => model.deleteOne({ _id: id });
export const getRandomSubmission = (num) => model.aggregate([{ $sample: { size: num } }]);

// Missing functions that are called in routes
export const getReviewsByUser = (userId) => model.find({ "metareviews.rebuttal.comments": { $elemMatch: { reply_id: userId } } });
export const getLikesByUser = (userId) => model.find({ "metareviews.rebuttal.comments": { $elemMatch: { reply_id: userId } } });
export const sorticlrByLikes = (count) => model.aggregate([
  { $addFields: { likeCount: { $size: "$metareviews" } } },
  { $sort: { likeCount: -1 } },
  { $limit: count }
]);

// Pagination methods
export const getSubmissionsWithPagination = (limit, skip) => model.find().limit(limit).skip(skip);

export const getTotalSubmissionsCount = () => model.countDocuments();

export const getSubmissionsWithPaginationAndSearch = (limit, skip, searchTerm) => {
  const searchRegex = new RegExp(searchTerm, 'i');
  return model.find({
    $or: [
      { title: searchRegex },
      { authors: searchRegex }
    ]
  }).limit(limit).skip(skip);
};

export const getTotalSubmissionsCountWithSearch = (searchTerm) => {
  const searchRegex = new RegExp(searchTerm, 'i');
  return model.countDocuments({
    $or: [
      { title: searchRegex },
      { authors: searchRegex }
    ]
  });
};




