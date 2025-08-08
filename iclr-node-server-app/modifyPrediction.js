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


                // 1. find prediciton records from Prediction model with prompt from initial_prompts
                // 2. match those record from iclr_2024 by s_id and add decision field to those records
                // 3. save the updated records to the Prediction model

                const predictions = await Prediction.find({ prompt: { $in: initial_prompts } });
                console.log(`Found ${predictions.length} predictions`);

                // Delete the original predictions to avoid duplicates
                if (predictions.length > 0) {
                    const predictionIds = predictions.map(pred => pred._id);
                    const deleteResult = await Prediction.deleteMany({ _id: { $in: predictionIds } });
                    console.log(`Deleted ${deleteResult.deletedCount} original predictions`);
                }

                for (const pred of predictions) {
                    const paper = await ICLR2024.findOne({ _id: pred.paper_id });
                    if (paper) {
                        pred.decision = paper.decision === 'Reject' ? 'Reject' : 'Accept';
                        pred.prompt_type = -1;
                        pred.prediction = pred.prediction.toLowerCase() === 'yes' || pred.prediction.toLowerCase() === 'accept' ? 'Accept' : pred.prediction.toLowerCase() === 'no' || pred.prediction.toLowerCase() === 'reject' ? 'Reject' : 'Borderline';
                    }
                }

                await Prediction.insertMany(predictions);
                console.log(`Updated ${predictions.length} predictions`);
                
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