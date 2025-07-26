import axios from "axios";
axios.defaults.withCredentials = true;


// export const BASE_API = process.env.REACT_APP_API_BASE;
export const ICLR_API = `/api/iclr`;
export const ADMIN_API = `/api/admin`;
export const PROMPT_API = `/api/prompt`;

export const PROMPT_CANDIDATES = [
    'Assess the reviews provided for the paper and determine whether it should be accepted at an academic conference. Take into account the strengths, weaknesses, soundness, presentation, and contribution ratings, while being mindful that a paper may still warrant acceptance despite having some weaknesses. Focus on the overall impact and significance of the contributions, as well as how effectively the paper addresses its challenges. Your assessment should reflect a nuanced understanding of the review process, leading to a thoughtful recommendation based on the balance of merits and shortcomings.',
    'Evaluate the reviews provided for the paper and determine whether it should be accepted at an academic conference. When making your assessment, weigh the strengths against the weaknesses, considering the overall soundness, presentation, and contributions of the paper. Recognize that a paper may still be worthy of acceptance even if it has notable weaknesses, especially if the contributions are significant and the weaknesses are manageable. Your recommendation should reflect a balanced view that integrates the merits and shortcomings, focusing on the paper\'s overall impact and relevance to the field.',
    'Evaluate the following academic paper reviews and determine whether the paper should be accepted (Yes) or rejected (No). Focus on the strengths and weaknesses identified by the reviewers, particularly those that suggest a significant contribution or potential impact of the paper despite existing concerns. Pay attention to nuanced evaluations, especially those indicating borderline acceptance or rejection, and consider how positive aspects may outweigh negative ones. Your final decision should reflect a comprehensive understanding of the reviews and the overall contribution of the paper within its research domain.',
    'Analyze the peer reviews of the research paper to formulate a contextual recommendation for its acceptance (Yes) or rejection (No). Assess the originality of the contributions, empirical validity, and clarity of the results while systematically reviewing specific comments from peer evaluations. Make recommendations based on a net evaluation where strengths are clearly articulated, effectively outweighing acknowledged limitations. Ensure that your final decision carefully integrates the diversity of insights from the reviews, accentuating its scientific significance and endorsing actionable feedback. Aim to consolidate the overall impression that highlights both the impact of the research and realistic evaluations from the reviewers.',
    'Evaluate the following reviews of an academic paper and provide a recommendation for acceptance based on the overall sentiment expressed by the reviewers. Your assessment should summarize key strengths and weaknesses highlighted in the reviews, emphasizing how they contribute to the overall evaluation of the paper. Weigh the strengths against the weaknesses to determine the paper\'s potential contribution to its field. Based on your evaluation, recommend one of the following: \'Accept\' (Yes), \'Reject\' (No), or \'Borderline\'. Justify your recommendation by articulating the overall sentiment toward the paper, while ensuring that it aligns with the specific points raised by the reviewers.',
    "Given the following reviews (text), determine if a paper would be accepted (Yes) or not (No) by an academic conference.",
    "Given the following reviews, determine if the paper being reviewed would be accepted at an academic conference.",
    'Assess the given academic paper reviews to determine if the paper should be accepted (Yes) or rejected (No). Consider both the positive and negative feedback from the reviewers, keeping in mind that some minor issues might not outweigh a paper\'s significant contributions. Pay particular attention to nuanced ratings and phrases that suggest the paper is close to meeting acceptance criteria, such as "borderline reject" or "marginally below the acceptance threshold." Your final decision should capture the reviewers\' overall sentiment and evaluate the paper\'s potential impact within its field, rather than fixating on specific flaws.',
] 
export const BASIC_PROMPT = PROMPT_CANDIDATES[5];

// Get all ICLR submissions
export const findAllIclrSubmissions = async () => {
    console.log("findAllIclrSubmissions");
    const response = await axios.get(`${ICLR_API}`).then((res) => res.data);
    return {data: response.data, name: response.name};
};


// Get all ICLR submissions without metareviews
export const findAllIclrSubmissionsWithoutMetareviews = async () => {
    const response = await axios.get(`${ICLR_API}/without_metareviews`).then((res) => res.data);
    return response.data;
};

// Get random ICLR submissions (public)
export const findRandomIclrSubmissions = async () => {
    const response = await axios.get(`${ICLR_API}/random`);
    return response.data;
};

// Get random ICLR submissions (admin, with count)
export const findRandomIclrSubmissionsByAdmin = async (num: number) => {
    const response = await axios.get(`${ADMIN_API}/iclr/random/${num}`);
    return response.data;
};

// Find ICLR submissions by title
export const findIclrByTitle = async (title: string) => {
    const response = await axios.get(`${ICLR_API}/title/${title}`);
    return response.data;
};

// Find ICLR submissions by abstract
export const findIclrByAbstract = async (abstract: string) => {
    const response = await axios.get(`${ICLR_API}/abstract/${abstract}`);
    return response.data;
};

// Find ICLR submissions by url
export const findIclrByUrl = async (url: string) => {
    const response = await axios.get(`${ICLR_API}/url/${url}`);
    return response.data;
};

// Find ICLR submissions by author
export const findIclrByAuthor = async (author: string) => {
    const response = await axios.get(`${ICLR_API}/author/${author}`);
    return response.data;
};

// Find ICLR submissions by decision
export const findIclrByDecision = async (decision: string) => {
    const response = await axios.get(`${ICLR_API}/decision/${decision}`);
    return response.data;
};

// Find ICLR submissions by year
export const findIclrByYear = async (year: string) => {
    const response = await axios.get(`${ICLR_API}/year/${year}`);
    return response.data;
};

// Bulk create ICLR submissions (should be POST)
export const createIclrSubmissions = async (submissions: any[]) => {
    const response = await axios.post(`${ICLR_API}/many`, submissions);
    return response.data;
};

// Get random ICLR submissions with count (public)
export const findRandomIclrSubmissionsWithCount = async (num: number) => {
    const response = await axios.get(`${ICLR_API}/random/${num}`);
    return response.data;
};

// Get reviews by user
export const getReviewsByUser = async (userId: string) => {
    const response = await axios.get(`${ICLR_API}/reviews/${userId}`);
    return response.data;
};

// Get likes by user
export const getLikesByUser = async (userId: string) => {
    const response = await axios.get(`${ICLR_API}/likes/${userId}`);
    return response.data;
};

// Get ICLR papers ranked by like count (public)
export const getIclrRankedByLikes = async (count: number) => {
    const response = await axios.get(`${ICLR_API}/ranking/likes/${count}`);
    return response.data;
};

// Get all ICLR submissions (admin)
export const findAllIclrByAdmin = async () => {
    const response = await axios.get(`${ADMIN_API}/iclr`);
    return response.data;
};

// Get paginated ICLR submissions with search
export const findPaginatedIclrSubmissions = async (limit: number, skip: number, searchTerm?: string) => {
    const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
    });
    
    if (searchTerm) {
        params.append('search', searchTerm);
    }
    
    const response = await axios.get(`${ICLR_API}/paginated?${params}`);
    console.log("response data length", response.data.data.length);
    return response.data;
};

// Get meta values by url
export const getMetaValuesByUrl = async (url: string) => {
    const response = await axios.get(`${ICLR_API}/meta/${url}`);
    return response.data;
};

// Get all bib data
export const getAllBibData = async () => {
    const response = await axios.get(`${ICLR_API}/bib`);
    return response.data;
};

export const PUBLIC_COMMENTS_API = "/api/public/comments";

// Like or unlike a paper (toggle)
export const toggleLike = async (paperId: string, userId: string) => {
    const response = await axios.post(`${PUBLIC_COMMENTS_API}/like`, { paperId, userId });
    return response.data;
};

// Add a comment to a paper
export const addComment = async (paperId: string, userId: string, comment: string) => {
    const response = await axios.post(`${PUBLIC_COMMENTS_API}/comment`, { paperId, userId, comment });
    return response.data;
};

// Remove a like from a paper
export const removeLike = async (paperId: string, userId: string) => {
    const response = await axios.delete(`${PUBLIC_COMMENTS_API}/like`, { data: { paperId, userId } });
    return response.data;
};

// Remove a comment from a paper
export const removeComment = async (paperId: string, userId: string, comment: string) => {
    const response = await axios.delete(`${PUBLIC_COMMENTS_API}/comment`, { data: { paperId, userId, comment } });
    return response.data;
};

// Delete a paper
export const deleteSubmission = async (id: string) => {
    const response = await axios.delete(`${ICLR_API}/delete/${id}`);
    return response.data;
};

// Modify a comment on a paper
export const modifyComment = async (paperId: string, userId: string, comment: string, index: number) => {
    const response = await axios.put(`${PUBLIC_COMMENTS_API}/comment`, { paperId, userId, comment, index });
    return response.data;
};

// Get papers ranked by like count (limit is required)
export const getPapersRankedByLikes = async (limit: number) => {
    try {
        const response = await axios.get(`${PUBLIC_COMMENTS_API}/ranking/likes/${limit}`);
        return response.data;
    } catch (error) {
        console.error(error);
        return {};
    }
};

// Prompt a submission by url
export const promptSubmissionByUrl = async (url: string, task: string, rebuttal: number = 0) => {
    const response = await axios.post(`${ICLR_API}/prompt/url`, { url, task, rebuttal });
    return response.data;
};


// Get predictions by paper id
export const getOnePredictionByPaperId = async (paperId: string) => {
    const response = await axios.post(`${PROMPT_API}/one_prediction_by_paper_id`, { paper_id: paperId });
    return {prediction: response.data.prediction, prompt: response.data.prompt};
};


// Get all predictions by prompt
export const getAllPredictionsByPrompt = async (prompt: string) => {
    const response = await axios.post(`${PROMPT_API}/all_predictions_by_prompt`, { prompt: prompt });
    return response.data;
};


// Get all predictions by basic prompt
export const getAllPredictionsByBasicPrompt = async () => {
    const response = await axios.post(`${PROMPT_API}/all_predictions_by_prompt`, { prompt: BASIC_PROMPT });
    return response.data;
};

// Get all predictions by latest prompt
export const getAllPredictionsByLatestPrompt = async () => {
    const response = await axios.post(`${PROMPT_API}/all_predictions_by_latest_prompt`);
    return response.data;
};

// Get predictions by paper ids
export const getPredictionsByPaperIdsAndBasicPrompt = async (paperIds: string[]) => {
    const response = await axios.post(`${PROMPT_API}/predictions_by_paper_ids_and_prompt`, { paper_ids: paperIds, prompt: BASIC_PROMPT});
    return response.data;
};

// Get predictions by paper ids
export const getPredictionsByPaperIdsAndPrompt = async (paperIds: string[], prompt: string) => {
    const response = await axios.post(`${PROMPT_API}/predictions_by_paper_ids_and_prompt`, { paper_ids: paperIds, prompt: prompt });
    return response.data;
};






