//#region Preparation
import { readdirSync } from 'fs';
import { join } from 'path';
import { Intents, Message } from 'discord.js';
import { Db, MongoClient } from 'mongodb';
import { isProd, discordToken, prefixLive, mongoUri, dbLive } from './config';
import {
  ClientError,
  CommandClient,
  ICommandMessage,
  ICommandOptions,
} from './types';
const sendmail = require('sendmail')({ silent: isProd }); // Silent in prod
const client = new CommandClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

// Init mongodb and inMemory db
const dbClient = new MongoClient(mongoUri);

// Init db
let mongoDb: Db;
// Ugly async await block
(async () => {
  await dbClient.connect();
  mongoDb = dbClient.db(dbLive);
})();
//#endregion

//#region Dynamic commands
// Import all files from ./commands and map to client.commands
const commandFiles = readdirSync(join(process.cwd(), '/out/commands')).filter(
  (file: string) => file.endsWith('.js'),
);
for (const file of commandFiles) {
  const command = require(join(process.cwd(), '/out/commands', file));
  client.commands.set(command.name, command);
}
//#endregion

client.on('ready', async () => {
  // await client.user?.setUsername('SVBot');
  // await client.user?.setAvatar('../assets/svbot.png');
  // await client.user?.setActivity(isProd ? 'Production' : 'Test', {
  //   type: 'WATCHING',
  // });
  await client.user?.setActivity('The Ranked Gauntlet', { type: 'COMPETING' });
});

client.on('messageCreate', async (msg: Message) => {
  // Exit without error
  if (!msg.content.startsWith(prefixLive) || msg.channel.type !== 'GUILD_TEXT')
    return;

  const args = msg.content.slice(prefixLive.length).trim().split(/ +/);
  const cmdName = args.shift();

  // Find command
  if (!cmdName) throw new ClientError(msg, 'Command not found');
  const cmd = client.commands.get(cmdName);
  if (!cmd) throw new ClientError(msg, 'Command not found');

  // Permission validation
  if (cmd.permission) {
    const authorPerms = msg.channel.permissionsFor(msg.author);
    if (!authorPerms || !authorPerms.has(cmd.permission))
      throw new ClientError(msg, "You're not permitted to use this command");
  }

  // Role validation
  if (
    cmd.allowedRoles.length > 0 &&
    !msg.member?.roles.cache.some((r: { name: any }) =>
      cmd.allowedRoles.includes(r.name),
    )
  )
    throw new ClientError(msg, "You're not permitted to use this command");

  // Channel validation
  if (
    cmd.allowedChannels.length > 0 &&
    !cmd.allowedChannels.includes(msg.channel.name)
  )
    throw new ClientError(msg, 'This command is not permitted in this channel');

  // Execution
  await cmd.execute({
    msg: msg as ICommandMessage,
    args,
    mongoSignups: mongoDb.collection('signups'),
    mongoLobbies: mongoDb.collection('lobbies'),
    mongoContenstants: mongoDb.collection('contestants'),
  } as ICommandOptions);
});

// #region Global Error Handler
async function errorHandler(err: any) {
  // Send client errors back to channel
  if (err instanceof ClientError) {
    await err.msg.reply(
      `\`\`\`diff\n- Error: ${err.message.substring(0, 200)}\n\`\`\``,
    );
    await err.msg.react('🚫');
  } else if (err instanceof Error && isProd) {
    let html = `<h1>Name: ${err.name}</h1><h3>Message: ${err.message}</h3></div><pre>${err.stack}</pre>`;

    sendmail({
      from: 'svbot@svb.net',
      to: 'flo.dendorfer@gmail.com',
      subject: 'Error in SVBot ' + (isProd ? 'Production' : 'Development'),
      html,
    });
    if (!isProd) console.error(err);
  } else {
    console.error(err);
  }
}

process.on('unhandledRejection', errorHandler);
process.on('uncaughtException', errorHandler);
// #endregion

client.login(discordToken);
