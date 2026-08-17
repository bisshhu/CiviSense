import "dotenv/config";

import mongoose from "mongoose";
import { findGovernmentPortals } from "./services/portal.services.js";

const test = async () => {
    try {

        // Connect MongoDB
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        // Test complaint information
        const issueType = "pothole";
        const state = "Karnataka";
        const district = "Belagavi";
        const city = "Belagavi";

        const complaintText =
            "There are large potholes near MG Road causing danger to vehicles and pedestrians.";

        // Find government portals
        const portals = await findGovernmentPortals({
            issueType,
            state,
            district,
            city,
            complaintText,
        });

        console.log("\nDISCOVERED PORTALS:\n");

        if (portals.length === 0) {
            console.log("No government portals found.");
            return;
        }

        portals.forEach((portal, index) => {

            console.log(
                `${index + 1}. ${portal.name}`
            );

            console.log(
                `Portal URL: ${portal.url}`
            );

            console.log(
                `Source Page: ${portal.sourcePage}`
            );

            console.log(
                `Verified: ${portal.verified}`
            );

            console.log(
                `Issue Types: ${portal.issueTypes?.join(", ")}`
            );

            console.log(
                `Description: ${portal.description}`
            );

            console.log("");
        });

    } catch (error) {

        console.error(
            "\nTEST FAILED:"
        );

        console.error(error);

    } finally {

        await mongoose.disconnect();

    }
};

test();