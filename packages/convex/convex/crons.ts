import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//   "migrate promotion ids",
//   { seconds: 5 },
//   internal.migrations.migratePromotionIds,
// );

export default crons;
