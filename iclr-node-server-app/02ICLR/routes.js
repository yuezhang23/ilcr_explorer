import axios from "axios";
import * as dao from "./dao.js";
import * as promptDao from "../05Prompt/dao.js"
axios.defaults.withCredentials = true;
import { toString_rebuttal, toString_no_rebuttal, parse_sectioned_prompt} from "./utility.js";
import UserRoutes from "../04Users/routes.js";
import { Liquid } from 'liquidjs';

export default function iclr(app) {
    const getAllIclr = async (req, res) => {
        try {
            const response = await dao.getAllSubmissions();
            res.json({ data: response, name: dao.collection_name });
        } catch (error) {
            res.status(500).send({ error: "Failed to retrieve all ICLR submissions" });
        }
    }

    const getAllIclrWithoutMetareviews = async (req, res) => {
        try {
            console.log("getAllIclrWithoutMetareviews");
            const response = await dao.getAllSubmissionsWithoutMetareviews();
            res.json({ data: response, name: dao.collection_name });
        } catch (error) {
            console.error("Error in getAllIclrWithoutMetareviews:", error);
            res.status(500).send({ error: "Failed to retrieve ICLR submissions without metareviews" });
        }
    }

    const getRandomSubmissions = async (req, res) => {
        const response = await dao.getRandomSubmission();
            res.json(response);
    }

    const createSubmissions = async (req, res) => {
        const newSubmissions = await dao.createSubmissions(req.body)
        res.send(newSubmissions)
    }

    const getAlliclrbyAdmin = async (req, res) => {
        const response = await dao.getAllSubmissions();
        res.send(response);
    }
    
    const getRandomSubmissionsbyAdmin = async (req, res) => {
        const count = parseInt(req.params.num)
        const response = await dao.getRandomSubmission(count);
        res.send(response);
    }
    
    const getReviewsByUser = async (req, res) =>{
        const {userId} = req.params;
        const response = await dao.getReviewsByUser(userId);
        res.send(response);
    }

    const getLikesByUser = async (req, res) =>{
        const {userId} = req.params;
        const response = await dao.getLikesByUser(userId);
        res.send(response);
    }
    
    const sorticlrByLikes = async (req, res) => {
        const count = parseInt(req.params.count)
        const response = await dao.sorticlrByLikes(count);
        res.send(response);
    }


    const findSubmissionsByTitle = async (req, res) => {
        const newSubmissions = await dao.findSubmissionsByTitle(req.params.title);
        if (newSubmissions) {
            res.json(newSubmissions);
        } else {
            res.status(400);  
        }
    };

    const findSubmissionsByAbstract = async (req, res) => {
        const newSubmissions = await dao.findSubmissionsByAbstract(req.params.abstract);
        if (newSubmissions) {
            res.json(newSubmissions);
        } else {
            res.status(400);  
        }
    };

    const findSubmissionsByAuthor  = async (req, res) => {
        const newSubmissions = await dao.findSubmissionsByAuthor(req.params.author);
        if (newSubmissions) {
            res.json(newSubmissions);
        } else {
            res.status(400);  
        }
    };

    const findSubmissionsByDecision = async (req, res) => {
        const newSubmissions = await dao.findSubmissionsByDecision(req.params.decision);
        if (newSubmissions) {
            res.json(newSubmissions);
        } else {
            res.status(400);  
        }
    };

    const findSubmissionByYear = async (req, res) => {
        const newSubmissions = await dao.findSubmissionByYear(req.params.year);
        if (newSubmissions) {
            res.json(newSubmissions);
        } else {
            res.status(400);  
        }
    };

    const getMetaValuesByUrl = async (req, res) => {
        const submission = await dao.findSubmissionByUrl(req.params.url);
        const metaValues = submission.metareviews.map(meta => meta.values);
        if (submission) {
            res.json(metaValues);
        } else {
            res.status(400);  
        }
    };

    const getAllBibData = async (req, res) => {
        const response = await dao.getAllBibData();
        if (response) {
            res.json(response);
        } else {
            res.status(400);  
        }
    } 

    const getSubmissionsWithPagination = async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const skip = parseInt(req.query.skip) || 0;
            const searchTerm = req.query.search || '';
            
            let submissions, totalCount;
            
            if (searchTerm && searchTerm != '') {
                submissions = await dao.getSubmissionsWithPaginationAndSearch(limit, skip, searchTerm);
                totalCount = await dao.getTotalSubmissionsCountWithSearch(searchTerm);
            } else {
                submissions = await dao.getSubmissionsWithPagination(limit, skip);
                totalCount = await dao.getTotalSubmissionsCount();
            }
            
            res.json({ 
                data: submissions, 
                totalCount: totalCount,
                name: dao.collection_name 
            });
        } catch (error) {
            console.error("Error in getSubmissionsWithPagination:", error);
            res.status(500).send({ error: "Failed to retrieve paginated ICLR submissions" });
        }
    }

    const deleteSubmission = async (req, res) => {
        const response = await dao.deleteSubmission(req.params.id);
        res.send(response);
    }

    const promptSubmissionByUrl = async (req, res) => {
        const {url, task, rebuttal} = req.body;
        const submission = await dao.findSubmissionByUrl(url);
        console.log("submission.title", submission.title, "rebuttal", rebuttal);
        let promptText = "";
        if (!submission || !Array.isArray(submission.metareviews)) {
            return res.status(400).send({ error: "Invalid submission or metareviews" });
        }
        if (rebuttal == 1) {
            promptText += toString_rebuttal(submission.metareviews);
        } else {
            promptText += toString_no_rebuttal(submission.metareviews);
        }
        console.log("promptText", promptText);
        const prompt_std = task.replace('{{ text }}', promptText)


        try {
            const response = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-4o-mini",
                messages: [
                    { role: "user", content: prompt_std }
                ],
                temperature: 0.0,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
            );
            const content = response.data.choices[0].message.content.trim().toUpperCase();
            const pred = content.startsWith('YES') || content.startsWith('ACCEPT') ? 'Accept' : 'Reject';
            const task_section = parse_sectioned_prompt(task)['task'].trim();
            // console.log("task_section", task_section);
            await promptDao.createPrediction(task_section, submission._id, submission.title, rebuttal, pred);
            res.send(pred);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    }
    
app.get("/api/iclr", getAllIclr);
app.get("/api/iclr/without_metareviews", getAllIclrWithoutMetareviews);
app.get("/api/iclr/random", getRandomSubmissions);
app.get("/api/admin/iclr/random/:num", getRandomSubmissionsbyAdmin);
app.post("/api/iclr/prompt/url", promptSubmissionByUrl);


app.get("/api/iclr/title/:title", findSubmissionsByTitle);
app.get("/api/iclr/abstract/:abstract", findSubmissionsByAbstract);
app.get("/api/iclr/author/:author", findSubmissionsByAuthor);
app.get("/api/iclr/decision/:decision", findSubmissionsByDecision);
app.get("/api/iclr/year/:year", findSubmissionByYear);
app.get("/api/iclr/random/:num", getRandomSubmissions);
app.get("/api/iclr/many", createSubmissions);
app.get("/api/iclr/meta/:url", getMetaValuesByUrl);
app.get("/api/iclr/bib", getAllBibData);
app.delete("/api/iclr/delete/:id", deleteSubmission);

app.get("/api/iclr/paginated", getSubmissionsWithPagination);


}