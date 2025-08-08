import * as dao from "./dao.js";

export default function prompt(app) {
    const getPredictionByPaperIdAndPrompt = async (req, res) => {
        const { paperId, prompt } = req.body;
        const prediction = await dao.getPredictionByPaperIdAndPrompt(paperId, prompt);
        res.json(prediction);
    };

    const getAllPredictionsByPrompt = async (req, res) => {
        const { prompt } = req.body;
        try {
            const predictions = await dao.getAllPredictionsByPrompt(prompt);
            res.json(predictions);
        } catch (error) {
            res.json([]);
        }
    };

    const getAllPredictionsByPaperId = async (req, res) => {
        const { paper_id } = req.body;
        const prediction = await dao.getAllPredictionsByPaperId(paper_id);
        res.json(prediction);
    };

    const getOnePredictionByPaperId = async (req, res) => {
        const { paper_id } = req.body;
        const prediction = await dao.getOnePredictionByPaperId(paper_id);
        res.json(prediction);
    };

    const getAllPredictionsByLatestPrompt = async (req, res) => {
        const predictions = await dao.getAllPredictionsByLatestPrompt();
        res.json(predictions);
    };

    const getPredictionsByPaperIdsAndPrompt = async (req, res) => {
        const { paper_ids, prompt } = req.body;
        const predictions = [];
        for (const paperId of paper_ids) {
            const prediction = await dao.getPredictionByPaperIdAndPrompt(paperId, prompt );
            if (!prediction) {
                predictions.push({ paper_id: paperId, prompt: prompt, prediction: "O" });
            } else {
                predictions.push({ paper_id: paperId, prompt: prompt, prediction: prediction.prediction });
            }
        }
        res.json(predictions);
    };

    const getPredsByPaperIdsAndPromptAndRebuttal = async (req, res) => {
        const { paper_ids, prompt, rebuttal } = req.body;
        try {
            // Use optimized batch query
            const foundPredictions = await dao.getPredsByPaperIdsAndPromptAndRebuttalBatch(paper_ids, prompt, rebuttal);
            
            // Create a map of found predictions for quick lookup
            const predictionMap = new Map();
            foundPredictions.forEach(pred => {
                predictionMap.set(pred.paper_id.toString(), pred.prediction);
            });
            
            // Build response with all paper IDs, using "O" for missing predictions
            const predictions = paper_ids.map(paperId => ({
                paper_id: paperId,
                prompt: prompt,
                rebuttal: rebuttal,
                prediction: predictionMap.get(paperId.toString()) || "O"
            }));
            
            res.json(predictions);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            res.status(500).json({ error: 'Failed to fetch predictions' });
        }
    };

    const getPredsByPromptAndRebuttal = async (req, res) => {
        const { prompt, rebuttal } = req.body;
        const predictions = await dao.getPredsByPromptAndRebuttal(prompt, rebuttal);
        console.log(predictions.length);
        res.json(predictions);
    };


    

    // const getAllPromptTemplates = async (req, res) => {
    //     const templates = await dao.getAllPromptTemplates();
    //     res.json(templates);
    // };

    // const createPromptTemplate = async (req, res) => {
    //     const { template } = req.body;
    //     try {
    //         const template_old = await dao.getPromptTemplateByTemplate(template);
    //         if (template_old) {
    //             res.json(template_old);
    //         } else {
    //             const template_new = await dao.createPromptTemplate(template);
    //             res.json(template_new);
    //         }
    //     } catch (error) {
    //         res.json({ error: error.message });
    //     }
    // };

    // const getPromptTemplateByTemplate = async (req, res) => {
    //     const { template } = req.body;
    //     const template_old = await dao.getPromptTemplateByTemplate(template);
    //     res.json(template_old);
    // };

    app.post("/api/prompt/prediction", getPredictionByPaperIdAndPrompt);
    app.post("/api/prompt/all_predictions_by_paper_id", getAllPredictionsByPaperId);
    app.post("/api/prompt/all_predictions_by_prompt", getAllPredictionsByPrompt);
    app.post("/api/prompt/all_predictions_by_latest_prompt", getAllPredictionsByLatestPrompt);
    app.post("/api/prompt/predictions_by_paper_ids_and_prompt", getPredictionsByPaperIdsAndPrompt);
    app.post("/api/prompt/predictions_by_paper_ids_and_prompt_and_rebuttal", getPredsByPaperIdsAndPromptAndRebuttal);
    app.post("/api/prompt/predictions_by_prompt_and_rebuttal", getPredsByPromptAndRebuttal);
}