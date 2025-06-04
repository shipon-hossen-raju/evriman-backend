import { Server } from "http";
import cron from "node-cron";
import app from "./app";
import config from "./config";
import {
  checkSubscription,
  updateOfferCodesEveryDay,
  updateUserAges,
} from "./shared/everyDayCheck";

let server: Server;

async function startServer() {
  server = app.listen(config.port, () => {
    // Runs every day
    cron.schedule("0 0 * * *", () => {
      console.log("Running checkSubscription, updateUserAges every day...");

      checkSubscription();
      updateUserAges();
      updateOfferCodesEveryDay();
    });

    console.log("Server is listiening on port ", config.port);
  });
}

async function main() {
  await startServer();
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info("Server closed!");
        restartServer();
      });
    } else {
      process.exit(1);
    }
  };

  const restartServer = () => {
    console.info("Restarting server...");
    main();
  };

  process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception: ", error);
    exitHandler();
  });

  process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection: ", error);
    exitHandler();
  });

  // Handling the server shutdown with SIGTERM and SIGINT
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down gracefully...");
    exitHandler();
  });

  process.on("SIGINT", () => {
    console.log("SIGINT signal received. Shutting down gracefully...");
    exitHandler();
  });
}

main();
