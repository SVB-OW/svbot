const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Display some stats for the event',
  allowedRoles: ['Admin'],
  async execute(msg, mongoSignups) {

    // Get the stats!
    let totalPlayers = await mongoSignups.aggregate([{ '$count': 'Count' }])
    let confirmedPlayers = await mongoSignups.aggregate([{ '$match': { 'confirmedBy': { '$not': { '$eq': '' } } } }, { '$count': 'Count' }])
    let unconfirmedPlayers = await mongoSignups.aggregate([{ '$match': { 'confirmedBy': '' } }, { '$count': 'Count' }])

    let euPlayers = await mongoSignups.aggregate([{ '$match': { 'region': 'EU' } }, { '$count': 'Count' }])
    let naPlayers = await mongoSignups.aggregate([{ '$match': { 'region': 'NA' } }, { '$count': 'Count' }])

    let bronzePlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'BRONZE' }, { 'damageRank': 'BRONZE' }, { 'supportRank': 'BRONZE' }] } }, { '$count': 'Count' }]);
    let silverPlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'SILVER' }, { 'damageRank': 'SILVER' }, { 'supportRank': 'SILVER' }] } }, { '$count': 'Count' }]);
    let goldPlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'GOLD' }, { 'damageRank': 'GOLD' }, { 'supportRank': 'GOLD' }] } }, { '$count': 'Count' }]);
    let platinumPlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'PLATINUM' }, { 'damageRank': 'PLATINUM' }, { 'supportRank': 'PLATINUM' }] } }, { '$count': 'Count' }]);
    let diamondPlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'DIAMOND' }, { 'damageRank': 'DIAMOND' }, { 'supportRank': 'DIAMOND' }] } }, { '$count': 'Count' }]);
    let masterPlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'MASTER' }, { 'damageRank': 'MASTER' }, { 'supportRank': 'MASTER' }] } }, { '$count': 'Count' }]);
    let grandmasterPlayers = await mongoSignups.aggregate([{ '$match': { '$or': [{ 'tankRank': 'GRANDMASTER' }, { 'damageRank': 'GRANDMASTER' }, { 'supportRank': 'GRANDMASTER' }] } }, { '$count': 'Count' }]);

    const embed = new MessageEmbed().setTitle('Event Stats').setTimestamp();
    embed.setThumbnail(msg.guild.icon_url);
    embed.addField("Registered", totalPlayers.Count, true);
    embed.addField("Confirmed", confirmedPlayers.Count, true);
    embed.addField("Unconfirmed", unconfirmedPlayers.Count, true);

    embed.addField("EU Players", euPlayers.Count, true);
    embed.addField("NA Players", naPlayers.Count, true);
    embed.addField("Bronze", bronzePlayers.Count, true);

    embed.addField("Silver", silverPlayers.Count, true);
    embed.addField("Gold", goldPlayers.Count, true);
    embed.addField("Platinum", platinumPlayers.Count, true);

    embed.addField("Diamond", diamondPlayers.Count, true);
    embed.addField("Master", masterPlayers.Count, true);
    embed.addField("Grandmaster", grandmasterPlayers.Count, true);

    await msg.channel.send(embed);
  },
};
