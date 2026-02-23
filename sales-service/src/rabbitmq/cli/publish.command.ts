import { Command, CommandRunner } from "nest-commander";
import { SalesPublisher } from "../publisher/sales.publisher";

@Command({
  name: "dispatch",
  description: "run publisher",
})
export class PublishCommand extends CommandRunner {
  constructor(private publisher: SalesPublisher) {
    super();
  }
  async run(): Promise<void> {
    await this.publisher.publishPendingMessages();
  }
}