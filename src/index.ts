import { Client, TextChannel } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { ChamberHandler } from 'chamber-api-handler';

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

var handler: ChamberHandler;

client.once("ready", async (guild) => {
  console.log(`Logged in as ${client.user?.tag}`);
  console.log("Discord bot is ready! 🤖");
  handler = new ChamberHandler();
  console.log('Starting the application...');
  try {
    await handler.openTcpConnection();
  } catch (error) {
    console.error(`Failed to open TCP connection: ${error}`);
  }
  console.log('TCP connection opened');
  sendMessageEveryMinute();
});

async function sendMessageEveryMinute() {
  try{
    const channel = await client.channels.fetch('1336265923396636703');
    if (channel && channel instanceof TextChannel) {
      setInterval(async () => {
        const state = await handler.getData();
        if (state) {
          const timestamp = new Date().toLocaleString();
          channel.send(`${timestamp}`);
          channel.send(`Current temperature: ${state[6]}°C`);
          channel.send(`Target temperature: ${state[8]}°C`);
        }
      }, 1000); // 60000 milliseconds = 1 minute
    }
  }
  catch (error) {
    console.error(`Failed to send message: ${error}`);
  }
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
