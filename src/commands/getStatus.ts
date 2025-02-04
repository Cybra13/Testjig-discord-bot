import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ChamberHandler } from 'chamber-api-handler';

async function fetchChamberState(): Promise<string[] | undefined> {
  const chamber = new ChamberHandler();
  const state = await chamber.getData();
  return state;
}

// Command data
export const data = new SlashCommandBuilder()
  .setName('getstatus')
  .setDescription('Fetch the current test state from the Environmental Chamber.');

// Command execution function
export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply(); // Acknowledge the interaction

  try {
    const state = await fetchChamberState();
    if (state) {
      const timestamp = new Date().toLocaleString();
      await interaction.editReply(`${timestamp}\nCurrent temperature: ${state[6]}°C\nTarget temperature: ${state[8]}°C`);
    } else {
      await interaction.editReply('Failed to fetch test state: No data returned');
    }
  } catch (error) {
    await interaction.editReply(`Failed to fetch test state: ${error}`);
  }
}
