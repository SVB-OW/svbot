//#region Preparation
const { readdirSync } = require('fs');
const { Client, Collection } = require('discord.js');
const { discordToken, prefix, mongoUri, dbName } = require('./config');
const { ClientError } = require('./types/index.js');

const client = new Client();
// client.user.setUsername('<username>');
// client.user.setAvatar('<url or path>');
client.commands = new Collection();

// Init mongodb and inMemory db
const { MongoClient } = require('mongodb');
const dbClient = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// Init db
let mongoDb;
let db = {};
// Ugly async await block
(async () => {
  await dbClient.connect();
  mongoDb = dbClient.db(dbName).collection('signups');

  // InMemory Database
  db.signups = await mongoDb.find().toArray();
})();

// Current lobby config
let lobby = {
  pingMsg: null, //null
  rank: '',
  region: '',
  streamer: '',
  tankPlayers: [],
  damagePlayers: [],
  supportPlayers: [],
};
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
  client.user.setActivity(
    process.env.NODE_ENV === 'production' ? 'Production' : 'Test',
    { type: 'WATCHING' },
  );
});

client.on('message', async msg => {
  try {
    // Exit without error
    if (
      !msg.content.startsWith(prefix) ||
      msg.channel.type !== 'text' ||
      false /*  msg.author.bot */
    )
      return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Find command
    if (!client.commands.has(commandName))
      throw new ClientError('Command not found');
    const command = client.commands.get(commandName);

    // Permission validation
    if (command.permission) {
      const authorPerms = msg.channel.permissionsFor(msg.author);
      if (!authorPerms || !authorPerms.has(command.permission))
        throw new ClientError("You're not permitted to use this command");
    }

    // Role validation
    if (
      command.allowedRoles &&
      !msg.member.roles.cache.some(r => command.allowedRoles.includes(r.name))
    )
      throw new ClientError("You're not permitted to use this command");

    // Channel validation
    if (
      command.allowedChannels &&
      !command.allowedChannels.includes(msg.channel.name)
    )
      throw new ClientError('This command is not permitted in this channel');

    // Execution
    await command.execute(msg, args, db, mongoDb, lobby);
  } catch (e) {
    // Send client errors back to channel
    if (e.name === 'ClientError') {
      msg.reply(`\`\`\`diff\n- Error: ${e.message.substring(0, 120)}\n\`\`\``);
      msg.react('🚫');
    } else console.error(e);
  }
});

client.login(discordToken);
