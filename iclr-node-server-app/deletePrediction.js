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
                // Define the Prediction model
                const Prediction = mongoose.model('prediction', predictionSchema);

                // First, count how many documents have rebuttal field equal to 0
                console.log('Counting documents with rebuttal field equal to 0...');
                const countBefore = await Prediction.countDocuments({ rebuttal: 0 }).maxTimeMS(30000);
                console.log(`Found ${countBefore} documents with rebuttal field equal to 0`);

                if (countBefore === 0) {
                    console.log('No documents to delete. Exiting...');
                    return;
                }

                // Ask for confirmation (you can comment this out if you want to run without confirmation)
                console.log('About to delete all documents with rebuttal field equal to 0.');
                console.log('This action cannot be undone. Proceeding with deletion...');

                // Delete all documents where rebuttal field equals 0
                console.log('Deleting documents...');
                const deleteResult = await Prediction.deleteMany({ rebuttal: 0 }).maxTimeMS(60000); // 60 second timeout
                
                console.log(`Successfully deleted ${deleteResult.deletedCount} documents`);

                // Verify deletion by counting again
                const countAfter = await Prediction.countDocuments({ rebuttal: 0 }).maxTimeMS(30000);
                console.log(`Remaining documents with rebuttal field equal to 0: ${countAfter}`);

                if (countAfter === 0) {
                    console.log('✅ All documents with rebuttal field equal to 0 have been successfully deleted.');
                } else {
                    console.log('⚠️  Some documents with rebuttal field equal to 0 still remain.');
                }

                // Get total count of remaining documents
                const totalRemaining = await Prediction.countDocuments({}).maxTimeMS(30000);
                console.log(`Total remaining documents in prediction collection: ${totalRemaining}`);
                
            } catch (err) {
                console.error('Error during deletion process:', err.message);
            } finally {
                // Ensure proper cleanup
                await mongoose.disconnect();
                console.log('MongoDB connection closed');
                process.exit(0);
            }
        }); 
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
}

main(); 