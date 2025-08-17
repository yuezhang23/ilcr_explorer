import predictionStatsSchema from "./schema.js";
import mongoose from "mongoose";

const PredictionStats = mongoose.model('PredictionStats', predictionStatsSchema);

export const getPredictionStats = async (prompt) => {
    const predictionStats = await PredictionStats.find({prompt: prompt});
    return predictionStats;
};

export const getAllPredictionStats = async () => {
    const predictionStats = await PredictionStats.find({});
    return predictionStats;
};

export const getPredictionStatsByPromptType = async (promptType) => {
    const predictionStats = await PredictionStats.find({prompt_type: promptType});
    return predictionStats;
};

export const getPredictionStatsByYear = async (year) => {
    const predictionStats = await PredictionStats.find({
        "predictions.year": year
    });
    return predictionStats;
};

export const getPredictionStatsByConference = async (conference) => {
    const predictionStats = await PredictionStats.find({
        "predictions.conference": conference
    });
    return predictionStats;
};

export const createPredictionStats = async (predictionStatsData) => {
    const predictionStats = new PredictionStats(predictionStatsData);
    return await predictionStats.save();
};

export const updatePredictionStats = async (prompt, updateData) => {
    const result = await PredictionStats.findOneAndUpdate(
        { prompt: prompt },
        updateData,
        { new: true, upsert: true }
    );
    return result;
};

export const deletePredictionStats = async (prompt) => {
    const result = await PredictionStats.deleteOne({ prompt: prompt });
    return result;
};

export const deleteAllPredictionStats = async () => {
    const result = await PredictionStats.deleteMany({});
    return result;
};

export const getPredictionStatsSummary = async () => {
    const summary = await PredictionStats.aggregate([
        {
            $unwind: "$predictions"
        },
        {
            $group: {
                _id: {
                    prompt_type: "$prompt_type",
                    rebuttal_in_review: "$predictions.rebuttal_in_review"
                },
                total_papers: { $sum: "$predictions.number_of_predictions" },
                avg_accuracy: { $avg: { $divide: ["$predictions.TP", { $add: ["$predictions.TP", "$predictions.FP"] }] } },
                avg_precision: { $avg: { $divide: ["$predictions.TP", { $add: ["$predictions.TP", "$predictions.FP"] }] } },
                avg_recall: { $avg: { $divide: ["$predictions.TP", { $add: ["$predictions.TP", "$predictions.FN"] }] } }
            }
        },
        {
            $sort: { "_id.prompt_type": 1, "_id.rebuttal_in_review": 1 }
        }
    ]);
    return summary;
};