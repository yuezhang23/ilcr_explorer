import axios from "axios";
axios.defaults.withCredentials = true;


export const BASE_API = 'https://ilcr-explorer-backend.onrender.com';
export const ICLR_API = `${BASE_API}/api/iclr`;
export const ADMIN_API = `${BASE_API}/api/admin`;
export const PROMPT_API = `${BASE_API}/api/prompt`;

export const PROMPT_CANDIDATES = [
    "Given the following reviews (text), determine if a paper would be accepted (Yes) or not (No) by an academic conference.",
    "Given the following reviews, determine if the paper being reviewed would be accepted at an academic conference.",
    "Analyze the reviews provided for the submitted manuscript and provide a classification of accepted (Yes) or rejected (No) for the academic conference.",
    // # APO on rebut 0
    "Given the following academic reviews, evaluate the overall likelihood of paper acceptance at a conference. Please consider the range of feedback, including both strengths and weaknesses noted by the reviewers. Provide a final assessment by indicating \'Yes\' if the paper shows a high potential for acceptance due to substantial strengths, even in light of weaknesses, or \'No\' if critical issues consistently outweigh any merits across the reviews. Pay special attention to the synthesis of diverse opinions to arrive at a balanced conclusion.", 
    "Evaluate the potential for paper acceptance at a conference by analyzing the provided academic reviews. Focus on the significance of both strengths and weaknesses noted by the reviewers, and take into account their ratings on soundness, presentation, and contribution. Identify the tone and overarching themes in the reviews—do the strengths outweigh the weaknesses? \nConclude with \'Yes\' if the reviewer\'s feedback suggests a favorable overall impression with acceptable flaws, and \'No\' if major concerns are present that could lead to rejection.",
    // "Given the following academic reviews, evaluate the overall likelihood of paper acceptance at a conference. Please consider the range of feedback, including both strengths and weaknesses noted by the reviewers. Provide a final assessment by indicating \'Yes\' if the paper shows a high potential for acceptance due to substantial strengths, even in light of weaknesses, or \'No\' if critical issues consistently outweigh any merits across the reviews. Pay special attention to the synthesis of diverse opinions to arrive at a balanced conclusion.",
    "Assess the academic reviews of the paper by critically analyzing both numeric ratings and reviewer comments. Focus on identifying key strengths that highlight the paper\'s contributions and areas for improvement that could be addressed in a revision. If the reviews reveal substantial positive feedback that suggests the paper has merit and could be revised effectively, respond with \'Yes,\' indicating a reasonable chance of acceptance. However, if the majority of reviewers raise significant and insurmountable concerns that detract from the paper\'s viability, respond with \'No.\' Aim to provide a balanced judgment on the likelihood of acceptance based on the overall sentiment expressed in the reviews.",
    "Examine the following academic reviews and evaluate the acceptance of the related papers for a conference. Your task is to discern the paper\'s merits by assessing both the praised aspects and the criticisms expressed by the reviewers.\n\nWhen deciding on \'Acceptance,\' ensure that:\n- The paper contributes meaningfully to its field and introduces innovative concepts or methodologies.\n- The strengths identified by reviewers are strong enough to outweigh the criticisms. Notably, if reviewers suggest that the paper is worthy of revision to address some concerns, consider it a positive indication of potential acceptance.\n\nIf you determine the paper should be \'Not Accepted,\' assess whether:\n- The weaknesses presented are substantial enough to question the validity, significance, or reproducibility of the research.\n- There is a general feeling of uncertainty regarding the work\'s contribution to the field.\n\nProvide a concise summary of the strengths and weaknesses of each paper, leading to your acceptance decision that reflects the reviewers\' balanced insights.",
    // # APO on rebut 1
    "Analyze the reviews provided for the submitted manuscript and provide a classification of accepted (Yes) or rejected (No) for the academic conference. In your analysis, identify key strengths and weaknesses highlighted by the reviewers. Consider how reviewers\' positive comments and concerns weigh against each other, particularly focusing on aspects such as the novelty of the proposed methods, the rigor of experimental evidence, and any theoretical claims. Acknowledge that while some reviewers may express hesitations or weaknesses in their critiques, a general consensus on the manuscript\'s quality should guide your classification. Ensure that your final decision reflects a balanced view of both praise and criticism, taking into account any calls for further improvements or experiments suggested by the reviewers.",
    "Review the feedback provided by the reviewers on the academic paper, ensuring to capture both the positive insights and constructive criticisms. Consider how the reviewers weigh the significance of the contributions against the practical implications and the applicability of the methods discussed. Pay attention to the broader impacts mentioned, even if the numerical results exhibit only modest improvements. Conclusively determine whether the paper should be accepted (Yes) or rejected (No), reflecting a balanced evaluation of its overall contributions and relevance to the field.",
    "Based on the reviewers' evaluations, determine if the paper should be accepted (Yes) or rejected (No). In your assessment, consider the strengths and weaknesses identified by the reviewers, focusing on key elements such as the originality of the approach, relevance to the field, clarity of presentation, and the robustness of the experimental results. Weigh the feedback regarding the proposed methodology and its real-world applicability, along with any suggestions for improvement. Your rationale should demonstrate a holistic view of the paper's contribution to the field, including both the value it adds and any limitations that need addressing.",
    "Given the reviews below, assess the likelihood of acceptance for the paper based on the detailed strengths and weaknesses listed by the reviewers. Pay attention to the overall sentiment, noting both the positive aspects—such as innovative contributions, methodological rigor, and clarity—and the constructive criticisms, which may point to areas needing improvement. Consider aspects such as the novelty of the research, empirical evidence, theoretical contributions, and the robustness of experiments as you evaluate the paper\'s suitability for publication.", 
    'Analyze the provided reviews of a research paper and determine if the paper should be accepted (Yes) or rejected (No) based on the evaluations made by the reviewers. \nConsider both positive comments and criticisms carefully, particularly focusing on the novelty of the contribution, soundness of the methodology, and clarity of the presentation. \nBe attentive to the nuances in the reviewers\' comments—distinguishing between constructive feedback that suggests areas for improvement and substantial concerns that undermine the paper\'s overall merit. \nYour conclusion should reflect a balanced view of the paper’s contributions, limitations, and potential impact on the field. \nConclude with a clear classification of "Yes" or "No.', 
] 

export const PROMPT_TYPES = [
    {prompt: PROMPT_CANDIDATES[0], type: -1},
    {prompt: PROMPT_CANDIDATES[1], type: -1},
    {prompt: PROMPT_CANDIDATES[2], type: -1},
    {prompt: PROMPT_CANDIDATES[3], type: 0},
    {prompt: PROMPT_CANDIDATES[4], type: 0},
    {prompt: PROMPT_CANDIDATES[5], type: 0},
    {prompt: PROMPT_CANDIDATES[6], type: 0},
    {prompt: PROMPT_CANDIDATES[7], type: 1},
    {prompt: PROMPT_CANDIDATES[8], type: 1},
    {prompt: PROMPT_CANDIDATES[9], type: 1}, 
    {prompt: PROMPT_CANDIDATES[10], type: 1},
    {prompt: PROMPT_CANDIDATES[11], type: 1},
]

export const BASIC_PROMPT = PROMPT_CANDIDATES[0];

// Get all ICLR submissions
export const findAllIclrSubmissions = async () => {
    console.log("findAllIclrSubmissions");
    const response = await axios.get(`${ICLR_API}`).then((res) => res.data);
    return {data: response.data, name: response.name};
};


// Get all ICLR submissions without metareviews
export const findAllIclrSubmissionsWithPartialMetareviews = async () => {
    const response = await axios.get(`${ICLR_API}/with_partial_metareviews`).then((res) => res.data);
    return {data: response.data, name: response.name};
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

// Note: findIclrByYear function removed - use global year setting instead

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
    // console.log("response data length", response.data.data.length);
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

// Get predictions by paper ids and prompt and rebuttal
export const getPredsByPaperIdsAndPromptAndRebuttal = async (paperIds: string[], prompt: string, rebuttal: number) => {
    const response = await axios.post(`${PROMPT_API}/predictions_by_paper_ids_and_prompt_and_rebuttal`, { paper_ids: paperIds, prompt: prompt, rebuttal: rebuttal });
    return response.data;
};

// Get predictions by paper ids and prompt and rebuttal in batches
export const getPredsByPromptAndRebuttal = async (prompt: string, rebuttal: number) => {    
    const response = await axios.post(`${PROMPT_API}/predictions_by_prompt_and_rebuttal`, { prompt, rebuttal });
    return response.data;
};

// Get papers ranked by average rating
export const getPapersRankedByRating = async (limit: number) => {
    const response = await axios.get(`${ICLR_API}/ranked/rating/${limit}`);
    return response.data;
}





