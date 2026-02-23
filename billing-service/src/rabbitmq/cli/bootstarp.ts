import { CommandFactory } from "nest-commander";
import { ConsumerModule } from "../consumer/consumer.module"
import { config } from "dotenv";

async function bootstrap() {
  config();
  await CommandFactory.runWithoutClosing(ConsumerModule, ["warn", "error"]);
}

bootstrap();