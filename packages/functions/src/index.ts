import * as functions from "firebase-functions";
import { defineString } from "firebase-functions/params";
import { generateCronJob } from "./generateCronJob";

const ENV = defineString("NEXT_PUBLIC_ENVIRONMENT");

exports.distributeAllowances = functions
  .runWith({
    // 9 minutes (max)
    timeoutSeconds: 540,
  })
  .pubsub.schedule(
    ENV.equals("production").thenElse(true, false)
      ? // This uses PST timezone!
        "0 12 * * *"
      : "*/5 * * * *",
  )

  .onRun(generateCronJob("admin.distributeAllowances"));
