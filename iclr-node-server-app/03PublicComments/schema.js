import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    paper_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'iclr_2024'
    },
    comments : [{ value: {type : String}, createdAt : {type : Date, default : Date.now, required : true}}],
});

const likeSchema = new mongoose.Schema({
    paper_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'iclr_2024'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
});
export {commentSchema, likeSchema};