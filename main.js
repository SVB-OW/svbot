const Discord = require('discord.js');
const client = new Discord.Client();

// ========================================================
// Database Types
class Player {
  constructor(obj) {
    this.discordId = '';
    this.battleTag = '';
    this.region = '';
    this.signupMsgId = '';
    this.signedUpOn = '';
    this.confirmedOn = '';
    this.confirmedBy = '';
    this.tankRank = '';
    this.damageRank = '';
    this.supportRank = '';
    this.gamesPlayed = 0;
    this.screenshot = '';
    Object.assign(this, obj);
  }
}
// InMemory Database
const db = {
  signups: [],
};
const lobby = {
  pingMsg: null,
  playerPingsChannel: null,
  rank: '',
  region: '',
  streamer: '',
  tankPlayers: [],
  damagePlayers: [],
  supportPlayers: [],
};
// Test .confirm
db.signups = [
  new Player({
    discordId: '289401547119525889',
    battleTag: 'Flo0010#2600',
    region: 'EU',
    signupMsgId: '794676823954554920',
    signedUpOn: '1609536119212',
    confirmedOn: '1609536144413',
    confirmedBy: '289401547119525889',
    tankRank: 'DIAMOND',
    damageRank: 'MASTER',
    supportRank: 'DIAMOND',
    screenshot:
      'https://media.discordapp.net/attachments/786309977252954122/794676821471658024/unknown.png',
  }),
];
// ========================================================

// ========================================================
// Settings
const prefix = process.env.NODE_ENV === 'production' ? '.' : ','; // No spaces allowed
const btagRegex = new RegExp(/.{3,}#[0-9]{4,}/);
const regionRegex = new RegExp(/^(EU|NA)$/, 'i');
const rankRegex = new RegExp(
  /^(Bronze|Silver|Gold|Platinum|Diamond|Master|Grandmaster)$/,
  'i',
);
const playerPingsChannelId = '786309977252954123';
// ========================================================

client.on('ready', async () => {
  // client.user.setUsername('<username>');
  // client.user.setAvatar('<url or path>');
  client.user.setActivity(
    process.env.NODE_ENV === 'production' ? 'Production' : 'Test',
  );
  lobby.playerPingsChannel = client.channels.cache.get(playerPingsChannelId);
});

client.on('message', async msg => {
  try {
    const args = msg.content.split(' ');

    // exit, if msg doesnt start with prefix or comes from a bot
    if (!args[0] === prefix || msg.author.bot) return;

    switch (args[0].replace(prefix, '')) {
      case 'commands':
        await msg.channel.send(
          new Discord.MessageEmbed()
            .setTitle('Commands')
            .setTimestamp()
            .addFields(
              {
                name: 'commands',
                value: '```.commands```Shows this help list',
              },
              {
                name: 'env',
                value: '```.env```Outputs the content of the NODE_ENV variable',
              },
              {
                name: 'test',
                value: '```.test```Replies with the bots latency',
              },
              {
                name: 'purge',
                value:
                  '```.purge```Deletes the last 100 messages in the channel',
              },
              {
                name: 'countup',
                value:
                  '```.countup <@discordTag>```Increments the played count of a player',
              },
              {
                name: 'countdown',
                value:
                  '```.countdown <@discordTag>```Decrements the played count of a player',
              },
              {
                name: 'log',
                value:
                  '```.log <?signupId>```Logs the first db entry or optionally a specific entry by signupId',
              },
              {
                name: 'signup',
                value:
                  '```.signup <battleTag> <region> <attach:screenshot>```Sign up with btag, region and profile screenshot',
              },
              {
                name: 'confirm',
                value:
                  '```.confirm <signupId> <tankRank> <dpsRank> <supportRank> ```Confirms a signup entry',
              },
              {
                name: 'ping',
                value:
                  '```.ping <rank> <region> <streamer>```Ping rank role with streamer and region in #player-pings',
              },
              {
                name: 'announce',
                value: '```.announce```Post player list in #matchmaker',
              },
              {
                name: 'clear',
                value:
                  '```.clear```Kicks all players with @Ingame from voice lobbies and removes their role',
              },
            ),
        );
        break;

      case 'env':
        await msg.channel.send(process.env.NODE_ENV);
        break;

      case 'test':
        msg.channel.send(
          `Latency to bot: ${Date.now() - msg.createdTimestamp}ms`,
        );
        break;

      case 'purge':
        msg.channel.bulkDelete(100);
        break;

      case 'countup':
        if (msg.mentions.users.size !== 1)
          throw new Error(
            'Command must include a mention of a user as the first argument',
          );
        msg.mentions.users.forEach((value, key) => {
          let foundUser = db.signups.find(item => item.discordId === key);
          foundUser.gamesPlayed++;
        });
        break;

      case 'countdown':
        if (msg.mentions.users.size !== 1)
          throw new Error(
            'Command must include a mention of a user as the first argument',
          );
        msg.mentions.users.forEach((value, key) => {
          let foundUser = db.signups.find(item => item.discordId === key);
          foundUser.gamesPlayed--;
        });
        break;

      case 'log':
        if (db.signups.length === 0) throw new Error('No signups yet');
        if (args.length > 1) {
          let found = db.signups.find(item => item.signupMsgId === args[1]);
          if (!found) throw new Error('Signup not found');

          msg.channel.send(
            new Discord.MessageEmbed()
              .setTitle(args[1])
              .setTimestamp()
              .addFields(
                Object.keys(found).map(key => ({
                  name: key,
                  value: found[key],
                })),
              ),
          );
        } else {
          msg.channel.send(
            new Discord.MessageEmbed()
              .setTitle('db.signups[0]')
              .setTimestamp()
              .addFields(
                Object.keys(db.signups[0]).map(key => ({
                  name: key,
                  value: db.signups[0][key],
                })),
              ),
          );
        }

        console.log(db.signups);
        break;

      case 'lobby':
        const embed = new Discord.MessageEmbed()
          .setTitle('Lobby')
          .setTimestamp()
          .addFields(
            {
              name: 'Tank Players',
              value: JSON.stringify(lobby.tankPlayers),
            },
            {
              name: 'Damage Players',
              value: JSON.stringify(lobby.damagePlayers),
            },
            {
              name: 'Support Players',
              value: JSON.stringify(lobby.supportPlayers),
            },
          );

        msg.channel.send(embed);
        break;

      case 'signup':
        // Checks command contains valid btag
        if (!args[1] || !btagRegex.test(args[1]))
          throw new Error(
            'Battle Tag invalid. Format should be "!signup Krusher99#1234 EU"',
          );
        // Checks the command contains a region (caseinsensitive)
        if (!args[2] || !regionRegex.test(args[2]))
          throw new Error(
            'Region invalid. Format should be "!signup Krusher99#1234 EU"',
          );
        // Checks the command has exactly one attachment
        // TODO: Check, the attachment is an image
        if (msg.attachments.size !== 1)
          throw new Error(
            'Make sure you attach a screenshot of your career profile to the message',
          );
        // Overwrite existing signup
        let existingSignup = db.signups.findIndex(
          item => item.discordId === msg.author.id,
        );
        if (existingSignup >= 0)
          throw new Error(
            'You already have signed up. If you would like to update your rank, discord or battle tag, please dm a mod.',
          );

        const attachment = msg.attachments.values().next().value;
        db.signups.push(
          new Player({
            discordId: msg.author.id,
            battleTag: args[1],
            region: args[2].toUpperCase(),
            screenshot: attachment.proxyURL,
            signupMsgId: msg.id,
            signedUpOn: msg.createdTimestamp,
          }),
        );

        await msg.channel.send(
          'Signup has been recieved and will be checked by an event moderator',
        );

        break;

      case 'confirm':
        if (args.length !== 5)
          throw new Error(
            'Invalid number of arguments. Format is ".confirm <msgId> <tankRank> <dpsRank> <supportRank>',
          );
        let foundSignupByMsgId = db.signups.find(
          item => item.signupMsgId === args[1],
        );
        if (!foundSignupByMsgId) throw new Error('MsgId was not found in DB');

        if (!rankRegex.test(args[2])) throw new Error('Tank rank is invalid');

        if (!rankRegex.test(args[3])) throw new Error('Damage rank is invalid');

        if (!rankRegex.test(args[4]))
          throw new Error('Support rank is invalid');

        foundSignupByMsgId.tankRank = args[2].toUpperCase();
        foundSignupByMsgId.damageRank = args[3].toUpperCase();
        foundSignupByMsgId.supportRank = args[4].toUpperCase();
        foundSignupByMsgId.confirmedBy = msg.author.id;
        foundSignupByMsgId.confirmedOn = msg.createdTimestamp;

        msg.channel.messages
          .fetch(foundSignupByMsgId.signupMsgId)
          .then(oldMsg => oldMsg.react('👍'));

        msg.channel.send('Signup successfully validated');

        break;

      case 'ping':
        // Validate
        // Checks Rank
        if (!args[1] || !rankRegex.test(args[1]))
          throw new Error('Rank is invalid ' + args[1]);
        // Checks Region
        if (!args[2] || !regionRegex.test(args[2]))
          throw new Error('Region is invalid ' + args[2]);
        // Checks Streamer
        if (!args[3]) throw new Error('Streamer cannot be empty ' + args[3]);
        // Check that last match was cleared
        if (lobby.pingMsg) throw new Error('Last match must be cleared first');

        lobby.rank = args[1].toUpperCase();
        lobby.region = args[2].toUpperCase();
        lobby.streamer = args[3];

        const roleByName = msg.guild.roles.cache.find(
          item => item.name.toUpperCase() === lobby.rank,
        );
        lobby.pingMsg = await lobby.playerPingsChannel.send(
          `${lobby.streamer} has chosen <@&${roleByName.id}> for their lobby on the ${lobby.region} servers. Please react with 👍`,
        );

        await lobby.pingMsg.react('👍');

        break;

      case 'announce':
        // Validate
        if (!lobby.pingMsg) throw new Error('No ping has occured yet');

        // Post message in #player-pings including 4 players of each role and a text at the bottom, they should join the lobby waiting room
        // Assign @Ingame to the 12 players and add +1 to gamesPlayed
        // Post a message with the 12 bTag's in #matchmaker and ping @host

        // List of players who reacted to ping message
        let msgReactionUsers = lobby.pingMsg.reactions.cache
          .filter(mr => mr.emoji.name === '👍')
          .first()
          .users.cache.filter(user => !user.bot);

        // Iterate list of users who reacted
        for (const [userId, user] of msgReactionUsers) {
          // Find singup for current user
          let findSignup = db.signups.find(item => item.discordId === userId);
          // Check that signup exists and was confirmed
          if (findSignup && findSignup.confirmedOn) {
            // sort roles by which has the least players already
            let rolePools = [
              { name: 'tank', arr: lobby.tankPlayers },
              { name: 'damage', arr: lobby.damagePlayers },
              { name: 'support', arr: lobby.supportPlayers },
            ].sort((a, b) => {
              if (a.arr.length < b.arr.length) return -1;
              if (a.arr.length > b.arr.length) return 1;

              return 0;
            });

            if (findSignup[rolePools[0].name + 'Rank'] === lobby.rank) {
              lobby[rolePools[0].name + 'Players'].push(findSignup);
              return;
            }

            if (findSignup[rolePools[1].name + 'Rank'] === lobby.rank) {
              lobby[rolePools[1].name + 'Players'].push(findSignup);
              return;
            }

            if (findSignup[rolePools[2].name + 'Rank'] === lobby.rank) {
              lobby[rolePools[2].name + 'Players'].push(findSignup);
              return;
            }
          }
        }

        lobby.tankPlayers.sort((a, b) => {
          if (a.gamesPlayed > b.gamesPlayed) return 1;
          if (a.gamesPlayed < b.gamesPlayed) return -1;
          if (a.region === lobby.region && b.region !== lobby.region) return -1;
          if (b.region === lobby.region && a.region !== lobby.region) return 1;

          return 0;
        });

        let top4tanks = lobby.tankPlayers.slice(0, 4);
        let top4damages = lobby.damagePlayers.slice(0, 4);
        let top4supports = lobby.supportPlayers.slice(0, 4);

        break;

      case 'clear':
        let role = msg.guild.roles.cache.find(role => role.name === 'Ingame');
        let ingamePlayers = msg.guild.roles.cache.get(role.id).members;
        ingamePlayers.forEach(value => {
          value.voice.setChannel(null);
          value.roles.remove(role);
        });
        msg.channel.send('Ingame role cleared');
        break;
    }
  } catch (e) {
    await msg.channel.send(
      `\`\`\`diff\n- Error: ${e.message.substring(0, 120)}\n\`\`\``,
    );
  }
});

client.login('Nzg1OTEyNzkxNzM5MjY5MTMw.X8-wUw.3UV0IpkVAsp1kBTQ7HsE3Fd6G3c');
