const client = require( '..' );
const thisBotName = process.env.BOT_USERNAME;
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../models/BotConfig.js' );
const guildConfigDB = require( '../models/GuildConfig.js' );
const errHandler = require( './errorHandler.js' );

module.exports = async ( user, guild, doBlacklist = true ) => {
  const preUser = ( user ? user.id : user );
  const preGuild = ( guild ? guild.id : guild );
  const preProcessed = { user: preUser, guild: preGuild, doBlacklist: doBlacklist };
  console.log( 'getPerms received inputs:%o', preProcessed );
  
  try {
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
    .catch( async errFindBot => { await errorHandler( errFindBot, { command: 'getPerms', type: 'getBotDB' } ); } );
    const clientID = ( botConfig.ClientID || client.id );
    const botUsers = client.users.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( user.id === botOwner.id ? true : false );
    const globalBlacklist = ( botConfig.Blacklist || [] );
    const isGlobalBlacklisted = ( globalBlacklist.indexOf( user.id ) != -1 ? true : false );
    const globalWhitelist = ( botConfig.Whitelist || [] );
    const isGlobalWhitelisted = ( globalWhitelist.indexOf( user.id ) != -1 ? true : false );
    const botMods = ( botConfig.Mods || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( user.id ) != -1 ) ? true : false );
    const globalPrefix = botConfig.Prefix;

    var isDevGuild = false;
    var guildOwner = null;
    var isGuildOwner = false;
    var isServerBooster = false;
    var arrAuthorPermissions = [];
    
    if ( guild ) {
      const guildConfig = await guildConfigDB.findOne( { Guild: guild.id } )
      .catch( async errFindGuild => { await errorHandler( errFindGuild, { author: user, command: 'getPerms', guild: guild, type: 'getGuildDB' } ); } );
      isDevGuild = ( guild.id === botConfig.DevGuild ? true : false );
      const objGuildMembers = guild.members.cache;
      guildOwner = objGuildMembers.get( guild.ownerId );
      isGuildOwner = ( user.id === guildOwner.id ? true : false );
      isServerBooster = ( guild.roles.premiumSubscriberRole.members.get( user.id ) ? true : false );
      arrAuthorPermissions = ( objGuildMembers.get( user.id ).permissions.toArray() || [] );
    }
    
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const hasManageGuild = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 ) ? true : false );
    const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 ) ? true : false );
    const hasMentionEveryone = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'MentionEveryone' ) !== -1 ) ? true : false );
    const guildBlacklist = ( guildConfig ? ( guildConfig.Blacklist || [] ) : [] );
    const isGuildBlacklisted = ( guildBlacklist.indexOf( user.id ) != -1 ? true : false );
    const guildWhitelist = ( guildConfig ? ( guildConfig.Whitelist || [] ) : [] );
    const isGuildWhitelisted = ( guildWhitelist.indexOf( user.id ) != -1 ? true : false );
    const guildPrefix = ( guildConfig ? guildConfig.Prefix : globalPrefix );
    const prefix = ( guildPrefix || globalPrefix || client.prefix );    
    const isBlacklisted = ( isGlobalBlacklisted || ( isGuildBlacklisted && !( isBotMod || isGlobalWhitelisted ) ) );
    const isWhitelisted = ( isGlobalWhitelisted || ( isGuildWhitelisted && !isGlobalBlacklisted ) );
    
    const results = {
      clientId: clientID,
      globalPrefix: globalPrefix,
      guildPrefix: guildPrefix,
      prefix: prefix,
      botOwner: botOwner,
      guildOwner: guildOwner,
      isDevGuild: isDevGuild,
      isBotOwner: isBotOwner,
      isBotMod: isBotMod,
      isGuildOwner: isGuildOwner,
      hasAdministrator: hasAdministrator,
      hasManageGuild: hasManageGuild,
      hasManageRoles: hasManageRoles,
      isServerBooster: isServerBooster,
      hasMentionEveryone: hasMentionEveryone,
      isGuildBlacklisted: isGuildBlacklisted,
      isGlobalBlacklisted: isGlobalBlacklisted,
      isBlacklisted: isBlacklisted,
      isGuildWhitelisted: isGuildWhitelisted,
      isGlobalWhitelisted: isGlobalWhitelisted,
      isWhitelisted: isWhitelisted,
      content: false
    }
    if ( doBlacklist && isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      results.content = 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.';
    }
    else if ( doBlacklist && isBotMod && isGuildBlacklisted ) {
      user.send( { content: 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '! Use `/config remove` to remove yourself from the blacklist.' } );
    }
    return results;
  } catch ( errPerms ) { await errHandler( errPerms, { command: 'getPerms', type: 'tryFunction' } ); }
};