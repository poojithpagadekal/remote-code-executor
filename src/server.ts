import app from "./app";
import logger from "./config/logger";
import { ENV } from "./config/env";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
