import { Command, Region } from '../types';
import { MessageEmbed } from 'discord.js';

module.exports = new Command({
  name: 'stats',
  description: 'Display some stats for the event',
  allowedChannels: ['bot-commands'],
  async execute({ msg, args, mongoSignups }) {
    // Get the stats!
    const totalPlayers = await mongoSignups.countDocuments();
    const confirmedPlayers = await mongoSignups.countDocuments({
      confirmedBy: { $ne: '' },
    });
    const unconfirmedPlayers = await mongoSignups.countDocuments({
      confirmedBy: '',
    });

    const euPlayers = await mongoSignups.countDocuments({ region: Region.EU });
    const naPlayers = await mongoSignups.countDocuments({ region: Region.NA });

    const bronzePlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'BRONZE' },
        { damageRank: 'BRONZE' },
        { supportRank: 'BRONZE' },
      ],
    });
    const silverPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'SILVER' },
        { damageRank: 'SILVER' },
        { supportRank: 'SILVER' },
      ],
    });
    const goldPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'GOLD' },
        { damageRank: 'GOLD' },
        { supportRank: 'GOLD' },
      ],
    });
    const platinumPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'PLATINUM' },
        { damageRank: 'PLATINUM' },
        { supportRank: 'PLATINUM' },
      ],
    });
    const diamondPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'DIAMOND' },
        { damageRank: 'DIAMOND' },
        { supportRank: 'DIAMOND' },
      ],
    });
    const masterPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'MASTER' },
        { damageRank: 'MASTER' },
        { supportRank: 'MASTER' },
      ],
    });
    const grandmasterPlayers = await mongoSignups.countDocuments({
      $or: [
        { tankRank: 'GRANDMASTER' },
        { damageRank: 'GRANDMASTER' },
        { supportRank: 'GRANDMASTER' },
      ],
    });

    const embed = new MessageEmbed().setTitle('Event Stats').setTimestamp();
    if (msg.guild.iconURL()) embed.setThumbnail(msg.guild.iconURL() as string);

    embed.addField('Registered', totalPlayers.toString(), true);
    embed.addField('Confirmed', confirmedPlayers.toString(), true);
    embed.addField('Unconfirmed', unconfirmedPlayers.toString(), true);

    embed.addField('EU Players', euPlayers.toString(), true);
    embed.addField('NA Players', naPlayers.toString(), true);
    embed.addField('Bronze', bronzePlayers.toString(), true);

    embed.addField('Silver', silverPlayers.toString(), true);
    embed.addField('Gold', goldPlayers.toString(), true);
    embed.addField('Platinum', platinumPlayers.toString(), true);

    embed.addField('Diamond', diamondPlayers.toString(), true);
    embed.addField('Master', masterPlayers.toString(), true);
    embed.addField('Grandmaster', grandmasterPlayers.toString(), true);

    await msg.channel.send({ embeds: [embed] });
  },
});
