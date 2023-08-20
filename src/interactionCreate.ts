import { CommandInteraction, Client, Interaction } from "discord.js";
import { Commands } from "./Commands";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isCommand() || interaction.isContextMenuCommand()) {
      await handleSlashCommand(client, interaction);
    }
  });
};

const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction
) => {
  // handle slash command
  const slashCommand = Commands.find((c) => c.name === interaction.commandName);

  if (!slashCommand) {
    interaction.followUp({
      content: "This command does not exist",
    });
    return;
  }

  await interaction.deferReply();

  slashCommand.run(client, interaction);
};
