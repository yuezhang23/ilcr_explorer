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

const candidates = [
    'Assess the reviews provided for the paper and determine whether it should be accepted at an academic conference. Take into account the strengths, weaknesses, soundness, presentation, and contribution ratings, while being mindful that a paper may still warrant acceptance despite having some weaknesses. Focus on the overall impact and significance of the contributions, as well as how effectively the paper addresses its challenges. Your assessment should reflect a nuanced understanding of the review process, leading to a thoughtful recommendation based on the balance of merits and shortcomings.',
    'Evaluate the reviews provided for the paper and determine whether it should be accepted at an academic conference. When making your assessment, weigh the strengths against the weaknesses, considering the overall soundness, presentation, and contributions of the paper. Recognize that a paper may still be worthy of acceptance even if it has notable weaknesses, especially if the contributions are significant and the weaknesses are manageable. Your recommendation should reflect a balanced view that integrates the merits and shortcomings, focusing on the paper\'s overall impact and relevance to the field.',
    'Evaluate the following academic paper reviews and determine whether the paper should be accepted (Yes) or rejected (No). Focus on the strengths and weaknesses identified by the reviewers, particularly those that suggest a significant contribution or potential impact of the paper despite existing concerns. Pay attention to nuanced evaluations, especially those indicating borderline acceptance or rejection, and consider how positive aspects may outweigh negative ones. Your final decision should reflect a comprehensive understanding of the reviews and the overall contribution of the paper within its research domain.',
    'Analyze the peer reviews of the research paper to formulate a contextual recommendation for its acceptance (Yes) or rejection (No). Assess the originality of the contributions, empirical validity, and clarity of the results while systematically reviewing specific comments from peer evaluations. Make recommendations based on a net evaluation where strengths are clearly articulated, effectively outweighing acknowledged limitations. Ensure that your final decision carefully integrates the diversity of insights from the reviews, accentuating its scientific significance and endorsing actionable feedback. Aim to consolidate the overall impression that highlights both the impact of the research and realistic evaluations from the reviewers.',
    'Evaluate the following reviews of an academic paper and provide a recommendation for acceptance based on the overall sentiment expressed by the reviewers. Your assessment should summarize key strengths and weaknesses highlighted in the reviews, emphasizing how they contribute to the overall evaluation of the paper. Weigh the strengths against the weaknesses to determine the paper\'s potential contribution to its field. Based on your evaluation, recommend one of the following: \'Accept\' (Yes), \'Reject\' (No), or \'Borderline\'. Justify your recommendation by articulating the overall sentiment toward the paper, while ensuring that it aligns with the specific points raised by the reviewers.',
    "Given the following reviews (text), determine if a paper would be accepted (Yes) or not (No) by an academic conference.",
    "Given the following reviews, determine if the paper being reviewed would be accepted at an academic conference.",
    'Assess the given academic paper reviews to determine if the paper should be accepted (Yes) or rejected (No). Consider both the positive and negative feedback from the reviewers, keeping in mind that some minor issues might not outweigh a paper\'s significant contributions. Pay particular attention to nuanced ratings and phrases that suggest the paper is close to meeting acceptance criteria, such as "borderline reject" or "marginally below the acceptance threshold." Your final decision should capture the reviewers\' overall sentiment and evaluate the paper\'s potential impact within its field, rather than fixating on specific flaws.',
] 

// Name of the JSONL file to import
const JSONL_FILE = './data/result_no_rebut.jsonl';

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
                const Prediction = mongoose.model('prediction', predictionSchema);
                const ICLR2024 = mongoose.model('iclr_2024', submissioSchema);

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
                        paper_id,
                        paper_title,
                        model: 'gpt-4o-mini', // Explicitly set the model
                        rebuttal,
                        prediction: prediction, // Use the corrected prediction value
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