import mongoose from 'mongoose';
import predictionSchema from './05Prompt/schema.js';
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

async function deleteDuplicates() {
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
                const collection = mongoose.model('prediction_2025', predictionSchema);
                const targetPrompt = "Given the following academic reviews, evaluate the overall likelihood of paper acceptance at a conference. Please consider the range of feedback, including both strengths and weaknesses noted by the reviewers. Provide a final assessment by indicating 'Yes' if the paper shows a high potential for acceptance due to substantial strengths, even in light of weaknesses, or 'No' if critical issues consistently outweigh any merits across the reviews. Pay special attention to the synthesis of diverse opinions to arrive at a balanced conclusion.";

                // group all documents with the same, specific prompt, rebuttal 1, same paper_id, same paper_title
                const documents = await collection.find({ prompt: targetPrompt , rebuttal: 1}).lean();
                console.log(`Found ${documents.length} documents with this prompt`);
                const groupedDocuments = documents.reduce((acc, doc) => {
                    const key = `${doc.paper_id}-${doc.paper_title}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(doc);
                    return acc;
                }, {});
                console.log(`Found ${Object.keys(groupedDocuments).length} groups`);
                
                // Delete duplicates
                await collection.deleteMany({ _id: { $in: Object.values(groupedDocuments).flat().map(doc => doc._id) } });
                console.log(`Deleted ${Object.values(groupedDocuments).flat().length} duplicates`);

    
                // // Delete duplicates
                // await collection.deleteMany({ _id: { $in: duplicates.map(doc => doc._id) } });
                // console.log(`Deleted ${duplicates.length} duplicates`);
                
            
                
            } catch (err) {
                console.error('Error during duplicate removal process:', err.message);
                // Ensure proper cleanup even on error
                await mongoose.disconnect();
                console.log('MongoDB connection closed');
                process.exit(1);
            } finally {
                // Clean up
                await mongoose.disconnect();
                console.log('MongoDB connection closed');
            }
        }); 
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
}

deleteDuplicates(); 