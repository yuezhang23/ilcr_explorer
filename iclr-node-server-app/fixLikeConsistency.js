import "dotenv/config";
import mongoose from "mongoose";
import { fixLikeTitleInconsistencies } from "./03PublicReviews/dao.js";

const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

async function fixConsistency() {
  try {
    // Connect to MongoDB
    await mongoose.connect(CONNECTION_STRING, {dbName: "openreview"});
    console.log("Connected to MongoDB");

    // Fix inconsistencies
    const fixedCount = await fixLikeTitleInconsistencies();
    console.log(`Successfully fixed ${fixedCount} inconsistencies`);

  } catch (error) {
    console.error("Error fixing consistency:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the fix
fixConsistency(); 