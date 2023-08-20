import { Client } from "discord.js";
import { config } from "dotenv";
import ready from "./ready";
import interactionCreate from "./interactionCreate";

config();

const client = new Client({
  intents: [],
});

ready(client);
interactionCreate(client);

client.login(process.env.TOKEN);
