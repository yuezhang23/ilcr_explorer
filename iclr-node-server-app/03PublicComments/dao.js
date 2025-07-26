import mongoose from "mongoose";
import { commentSchema, likeSchema } from "./schema.js";
import { findSubmissionsByTitle } from "../02ICLR/dao.js";

const commentModel = mongoose.model("comments", commentSchema);
const likeModel = mongoose.model("likes", likeSchema);

export const getAllComments = () => commentModel.find();
export const getAllLikes = () => likeModel.find();

export const createLike = async (paperId, userId) => { 
    return likeModel.create({ paper_id: paperId, user: userId });
};

export const getAllLikesByPaperId = async (paperId) => { 
    return likeModel.find({ paper_id: paperId });
};

export const getAllLikesByUserId = async (userId) => {
    return likeModel.find({ user: userId });
};

export const getLikeByPaperIdAndUserId = async (paperId, userId) => {
    return likeModel.findOne({ paper_id: paperId, user: userId });
};

export const removeLike = async (paperId, userId) => {
    return likeModel.deleteOne({ paper_id: paperId, user: userId });
};

export const createComment = async (commentData) => {
    return commentModel.create(commentData);
};


export const getCommentByPaperIdAndUserId = async (paperId, userId) => {
    return commentModel.findOne({ paper_id: paperId, user: userId });
};

export const getAllCommentsById = async (id) => {
    return commentModel.findById(id);
};

export const getAllCommentsByPaperId = async (paperId) => {
    return commentModel.find({ paper_id: paperId });
};

export const getAllCommentsByUserId = async (userId) => {
    return commentModel.find({ user: userId });
};

export const removeCommentByIdAndComment = async (id, comment) => {
    return commentModel.updateOne({ _id: id }, { $pull: { comments: { value: comment } } });
};

export const addComment = async (paperId, userId, comment) => {
    return commentModel.updateOne({ paper_id: paperId, user: userId }, { $push: { comments: { value: comment, createdAt: Date.now() } } });
};

export const removeComment = async (paperId, userId, comment) => {
    return commentModel.updateOne({ paper_id: paperId, user: userId }, { $pull: { comments: { value: comment } } });
};

export const modifyComment = async (paperId, userId, comment, index) => {
    const newComment = { value: comment, createdAt: Date.now() };
    return commentModel.updateOne({ paper_id: paperId, user: userId }, { $set: { comments: [...comments.slice(0, index), newComment, ...comments.slice(index + 1)] } });
};

export const getPapersSortedByLikeCount = async (limit) => {
    return likeModel.aggregate([
        {
            $group: {
                _id: "$paper_id",
                likeCount: { $sum: 1 }
            }
        },
        { $sort: { likeCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "iclr_2024",
                localField: "_id",
                foreignField: "_id",
                as: "paper"
            }
        },
        { $unwind: "$paper" },
        {
            $project: {
                _id: 0,
                paper_id: "$_id",
                likeCount: 1,
                title: "$paper.title",
                url: "$paper.url"
            }
        }
    ]);
};

export { commentModel, likeModel };