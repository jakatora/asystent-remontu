import app from "./app";
import { logger } from "./lib/logger";
import { getDb } from "./lib/db";
import {
  resolveSchedulerConfigFromEnv,
  startPriceCollectorScheduler,
} from "./scheduler";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Cykliczny scheduler Price Collectora — rejestrujemy TYLKO gdy włączony przez
  // ENV (COLLECT_INTERVAL_MS). Nie blokuje startu serwera; błąd DB nie ubija procesu.
  const schedulerConfig = resolveSchedulerConfigFromEnv(process.env);
  if (schedulerConfig.enabled) {
    try {
      startPriceCollectorScheduler({
        db: getDb(),
        intervalMs: schedulerConfig.intervalMs,
        runOnStart: schedulerConfig.runOnStart,
      });
      logger.info(
        {
          intervalMs: schedulerConfig.intervalMs,
          runOnStart: schedulerConfig.runOnStart,
        },
        "Price collector scheduler enabled",
      );
    } catch (schedErr) {
      logger.error(
        { err: schedErr },
        "Price collector scheduler failed to start (kontynuuję bez niego)",
      );
    }
  } else {
    logger.info(
      {},
      "Price collector scheduler disabled (brak dodatniego COLLECT_INTERVAL_MS)",
    );
  }
});
