import mongoose from "mongoose";
import predictionStatsSchema from "./06PredictionStas/schema.js";
import { getPredsByPromptAndRebuttal } from "./05Prompt/dao.js";
import { getCurrentYear } from "./config/globalConfig.js";
import fs from "fs";
import path from "path";

import dotenv from 'dotenv';

dotenv.config();
// Update this with your MongoDB connection string
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

// Enhanced connection options to prevent timeouts
const connectionOptions = {
    dbName: "iclr_2024",
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority'
};

// Connect to MongoDB
mongoose.connect(CONNECTION_STRING, connectionOptions);

// Prompt candidates and types (copied from home.ts)
const PROMPT_CANDIDATES = [
    "Given the following reviews (text), determine if a paper would be accepted (Yes) or not (No) by an academic conference.",
    "Given the following reviews, determine if the paper being reviewed would be accepted at an academic conference.",
    "Analyze the reviews provided for the submitted manuscript and provide a classification of accepted (Yes) or rejected (No) for the academic conference.",
    // # APO on rebut 0
    "Given the following academic reviews, evaluate the overall likelihood of paper acceptance at a conference. Please consider the range of feedback, including both strengths and weaknesses noted by the reviewers. Provide a final assessment by indicating \'Yes\' if the paper shows a high potential for acceptance due to substantial strengths, even in light of weaknesses, or \'No\' if critical issues consistently outweigh any merits across the reviews. Pay special attention to the synthesis of diverse opinions to arrive at a balanced conclusion.", 
    "Evaluate the potential for paper acceptance at a conference by analyzing the provided academic reviews. Focus on the significance of both strengths and weaknesses noted by the reviewers, and take into account their ratings on soundness, presentation, and contribution. Identify the tone and overarching themes in the reviews—do the strengths outweigh the weaknesses? \nConclude with \'Yes\' if the reviewer\'s feedback suggests a favorable overall impression with acceptable flaws, and \'No\' if major concerns are present that could lead to rejection.",
    "Assess the academic reviews of the paper by critically analyzing both numeric ratings and reviewer comments. Focus on identifying key strengths that highlight the paper\'s contributions and areas for improvement that could be addressed in a revision. If the reviews reveal substantial positive feedback that suggests the paper has merit and could be revised effectively, respond with \'Yes,\' indicating a reasonable chance of acceptance. However, if the majority of reviewers raise significant and insurmountable concerns that detract from the paper\'s viability, respond with \'No.\' Aim to provide a balanced judgment on the likelihood of acceptance based on the overall sentiment expressed in the reviews.",
    "Examine the following academic reviews and evaluate the acceptance of the related papers for a conference. Your task is to discern the paper\'s merits by assessing both the praised aspects and the criticisms expressed by the reviewers.\n\nWhen deciding on \'Acceptance,\' ensure that:\n- The paper contributes meaningfully to its field and introduces innovative concepts or methodologies.\n- The strengths identified by reviewers are strong enough to outweigh the criticisms. Notably, if reviewers suggest that the paper is worthy of revision to address some concerns, consider it a positive indication of potential acceptance.\n\nIf you determine the paper should be \'Not Accepted,\' assess whether:\n- The weaknesses presented are substantial enough to question the validity, significance, or reproducibility of the research.\n- There is a general feeling of uncertainty regarding the work\'s contribution to the field.\n\nProvide a concise summary of the strengths and weaknesses of each paper, leading to your acceptance decision that reflects the reviewers\' balanced insights.",
    // # APO on rebut 1
    "Analyze the reviews provided for the submitted manuscript and provide a classification of accepted (Yes) or rejected (No) for the academic conference. In your analysis, identify key strengths and weaknesses highlighted by the reviewers. Consider how reviewers\' positive comments and concerns weigh against each other, particularly focusing on aspects such as the novelty of the proposed methods, the rigor of experimental evidence, and any theoretical claims. Acknowledge that while some reviewers may express hesitations or weaknesses in their critiques, a general consensus on the manuscript\'s quality should guide your classification. Ensure that your final decision reflects a balanced view of both praise and criticism, taking into account any calls for further improvements or experiments suggested by the reviewers.",
    "Review the feedback provided by the reviewers on the academic paper, ensuring to capture both the positive insights and constructive criticisms. Consider how the reviewers weigh the significance of the contributions against the practical implications and the applicability of the methods discussed. Pay attention to the broader impacts mentioned, even if the numerical results exhibit only modest improvements. Conclusively determine whether the paper should be accepted (Yes) or rejected (No), reflecting a balanced evaluation of its overall contributions and relevance to the field.",
    "Based on the reviewers' evaluations, determine if the paper should be accepted (Yes) or rejected (No). In your assessment, consider the strengths and weaknesses identified by the reviewers, focusing on key elements such as the originality of the approach, relevance to the field, clarity of presentation, and the robustness of the experimental results. Weigh the feedback regarding the proposed methodology and its real-world applicability, along with any suggestions for improvement. Your rationale should demonstrate a holistic view of the paper's contribution to the field, including both the value it adds and any limitations that need addressing.",
    "Given the reviews below, assess the likelihood of acceptance for the paper based on the detailed strengths and weaknesses listed by the reviewers. Pay attention to the overall sentiment, noting both the positive aspects—such as innovative contributions, methodological rigor, and clarity—and the constructive criticisms, which may point to areas needing improvement. Consider aspects such as the novelty of the research, empirical evidence, theoretical contributions, and the robustness of experiments as you evaluate the paper\'s suitability for publication.", 
    'Analyze the provided reviews of a research paper and determine if the paper should be accepted (Yes) or rejected (No) based on the evaluations made by the reviewers. \nConsider both positive comments and criticisms carefully, particularly focusing on the novelty of the contribution, soundness of the methodology, and clarity of the presentation. \nBe attentive to the nuances in the reviewers\' comments—distinguishing between constructive feedback that suggests areas for improvement and substantial concerns that undermine the paper\'s overall merit. \nYour conclusion should reflect a balanced view of the paper\'s contributions, limitations, and potential impact on the field. \nConclude with a clear classification of "Yes" or "No.', 
];




// Run the import
importPredictionStats();

async function importPredictionStats() {
    try {
        console.log('Starting import of prediction stats...');
        
        // Read the JSONL file
        const filePath = path.join(process.cwd(), 'prediction_stats.jsonl');
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.trim().split('\n');
        
        console.log(`Found ${lines.length} lines to process`);
        
        // Get the model
        const PredictionStats = mongoose.model('PredictionStats', predictionStatsSchema);
        
        // Clear existing data
        await PredictionStats.deleteMany({});
        console.log('Cleared existing prediction stats');
        
        let importedCount = 0;
        
        for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
                const data = JSON.parse(line);
                
                // Map prompt number to actual prompt text from PROMPT_CANDIDATES
                const promptIndex = parseInt(data.prompt) - 1; // Convert to 0-indexed
                if (promptIndex < 0 || promptIndex >= PROMPT_CANDIDATES.length) {
                    console.warn(`Invalid prompt index: ${data.prompt}, skipping...`);
                    continue;
                }
                
                // Create the document with the actual prompt text
                const predictionStatsDoc = new PredictionStats({
                    prompt: PROMPT_CANDIDATES[promptIndex],
                    prompt_type: data.prompt_type,
                    predictions: data.predictions
                });
                
                await predictionStatsDoc.save();
                importedCount++;
                
                console.log(`Imported prompt ${data.prompt} (type: ${data.prompt_type}) with ${data.predictions.length} prediction entries`);
                
            } catch (parseError) {
                console.error(`Error parsing line: ${line}`, parseError);
            }
        }
        
        console.log(`Successfully imported ${importedCount} prediction stats documents`);
        
        // Verify the import
        const totalCount = await PredictionStats.countDocuments();
        console.log(`Total documents in database: ${totalCount}`);
        
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

export default importPredictionStats; 