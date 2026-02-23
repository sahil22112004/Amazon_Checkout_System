import { Command, CommandRunner } from "nest-commander";
import { RabbitMQConsumer } from "../consumer/billing.consume";

@Command({
  name: "consume",
  description: "run consumer",
})
export class consumeCommand extends CommandRunner {
  constructor(private consumer: RabbitMQConsumer) {
    super();
  }
  async run(): Promise<void> {
    await this.consumer.onModuleInit();
  }
  
}