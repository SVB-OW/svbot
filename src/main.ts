//#region Preparation
import { readdirSync } from 'fs';
import { join } from 'path';
import { Message } from 'discord.js';
import { Db, MongoClient } from 'mongodb';
import { isProd, discordToken, prefixLive, mongoUri, dbLive } from './config';
import { CommandClient, ICommandMessage, ClientError } from './types';
const sendmail = require('sendmail')({ silent: true });
const client = new CommandClient();

// Init mongodb and inMemory db
const dbClient = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
const commandFiles = readdirSync(
  join(process.cwd(), '/out/commands'),
).filter((file: string) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(join(process.cwd(), '/out/commands', file));
  client.commands.set(command.name, command);
}
//#endregion

client.on('ready', async () => {
  try {
    // await client.user?.setUsername('SVBot');
    // await client.user?.setAvatar('../assets/svbot.png');
    await client.user?.setActivity(isProd ? 'Production' : 'Test', {
      type: 'WATCHING',
    });
    // await client.user?.setActivity('The Ranked Gauntlet', {type: 'COMPETING'});
  } catch (e) {
    let html = `<h1>Name: ${e.name}</h1><h3>${e.message}</h3><pre>${e.stack}</pre>`;

    sendmail({
      from: 'svbot@svb.net',
      to: 'flo.dendorfer@gmail.com',
      subject: 'Error in SVBot: ',
      html,
    });
  }
});

client.on('message', async (msg: Message) => {
  try {
    // Exit without error
    if (
      !msg.content.startsWith(prefixLive) ||
      msg.channel.type !== 'text' ||
      false /*  msg.author.bot */
    )
      return;

    const args = msg.content.slice(prefixLive.length).trim().split(/ +/);
    const cmdName = args.shift();

    // Find command
    if (!cmdName) throw new ClientError('Command not found');
    const cmd = client.commands.get(cmdName);
    if (!cmd) throw new ClientError('Command not found');

    // Permission validation
    if (cmd.permission) {
      const authorPerms = msg.channel.permissionsFor(msg.author);
      if (!authorPerms || !authorPerms.has(cmd.permission))
        throw new ClientError("You're not permitted to use this command");
    }

    // Role validation
    if (
      cmd.allowedRoles.length > 0 &&
      !msg.member?.roles.cache.some((r: { name: any }) =>
        cmd.allowedRoles.includes(r.name),
      )
    )
      throw new ClientError("You're not permitted to use this command");

    // Channel validation
    if (cmd.allowedChannels && !cmd.allowedChannels.includes(msg.channel.name))
      throw new ClientError('This command is not permitted in this channel');

    // Execution
    await cmd.execute(
      msg as ICommandMessage,
      args,
      mongoDb.collection('signups'),
      mongoDb.collection('lobby'),
    );
  } catch (e) {
    // Send client errors back to channel
    if (e instanceof ClientError) {
      await msg.reply(
        `\`\`\`diff\n- Error: ${e.message.substring(0, 120)}\n\`\`\``,
      );
      await msg.react('🚫');
    } else if (e instanceof Error) {
      let html = `<h1>Name: ${e.name}</h1><h3>${e.message}</h3><pre>${e.stack}</pre>`;

      sendmail({
        from: 'svbot@svb.net',
        to: 'flo.dendorfer@gmail.com',
        subject: 'Error in SVBot',
        html,
      });
    } else {
      console.error(e);
    }
  }
});

client.login(discordToken);
