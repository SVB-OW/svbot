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
  // matchmaking: [],
};
// Test .confirm
db.signups = [
  new Player({
    discordId: '289401547119525889',
    battleTag: 'Flo0010#2600',
    region: 'EU',
    signupMsgId: '787810629012029440',
    signedUpOn: '1999-07-28T13:17',
    // confirmedOn: '2020-01-01T14:00',
    // confirmedBy: '289401547119525889',
    // tankRank: 'Diamond',
    // damageRank: 'Master',
    // supportRank: 'Diamond',
    screenshot:
      'https://static-cdn.jtvnw.net/jtv_user_pictures/993e376e-e844-44c3-a201-f0991149eb75-profile_image-70x70.png',
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
// ========================================================

client.on('message', async msg => {
  try {
    const args = msg.content.split(' ');

    // exit, if msg doesnt start with prefix or comes from a bot
    if (!args[0] === prefix || msg.author.bot) return;

    switch (args[0].replace(prefix, '')) {
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

      case 'log':
        if (args.length > 1) {
          let found = db.signups.find(item => item.signupMsgId === args[1]);
          if (!found) throw new Error('Signup not found');

          Object.keys(found).forEach(async key => {
            await msg.channel.send(key + ': ' + found[key]);
          });
        } else {
          Object.keys(db.signups[0]).forEach(async key => {
            await msg.channel.send(key + ': ' + db.signups[0][key]);
          });
        }

        console.log(db.signups);
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

        // Show announcement message in #player-pings with streamer, rank and region
        const playerPingsChannel = msg.guild.channels.cache.find(
          item => item.name === 'player-pings',
        );
        const roleByName = msg.guild.roles.cache.find(
          item => item.name === args[1],
        );
        console.log('roleByName', roleByName);
        const pingMsg = await playerPingsChannel.send(
          `${args[3]} has chosen <@&${roleByName.id}> for their lobby on the ${args[2]} servers. Please react with 👍`,
        );
        // Place reacting players into matchmaker
        const filter = (reaction, user) => user.id === msg.author.id;

        await pingMsg.react('👍');

        pingMsg
          .awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
          .then(collected => {
            const reaction = collected.first();

            switch (reaction.emoji.name) {
              case '👍':
                msg.channel.send('User reacted in player-pings');
                break;
            }
          });

        break;

      case 'announce':
        // Validate
        // Post message in #player-pings including 4 players of each role and a text at the bottom, they should join the lobby waiting room
        // Assign @Ingame to the 12 players and add +1 to gamesPlayed
        // Post a message with the 12 bTag's in #matchmaker and ping @host
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
