import { CommandFactory } from "nest-commander";
import { ProducerModule } from "../publisher/publisher.module";
import { config } from "dotenv";

async function bootstrap() {
  config();
  await CommandFactory.run(ProducerModule, ["warn", "error"]);
}

bootstrap();