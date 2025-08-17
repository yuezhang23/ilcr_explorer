import mongoose from 'mongoose';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import predictionSchema from './05Prompt/schema.js';
import submissioSchema from "./02ICLR/schema.js";
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

mongoose.connect(CONNECTION_STRING, connectionOptions);

const BATCH_SIZE = 100; // Reduced batch size to prevent timeouts

const initial_prompts = [
    "Given the following reviews (text), determine if a paper would be accepted (Yes) or not (No) by an academic conference.",
    "Given the following reviews, determine if the paper being reviewed would be accepted at an academic conference.",
]

const candidates = [
    // "Analyze the reviews provided for the submitted manuscript and provide a classification of accepted (Yes) or rejected (No) for the academic conference. In your analysis, identify key strengths and weaknesses highlighted by the reviewers. Consider how reviewers\' positive comments and concerns weigh against each other, particularly focusing on aspects such as the novelty of the proposed methods, the rigor of experimental evidence, and any theoretical claims. Acknowledge that while some reviewers may express hesitations or weaknesses in their critiques, a general consensus on the manuscript\'s quality should guide your classification. Ensure that your final decision reflects a balanced view of both praise and criticism, taking into account any calls for further improvements or experiments suggested by the reviewers.",
    // "Review the feedback provided by the reviewers on the academic paper, ensuring to capture both the positive insights and constructive criticisms. Consider how the reviewers weigh the significance of the contributions against the practical implications and the applicability of the methods discussed. Pay attention to the broader impacts mentioned, even if the numerical results exhibit only modest improvements. Conclusively determine whether the paper should be accepted (Yes) or rejected (No), reflecting a balanced evaluation of its overall contributions and relevance to the field.",
    // "Based on the reviewers' evaluations, determine if the paper should be accepted (Yes) or rejected (No). In your assessment, consider the strengths and weaknesses identified by the reviewers, focusing on key elements such as the originality of the approach, relevance to the field, clarity of presentation, and the robustness of the experimental results. Weigh the feedback regarding the proposed methodology and its real-world applicability, along with any suggestions for improvement. Your rationale should demonstrate a holistic view of the paper's contribution to the field, including both the value it adds and any limitations that need addressing.",
    // "Given the reviews below, assess the likelihood of acceptance for the paper based on the detailed strengths and weaknesses listed by the reviewers. Pay attention to the overall sentiment, noting both the positive aspects—such as innovative contributions, methodological rigor, and clarity—and the constructive criticisms, which may point to areas needing improvement. Consider aspects such as the novelty of the research, empirical evidence, theoretical contributions, and the robustness of experiments as you evaluate the paper\'s suitability for publication.", 
    // // # APO rebut 0
    "Given the following academic reviews, evaluate the overall likelihood of paper acceptance at a conference. Please consider the range of feedback, including both strengths and weaknesses noted by the reviewers. Provide a final assessment by indicating \'Yes\' if the paper shows a high potential for acceptance due to substantial strengths, even in light of weaknesses, or \'No\' if critical issues consistently outweigh any merits across the reviews. Pay special attention to the synthesis of diverse opinions to arrive at a balanced conclusion.", 
    "Evaluate the potential for paper acceptance at a conference by analyzing the provided academic reviews. Focus on the significance of both strengths and weaknesses noted by the reviewers, and take into account their ratings on soundness, presentation, and contribution. Identify the tone and overarching themes in the reviews—do the strengths outweigh the weaknesses? \nConclude with \'Yes\' if the reviewer\'s feedback suggests a favorable overall impression with acceptable flaws, and \'No\' if major concerns are present that could lead to rejection.",
    // "Given the following academic reviews, evaluate the overall likelihood of paper acceptance at a conference. Please consider the range of feedback, including both strengths and weaknesses noted by the reviewers. Provide a final assessment by indicating \'Yes\' if the paper shows a high potential for acceptance due to substantial strengths, even in light of weaknesses, or \'No\' if critical issues consistently outweigh any merits across the reviews. Pay special attention to the synthesis of diverse opinions to arrive at a balanced conclusion.",
    "Assess the academic reviews of the paper by critically analyzing both numeric ratings and reviewer comments. Focus on identifying key strengths that highlight the paper\'s contributions and areas for improvement that could be addressed in a revision. If the reviews reveal substantial positive feedback that suggests the paper has merit and could be revised effectively, respond with \'Yes,\' indicating a reasonable chance of acceptance. However, if the majority of reviewers raise significant and insurmountable concerns that detract from the paper\'s viability, respond with \'No.\' Aim to provide a balanced judgment on the likelihood of acceptance based on the overall sentiment expressed in the reviews."

] 

// Name of the JSONL file to import
const JSONL_FILE = './data/24_result_rebut_prompt_0_add.jsonl';

// Connect to MongoDB
async function main() {
    try {
        const db = mongoose.connection;
        
        // Enhanced error handling
        db.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        });

        db.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        db.once('open', async () => {
            console.log('Connected to MongoDB');

            try {
                // Define models
                const Prediction = mongoose.model('predictions', predictionSchema);
                const ICLR2024 = mongoose.model('iclr_2024', submissioSchema);

                // Delete all existing documents without prompt_type field, except those with prompt values in initial_prompts
                console.log('Deleting existing documents without prompt_type field (except those with initial_prompts)...');
                
                // First, find documents that don't have prompt_type field
                const docsWithoutPromptType = await Prediction.find({ prompt_type: { $exists: false } });
                console.log(`Found ${docsWithoutPromptType.length} documents without prompt_type field`);
                
                // Filter out documents where prompt is in initial_prompts
                const docsToDelete = docsWithoutPromptType.filter(doc => {
                    return !initial_prompts.includes(doc.prompt);
                });
                
                console.log(`Found ${docsToDelete.length} documents to delete (excluding ${docsWithoutPromptType.length - docsToDelete.length} with initial_prompts)`);
                
                // Delete the filtered documents
                // if (docsToDelete.length > 0) {
                //     const docIdsToDelete = docsToDelete.map(doc => doc._id);
                //     const deleteResult = await Prediction.deleteMany({ _id: { $in: docIdsToDelete } });
                //     console.log(`Deleted ${deleteResult.deletedCount} existing documents without prompt_type field (excluding initial_prompts)`);
                // } else {
                //     console.log('No documents to delete');
                // }

                // Read JSONL file line by line
                const rl = readline.createInterface({
                    input: fs.createReadStream(JSONL_FILE),
                    crlfDelay: Infinity
                });

                let count = 0;
                let batch = [];
                let batchNumber = 0;
                // const RESUME_FROM_RECORD = 46160; 
                let currentRecord = 0;

                for await (const line of rl) {
                    currentRecord++;                
                    // Skip records until we reach the resume point
                    // if (currentRecord < RESUME_FROM_RECORD) {
                    //     console.log(`Skipping record ${currentRecord} (resuming from ${RESUME_FROM_RECORD})`);
                    //     continue;
                    // }
                    
                    if (!line.trim()) continue;
                    let record;
                    try {
                        record = JSON.parse(line);
                    } catch (err) {
                        console.error('Invalid JSON:', line);
                        continue;
                    }
                    const { prompt, rebuttal, s_id } = record;
                    // Handle the typo in the JSON field name: "prediciton" instead of "prediction"
                    const prediction = record.prediciton || record.prediction;

                    if (prompt == null || s_id == null) {
                        console.error('Missing prompt or s_id:', record);
                        continue;
                    }
                    
                    // Find paper in iclr_2024 with timeout handling
                    let paper;
                    try {
                            paper = await ICLR2024.findOne({ s_id });
                        if (!paper) {
                            console.error(`No iclr_2024 paper found for s_id: ${s_id}`);
                            continue;
                        }
                    } catch (err) {
                        console.error(`Error finding paper for s_id ${s_id}:`, err.message);
                        continue;
                    }
                    
                    const paper_id = paper._id;
                    const paper_title = paper.title || '';
                    
                    // Create prediction document
                    const doc = {
                        prompt: candidates[prompt],
                        prompt_type: 0,
                        paper_id,
                        paper_title,
                        model: 'gpt-4o-mini', // Explicitly set the model
                        rebuttal,
                        prediction: prediction.toLowerCase() === 'yes' || prediction.toLowerCase() === 'accept' ? 'Accept' : prediction.toLowerCase() === 'no' || prediction.toLowerCase() === 'reject' ? 'Reject' : 'Borderline', // Use the corrected prediction value
                        decision: paper.decision.toLowerCase() === 'no' || paper.decision.toLowerCase() === 'reject' ? 'Reject' : 'Accept',
                    };

                    console.log(`Processing record ${currentRecord}:`, doc);
                    batch.push(doc);
                    count++;

                    // When batch is full, insert it
                    if (batch.length >= BATCH_SIZE) {
                        try {
                            const result = await Prediction.insertMany(batch);
                            batchNumber++;
                            console.log(`Imported batch ${batchNumber}: ${result.length} records (Total: ${count} records, Current record: ${currentRecord})`);
                            // Reset batch
                            batch = []; 
                            
                            // Add a small delay between batches to prevent overwhelming the database
                            await new Promise(resolve => setTimeout(resolve, 100));
                        } catch (err) {
                            console.error('Error saving batch:', err.message);
                            // Continue with next batch even if this one fails
                            batch = [];
                        }
                    }
                }

                // Insert remaining records in the last batch
                if (batch.length > 0) {
                    try {
                        const result = await Prediction.insertMany(batch);
                        batchNumber++;
                        console.log(`Imported final batch ${batchNumber}: ${result.length} records (Total: ${count} records, Final record: ${currentRecord})`);
                    } catch (err) {
                        console.error('Error saving final batch:', err.message);
                    }
                }

                console.log(`Import completed. Total records processed: ${count} (from record 1 to ${currentRecord})`);
                
                // Ensure proper cleanup
                await mongoose.disconnect();
                console.log('MongoDB connection closed');
                process.exit(0);
                
            } catch (err) {
                console.error('Error during import process:', err.message);
                // Ensure proper cleanup even on error
                await mongoose.disconnect();
                console.log('MongoDB connection closed');
                process.exit(1);
            }
        }); 
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
}

main();