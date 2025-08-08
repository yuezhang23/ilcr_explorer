import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
    prompt: {type: String, required: true},
    prompt_type:{type : Number, default: -1},
    paper_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'iclr_2024',
        required: true
    },
    paper_title: {type: String, required: true},
    model: {type: String, default: 'gpt-4o-mini'},
    rebuttal: {type: Number, default: -1},
    prediction: {type: String, default: 'None'},
    decision: {type: String, default: 'O'},
});


export default predictionSchema;