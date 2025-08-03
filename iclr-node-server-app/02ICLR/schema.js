import mongoose from "mongoose";

const submissioSchema = new mongoose.Schema(
    {
        s_id : {type : String, required : true, unique: true}, // Make s_id unique and required
        authors: [String],
        title: {type : String},
        abstract: {type : String},
        year: {type : String},
        url: {type : String},
        metareviews: [
        {
            id: {type : String},
            reply_id: {type : String},
            values: {
                summary: {type : String},
                soundness: {type : String},
                presentation: {type : String},
                contribution: {type : String},
                strengths: {type : String},
                weaknesses: {type : String},
                questions: {type : String},
                limitations: {type : String},
                rating: {type : String},
                confidence: {type : String},
            },
            rebuttal: [{
                r_id: {type : String},
                reply_id: {type : String},
                value: {type : String},
                comment: {type : String},
                comments: [
                    {
                    c_id: {type : String},
                    reply_id: {type : String},
                    comment: {type : String},
                }],
            }],
        }],
        decision: {type : String},
    });


// Add indexes for better query performance
submissioSchema.index({ s_id: 1 });
submissioSchema.index({ year: 1 });
submissioSchema.index({ decision: 1 });
submissioSchema.index({ url: 1 });

// Default export for backward compatibility
export default submissioSchema;
