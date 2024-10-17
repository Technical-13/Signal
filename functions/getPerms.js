const thisBotName = process.env.BOT_USERNAME;
const botConfigDB = require( '../../models/BotConfig.js' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const { model, Schema } = require( 'mongoose' );

module.exports = async ( client, user, guild ) => {
  const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
    .catch( errFindBot => { console.error( 'Unable to find botConfig:\n%o', errFindBot ); } );
  const botUsers = client.users.cache;
  const botOwner = botUsers.get( botConfig.Owner );
  const isBotOwner = ( user.id === botOwner.id ? true : false );
  const globalBlacklist = ( botConfig.Blacklist || [] );
  const isGlobalBlacklisted = ( globalBlacklist.indexOf( user.id ) != -1 ? true : false );
  const globalWhitelist = ( botConfig.Whitelist || [] );
  const isGlobalWhitelisted = ( globalWhitelist.indexOf( user.id ) != -1 ? true : false );
  const botMods = ( botConfig.Mods || [] );
  const isBotMod = ( ( isBotOwner || botMods.indexOf( user.id ) != -1 ) ? true : false );
  
  const guildConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( err => {
    console.error( 'Encountered an error attempting to find %s(ID:%s) in my database for %s in getPerms.js:\n%s', guild.name, guild.id, user.displayName, err.stack );
    botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database for <@' + user.id + '>.  Please check console for details.' );
  } );
  const guildBlacklist = ( guildConfig.Blacklist || [] );
  const isGuildBlacklisted = ( guildBlacklist.indexOf( user.id ) != -1 ? true : false );
  const guildWhitelist = ( guildConfig.Whitelist || [] );
  const isGuildWhitelisted = ( guildWhitelist.indexOf( user.id ) != -1 ? true : false );
  
  const objGuildMembers = guild.members.cache;
  const objGuildOwner = objGuildMembers.get( guild.ownerId );
  const isGuildOwner = ( user.id === objGuildOwner.id ? true : false );
  
  const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
  const hasManageGuild = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 ) ? true : false );
  const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 ) ? true : false );
  const hasPrioritySpeaker = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'PrioritySpeaker' ) !== -1 ) ? true : false );  
  const hasMentionEveryone = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'MentionEveryone' ) !== -1 ) ? true : false );
  
  return {
    isBotOwner: isBotOwner,
    isBotMod: isBotMod,
    isGlobalBlacklisted: isGlobalBlacklisted,
    isGlobalWhitelisted: isGlobalWhitelisted,
    isGuildBlacklisted: isGuildBlacklisted,
    isGuildWhitelisted: isGuildWhitelisted,
    isGuildOwner: isGuildOwner,
    hasAdministrator: hasAdministrator,
    hasManageGuild: hasManageGuild,
    hasManageRoles: hasManageRoles,
    hasPrioritySpeaker: hasPrioritySpeaker,
    hasMentionEveryone: hasMentionEveryone
    };
};