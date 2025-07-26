import predictionSchema from "./schema.js";
import mongoose from "mongoose";


// const Templates = mongoose.model('templates', templatesSchema);
const model = mongoose.model('predictions', predictionSchema, 'predictions', { collection: 'iclr_2024' });


export const getPredictionByPaperIdAndPrompt = (paperId, prompt) => {
    return model.findOne({ paper_id: paperId, prompt: prompt });
};

export const getAllPredictionsByPrompt = (prompt) => {
    return model.find({ prompt: prompt });
};

export const getAllPredictionsByPaperId = (paperId) => {
    return model.find({ paper_id: paperId });
};

export const getAllPredictionsByLatestPrompt = async () => {
    const results = await model.aggregate([
        { $sort: { _id: -1 } }, // Sort by newest first
        { $group: {
            _id: "$paper_id",
            latestPrediction: { $first: "$$ROOT" }
        }},
        { $replaceRoot: { newRoot: "$latestPrediction" } }
    ]);
    return results;
};

export const createPrediction = async (prompt, paperId, title, rebuttal, prediction) => {
    const deleteResult = await model.deleteMany({ paper_title: title, prompt: prompt , rebuttal: rebuttal});
    console.log(`Deleted ${deleteResult.deletedCount} existing predictions`);
    return model.create({ prompt: prompt, paper_id: paperId, paper_title: title, rebuttal: rebuttal, prediction: prediction });
};

export const deletePrediction = (paperId, prompt) => {
    return model.deleteOne({ paper_id: paperId, prompt: prompt });
};

export const updatePrediction = async (prompt, paperId, title, prediction) => {
    await model.deleteMany({ paper_title: title, prompt: prompt });
    return model.create({ prompt: prompt, paper_id: paperId, paper_title: title, prediction: prediction });
};

export const getOnePredictionByPaperId = (paperId) => {
    return model.findOne({ paper_id: paperId });
};


export const getPredictionsByPaperIdsAndPrompt = async (paperIds, prompt) => {
    const predictions = [];
    for (const paperId of paperIds) {
        const prediction = await model.findOne({ paper_id: paperId, prompt: prompt });
        if (!prediction) {
            predictions.push({ paper_id: paperId, prompt: prompt, prediction: "O" });
        } else {
            predictions.push({ paper_id: paperId, prompt: prompt, prediction: prediction.prediction });
        }
    }
    return predictions;
};