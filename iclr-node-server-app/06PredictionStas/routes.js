import * as dao from "./dao.js";

export default function predictionStats(app) {
    const getPredictionStats = async (req, res) => {
        try {
            const { prompt } = req.body;
            const predictionStats = await dao.getPredictionStats(prompt);
            res.json(predictionStats);
        } catch (error) {
            console.error('Error getting prediction stats:', error);
            res.status(500).json({ error: 'Failed to get prediction stats' });
        }
    };

    const getAllPredictionStats = async (req, res) => {
        try {
            const predictionStats = await dao.getAllPredictionStats();
            res.json(predictionStats);
        } catch (error) {
            console.error('Error getting all prediction stats:', error);
            res.status(500).json({ error: 'Failed to get all prediction stats' });
        }
    };

    const getPredictionStatsByPromptType = async (req, res) => {
        try {
            const { prompt_type } = req.params;
            const predictionStats = await dao.getPredictionStatsByPromptType(parseInt(prompt_type));
            res.json(predictionStats);
        } catch (error) {
            console.error('Error getting prediction stats by prompt type:', error);
            res.status(500).json({ error: 'Failed to get prediction stats by prompt type' });
        }
    };

    const getPredictionStatsByYear = async (req, res) => {
        try {
            const { year } = req.params;
            const predictionStats = await dao.getPredictionStatsByYear(parseInt(year));
            res.json(predictionStats);
        } catch (error) {
            console.error('Error getting prediction stats by year:', error);
            res.status(500).json({ error: 'Failed to get prediction stats by year' });
        }
    };

    const getPredictionStatsByConference = async (req, res) => {
        try {
            const { conference } = req.params;
            const predictionStats = await dao.getPredictionStatsByConference(conference);
            res.json(predictionStats);
        } catch (error) {
            console.error('Error getting prediction stats by conference:', error);
            res.status(500).json({ error: 'Failed to get prediction stats by conference' });
        }
    };

    const createPredictionStats = async (req, res) => {
        try {
            const predictionStatsData = req.body;
            const result = await dao.createPredictionStats(predictionStatsData);
            res.json(result);
        } catch (error) {
            console.error('Error creating prediction stats:', error);
            res.status(500).json({ error: 'Failed to create prediction stats' });
        }
    };

    const updatePredictionStats = async (req, res) => {
        try {
            const { prompt } = req.params;
            const updateData = req.body;
            const result = await dao.updatePredictionStats(prompt, updateData);
            res.json(result);
        } catch (error) {
            console.error('Error updating prediction stats:', error);
            res.status(500).json({ error: 'Failed to update prediction stats' });
        }
    };

    const deletePredictionStats = async (req, res) => {
        try {
            const { prompt } = req.params;
            const result = await dao.deletePredictionStats(prompt);
            res.json(result);
        } catch (error) {
            console.error('Error deleting prediction stats:', error);
            res.status(500).json({ error: 'Failed to delete prediction stats' });
        }
    };

    const deleteAllPredictionStats = async (req, res) => {
        try {
            const result = await dao.deleteAllPredictionStats();
            res.json(result);
        } catch (error) {
            console.error('Error deleting all prediction stats:', error);
            res.status(500).json({ error: 'Failed to delete all prediction stats' });
        }
    };

    const getPredictionStatsSummary = async (req, res) => {
        try {
            const summary = await dao.getPredictionStatsSummary();
            res.json(summary);
        } catch (error) {
            console.error('Error getting prediction stats summary:', error);
            res.status(500).json({ error: 'Failed to get prediction stats summary' });
        }
    };

    // Define routes
    app.post("/api/predictionStats/get", getPredictionStats);
    app.get("/api/predictionStats/all", getAllPredictionStats);
    app.get("/api/predictionStats/type/:prompt_type", getPredictionStatsByPromptType);
    app.get("/api/predictionStats/year/:year", getPredictionStatsByYear);
    app.get("/api/predictionStats/conference/:conference", getPredictionStatsByConference);
    app.post("/api/predictionStats/create", createPredictionStats);
    app.put("/api/predictionStats/update/:prompt", updatePredictionStats);
    app.delete("/api/predictionStats/delete/:prompt", deletePredictionStats);
    app.delete("/api/predictionStats/deleteAll", deleteAllPredictionStats);
    app.get("/api/predictionStats/summary", getPredictionStatsSummary);
}