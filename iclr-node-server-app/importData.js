import "dotenv/config";
import mongoose from "mongoose";
import fs from 'fs';
import { Transform } from 'stream';
import submissioSchema from "./02ICLR/schema.js";
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

const BATCH_SIZE = 200;

async function importData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(CONNECTION_STRING, {dbName: "iclr_2024"}, {collection: "iclr_2025"});
    console.log("Connected to MongoDB");

    // Read the JSON file
    const model = mongoose.model("iclr_2025", submissioSchema);
    const data = JSON.parse(fs.readFileSync('./data/reviews_2025_ICLR.json', 'utf8'));
    console.log(`Found ${data.length} documents to import`);

    // Clear existing data (optional)
    // await model.deleteMany({});
    // console.log("Cleared existing data");

    // Insert the data in batches
    let totalImported = 0;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const result = await model.insertMany(batch);
      totalImported += result.length;
      console.log(`Imported batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.length} documents (Total: ${totalImported}/${data.length})`);
    }

    console.log(`Successfully imported ${totalImported} documents in batches of ${BATCH_SIZE}`);

    // Verify the import
    const count = await model.countDocuments();
    console.log(`Total documents in collection: ${count}`);

  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

importData(); 