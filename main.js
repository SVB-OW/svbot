//#region Preparation
const { readdirSync } = require('fs');
const { Client, Collection } = require('discord.js');
const sendmail = require('sendmail')({ silent: true });
const {
  isProd,
  discordToken,
  prefixLive,
  prefixProd,
  prefixTest,
  mongoUri,
  dbLive,
  dbProd,
  dbTest,
} = require('./config');
const { ClientError } = require('./types');

const client = new Client();
client.commands = new Collection();

// Init mongodb and inMemory db
const { MongoClient } = require('mongodb');
const dbClient = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Init db
let mongoDb;
let mongoDbProd;
let mongoDbTest;
// Ugly async await block
(async () => {
  await dbClient.connect();
  mongoDb = dbClient.db(dbLive);
  mongoDbProd = dbClient.db(dbProd);
  mongoDbTest = dbClient.db(dbTest);
})();
//#endregion

//#region Dynamic commands
// Import all files from ./commands and map to client.commands
const commandFiles = readdirSync('./commands').filter(file =>
  file.endsWith('.js'),
);
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
//#endregion

client.on('ready', async () => {
  console.log('prefixLive', prefixLive);
  try {
    // await client.user.setUsername('SVBot');
    // await client.user.setAvatar('./svbot.png');
    await client.user.setActivity(
      process.env.NODE_ENV === 'production' ? 'Production' : 'Test',
      { type: 'WATCHING' },
    );
  } catch (e) {
    console.error(e);

    let html = `<table>
    <thead>
      <tr>
        ${Object.keys(e)
          .map(i => '<th>' + i + '</th>')
          .join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
      ${Object.values(e)
        .map(i => '<td>' + i + '</td>')
        .join('')}
      </tr>
    </tbody>
  </table>`;

    sendmail({
      from: 'svbot@svb.gg',
      to: 'flo.dendorfer@gmail.com',
      subject: 'SVBot: ' + e.name,
      html,
    });
  }
});

client.on('message', async msg => {
  try {
    // Exit without error
    if (
      !msg.content.startsWith(prefixLive) ||
      msg.channel.type !== 'text' ||
      false /*  msg.author.bot */
    )
      return;

    const args = msg.content.slice(prefixLive.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    // Find command
    if (!client.commands.has(cmdName))
      throw new ClientError('Command not found');
    const cmd = client.commands.get(cmdName);

    // Permission validation
    if (cmd.permission) {
      const authorPerms = msg.channel.permissionsFor(msg.author);
      if (!authorPerms || !authorPerms.has(cmd.permission))
        throw new ClientError("You're not permitted to use this command");
    }

    // Role validation
    if (
      cmd.allowedRoles &&
      !msg.member.roles.cache.some(r => cmd.allowedRoles.includes(r.name))
    )
      throw new ClientError("You're not permitted to use this command");

    // Channel validation
    if (cmd.allowedChannels && !cmd.allowedChannels.includes(msg.channel.name))
      throw new ClientError('This command is not permitted in this channel');

    // Execution
    await cmd.execute(
      msg,
      args,
      mongoDb.collection('signups'),
      mongoDb.collection('lobby'),
    );
  } catch (e) {
    // Send client errors back to channel
    if (e.name === 'ClientError') {
      msg.reply(`\`\`\`diff\n- Error: ${e.message.substring(0, 120)}\n\`\`\``);
      msg.react('🚫');
    } else {
      console.error(e);

      let html = `<table>
      <thead>
        <tr>
          ${Object.keys(e)
            .map(i => '<th>' + i + '</th>')
            .join('')}
        </tr>
      </thead>
      <tbody>
        <tr>
        ${Object.values(e)
          .map(i => '<td>' + i + '</td>')
          .join('')}
        </tr>
      </tbody>
    </table>`;

      sendmail({
        from: 'svbot@svb.gg',
        to: 'flo.dendorfer@gmail.com',
        subject: 'Error in SVBot',
        html,
      });
    }
  }
});

client.login(discordToken);
