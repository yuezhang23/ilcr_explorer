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
                const Prediction = mongoose.model('predictions', predictionSchema);
                const Prediction2025 = mongoose.model('prediction_2025', predictionSchema);

                // Function to delete duplicates from a collection using a more efficient approach
                async function removeDuplicatesFromCollection(collection, collectionName) {
                    console.log(`\n=== Processing ${collectionName} collection ===`);
                    
                    // Get total count before processing
                    const totalCount = await collection.countDocuments();
                    console.log(`Total documents in ${collectionName}: ${totalCount}`);

                    // Create a temporary index to help with duplicate detection
                    try {
                        await collection.createIndex({
                            paper_id: 1,
                            prompt: 1,
                            rebuttal: 1,
                            prompt_type: 1
                        }, { background: true });
                        console.log('Created temporary index for duplicate detection');
                    } catch (err) {
                        console.log('Index might already exist, continuing...');
                    }

                    let totalDeleted = 0;
                    let processedGroups = 0;

                    // Process in smaller chunks to avoid memory issues
                    const CHUNK_SIZE = 1000;
                    let skip = 0;
                    let hasMore = true;

                    while (hasMore) {
                        // Get a chunk of documents
                        const documents = await collection.find({})
                            .skip(skip)
                            .limit(CHUNK_SIZE)
                            .lean();

                        if (documents.length === 0) {
                            hasMore = false;
                            break;
                        }

                        // Group documents by the combination of fields
                        const groups = new Map();
                        documents.forEach(doc => {
                            const key = `${doc.paper_id}_${doc.prompt}_${doc.rebuttal}_${doc.prompt_type}`;
                            if (!groups.has(key)) {
                                groups.set(key, []);
                            }
                            groups.get(key).push(doc);
                        });

                        // Process duplicates in this chunk
                        for (const [key, docs] of groups) {
                            if (docs.length > 1) {
                                // Keep the first document, delete the rest
                                const docsToDelete = docs.slice(1);
                                const docIdsToDelete = docsToDelete.map(doc => doc._id);
                                
                                const deleteResult = await collection.deleteMany({ 
                                    _id: { $in: docIdsToDelete } 
                                });
                                
                                totalDeleted += deleteResult.deletedCount;
                                processedGroups++;
                                
                                if (processedGroups % 100 === 0) {
                                    console.log(`Processed ${processedGroups} duplicate groups, deleted ${totalDeleted} documents`);
                                }
                            }
                        }

                        skip += CHUNK_SIZE;
                        console.log(`Processed chunk starting at ${skip - CHUNK_SIZE}, found ${groups.size} unique groups`);
                    }

                    console.log(`Total duplicates deleted from ${collectionName}: ${totalDeleted}`);

                    // Get final count
                    const finalCount = await collection.countDocuments();
                    console.log(`Final document count in ${collectionName}: ${finalCount}`);
                    console.log(`Net reduction: ${totalCount - finalCount} documents`);

                    return { totalDeleted, finalCount };
                }

                // Process both collections
                const predictionsResult = await removeDuplicatesFromCollection(Prediction, 'predictions');
                const prediction2025Result = await removeDuplicatesFromCollection(Prediction2025, 'prediction_2025');

                console.log('\n=== Summary ===');
                console.log(`predictions collection: ${predictionsResult.totalDeleted} duplicates deleted, final count: ${predictionsResult.finalCount}`);
                console.log(`prediction_2025 collection: ${prediction2025Result.totalDeleted} duplicates deleted, final count: ${prediction2025Result.finalCount}`);
                console.log(`Total duplicates removed: ${predictionsResult.totalDeleted + prediction2025Result.totalDeleted}`);

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