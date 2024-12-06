import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import WebSocket from 'ws';

// Create a WebSocket client instance
const wsClient = new WebSocket('ws://localhost:3001');

// Function to fetch test state from WebSocket server
async function fetchTestState(): Promise<string> {
  return new Promise((resolve, reject) => {
    wsClient.on('open', () => {
      wsClient.send(JSON.stringify({ action: 'getTestState' }));
    });

    wsClient.on('message', (data) => {
      const response = JSON.parse(data.toString());
      resolve(response.state); // Adjust according to your server's response structure
    });

    wsClient.on('error', (error) => {
      console.error('WebSocket error:', error);
      reject('Error fetching state');
    });
  });
}

// Command data
export const data = new SlashCommandBuilder()
  .setName('getstatus')
  .setDescription('Fetch the current test state from the WebSocket server.');

// Command execution function
export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply(); // Acknowledge the interaction

  try {
    const state = await fetchTestState();
    await interaction.editReply(`Current test state: ${state}`);
  } catch (error) {
    await interaction.editReply(`Failed to fetch test state: ${error}`);
  }
}
