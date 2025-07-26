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
        const predictions = await dao.getPredictionsByPaperIdsAndPrompt(paper_ids, prompt);
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
}