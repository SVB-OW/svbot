const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Display some stats for the event',
  allowedChannels: ['bot-commands'],
  async execute(msg, args, mongoSignups) {
    // Get the stats!
    let totalPlayers = await mongoSignups.countDocuments();
    let confirmedPlayers = await mongoSignups.countDocuments({
      confirmedBy: { $ne: '' },
    });
    let unconfirmedPlayers = await mongoSignups.countDocuments({
      confirmedBy: '',
    });

    let euPlayers = await mongoSignups.countDocuments({ region: 'EU' });
    let naPlayers = await mongoSignups.countDocuments({ region: 'NA' });

    let bronzePlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'BRONZE' },
        { damageRank: 'BRONZE' },
        { supportRank: 'BRONZE' },
      ],
    });
    let silverPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'SILVER' },
        { damageRank: 'SILVER' },
        { supportRank: 'SILVER' },
      ],
    });
    let goldPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'GOLD' },
        { damageRank: 'GOLD' },
        { supportRank: 'GOLD' },
      ],
    });
    let platinumPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'PLATINUM' },
        { damageRank: 'PLATINUM' },
        { supportRank: 'PLATINUM' },
      ],
    });
    let diamondPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'DIAMOND' },
        { damageRank: 'DIAMOND' },
        { supportRank: 'DIAMOND' },
      ],
    });
    let masterPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'MASTER' },
        { damageRank: 'MASTER' },
        { supportRank: 'MASTER' },
      ],
    });
    let grandmasterPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'GRANDMASTER' },
        { damageRank: 'GRANDMASTER' },
        { supportRank: 'GRANDMASTER' },
      ],
    });

    const embed = new MessageEmbed().setTitle('Event Stats').setTimestamp();
    embed.setThumbnail(msg.guild.icon_url);
    embed.addField('Registered', totalPlayers, true);
    embed.addField('Confirmed', confirmedPlayers, true);
    embed.addField('Unconfirmed', unconfirmedPlayers, true);

    embed.addField('EU Players', euPlayers, true);
    embed.addField('NA Players', naPlayers, true);
    embed.addField('Bronze', bronzePlayers, true);

    embed.addField('Silver', silverPlayers, true);
    embed.addField('Gold', goldPlayers, true);
    embed.addField('Platinum', platinumPlayers, true);

    embed.addField('Diamond', diamondPlayers, true);
    embed.addField('Master', masterPlayers, true);
    embed.addField('Grandmaster', grandmasterPlayers, true);

    await msg.channel.send(embed);
  },
};
