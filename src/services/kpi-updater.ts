import { CronJob } from "cron";
import { calculateAndSaveKpis } from "../services/dashboard";
import moment from "moment";

// Run every day at midnight
export const kpiUpdateJob = new CronJob("0 0 * * *", async () => {
    console.log("Running KPI update job...");
    try {
        // Calculate for yesterday
        const yesterday = moment().subtract(1, "days").toDate();
        await calculateAndSaveKpis(yesterday);
        console.log("KPI update job finished successfully.");
    } catch (error) {
        console.error("Error running KPI update job:", error);
    }
});
