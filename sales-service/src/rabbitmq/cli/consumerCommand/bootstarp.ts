import { CommandFactory } from "nest-commander";
import { ConsumerModule } from "../../consumer/salesConsume.module"
import { config } from "dotenv";

async function bootstrap() {
  config();
  await CommandFactory.runWithoutClosing(ConsumerModule, ["warn", "error"]);
}

bootstrap();