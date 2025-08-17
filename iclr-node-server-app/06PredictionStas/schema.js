import mongoose from "mongoose";

const predictionStatsSchema = new mongoose.Schema({
    prompt: {type: String, required: true},
    prompt_type:{type : Number, default: -1},
    predictions: [
        {
            year: {type: Number, default: 2024},
            conference: {type: String, default: 'ICLR'},
            number_of_predictions: {type: Number, default: 0},
            rebuttal_in_review: {type: Number, default: 0},
            FP: {type: Number, default: 0},
            FN: {type: Number, default: 0},
            TP: {type: Number, default: 0},
            TN: {type: Number, default: 0},
        }
    ]
});

export default predictionStatsSchema;