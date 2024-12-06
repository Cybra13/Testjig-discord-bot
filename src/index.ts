import { Client, TextChannel } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import WebSocket from 'ws';

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

// Create a WebSocket client
let wsClient: WebSocket;
try {
  wsClient = new WebSocket('ws://localhost:3001');
} catch (error) {
  console.error('WebSocket error:', error);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  console.log("Discord bot is ready! 🤖");
  sendMessageEveryMinute();
});

async function sendMessageEveryMinute() {
  const channel = await client.channels.fetch('1311593152922128457');
  if (channel && channel instanceof TextChannel) {
    setInterval(async () => {
      const state = await fetchTestState();
      channel.send(`Current test state: ${state}`);
    }, 60000); // 60000 milliseconds = 1 minute
  }
}

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

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);
