import axios from "axios";
import * as dao from "./dao.js";
axios.defaults.withCredentials = true;


export default function publicComments(app) {
    const createLike = async (req, res) => {
        const {paperId, userId} = req.params;
        const usrData = await dao.getAllLikesByPaperId(paperId);
        const userIds = usrData.map(like => like.user);
        const len = userIds.length;
        if (userIds.includes(userId)) {
            len--;
            await dao.removeLike(paperId, userId);
        } else {
            len++;
            await dao.createLike(paperId, userId);
        }
        res.send(len);
    };
    
    const createComment = async (req, res) => {
        const {paperId, userId, comment} = req.body;
        try {
            await dao.addComment(paperId, userId, comment);
            res.status(200).send("Comment added");
        } catch (e) {
            res.status(500).send({ error: "Failed to add comment" });
        }
    };
    
    const removeComment = async (req, res) => { 
        const {paperId, userId, comment} = req.body;
        try {
            await dao.removeComment(paperId, userId, comment);
            res.status(200).send("Comment removed");
        } catch (e) {
            res.status(500).send({ error: "Failed to remove comment" });
        }
    };
    
    
    const modifyComment = async (req, res) => {
        const {paperId, userId, comment, index} = req.body;
        try {
            await dao.modifyComment(paperId, userId, comment, index);
            res.status(200).send("Comment modified");
          } catch (e) {
            res.status(500).send({ error: "Failed to modify comment" });
          }
    };

    app.post("/api/public/comments/like", createLike);
    app.post("/api/public/comments/comment", createComment);
    app.delete("/api/public/comments/comment", removeComment);
    app.put("/api/public/comments/comment", modifyComment);

    // Route to get all papers sorted by like count
    app.get("/api/public/comments/ranking/likes/:limit", async (req, res) => {
        try {
            const papers = await dao.getPapersSortedByLikeCount(req.params.limit);
            res.json(papers);
        } catch (e) {
            res.status(500).send({ error: "Failed to retrieve sorted papers" });
        }
    });

}