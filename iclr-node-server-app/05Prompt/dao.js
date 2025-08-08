import predictionSchema from "./schema.js";
import mongoose from "mongoose";
import { getCurrentYear } from "../config/globalConfig.js";

const models = {
  "2024": mongoose.model('predictions', predictionSchema, 'predictions'),
  "2025": mongoose.model("prediction_2025", predictionSchema, "prediction_2025"),
  "2026": mongoose.model("prediction_2026", predictionSchema, "prediction_2026"),
}

// Get the current model based on global year setting
const getCurrentModel = () => {
    const year = getCurrentYear();
    return models[year];
};


export const getPredictionByPaperIdAndPrompt = (paperId, prompt) => {
    return getCurrentModel().findOne({ paper_id: paperId, prompt: prompt });
};

export const getAllPredictionsByPrompt = (prompt) => {
    return getCurrentModel().find({ prompt: prompt });
};

export const getAllPredictionsByPaperId = (paperId) => {
    return getCurrentModel().find({ paper_id: paperId });
};

export const getAllPredictionsByLatestPrompt = async () => {
    const results = await getCurrentModel().aggregate([
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
    const deleteResult = await getCurrentModel().deleteMany({ paper_title: title, prompt: prompt , rebuttal: rebuttal});
    console.log(`Deleted ${deleteResult.deletedCount} existing predictions`);
    return getCurrentModel().create({ prompt: prompt, paper_id: paperId, paper_title: title, rebuttal: rebuttal, prediction: prediction });
};

export const deletePrediction = (paperId, prompt) => {
    return getCurrentModel().deleteOne({ paper_id: paperId, prompt: prompt });
};

export const updatePrediction = async (prompt, paperId, title, prediction) => {
    await getCurrentModel().deleteMany({ paper_title: title, prompt: prompt });
    return getCurrentModel().create({ prompt: prompt, paper_id: paperId, paper_title: title, prediction: prediction });
};

export const getOnePredictionByPaperId = (paperId) => {
    return getCurrentModel().findOne({ paper_id: paperId });
};

export const getPredByPaperIdsAndPromptAndRebuttal = (paper_id, prompt, rebuttal) => {
    return getCurrentModel().findOne({ paper_id: paper_id, prompt: prompt, rebuttal: rebuttal });
};


export const getPredsByPromptAndRebuttal = (prompt, rebuttal) => {
    return getCurrentModel().find({ prompt: prompt, rebuttal: rebuttal });
};

export const getPredsByPaperIdsAndPromptAndRebuttalBatch = (paper_ids, prompt, rebuttal) => {
    return getCurrentModel().find({ 
        paper_id: { $in: paper_ids }, 
        prompt: prompt, 
        rebuttal: rebuttal 
    });
};



