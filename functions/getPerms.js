const client = require( '..' );
require( 'dotenv' ).config();
const config = require( '../config.json' );
const thisBotName = process.env.BOT_USERNAME;
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../models/BotConfig.js' );
const guildConfigDB = require( '../models/GuildConfig.js' );
const errHandler = require( './errorHandler.js' );

module.exports = async ( user, guild, doBlacklist = true, debug = false ) => {
  if ( debug ) {
    const preUser = ( user ? user.id : user );
    const preGuild = ( guild ? guild.id : guild );
    const preProcessed = { user: preUser, guild: preGuild, doBlacklist: doBlacklist };
    console.log( 'getPerms received inputs:%o', preProcessed );
  }

  try {
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
    .catch( async errFindBot => { await errorHandler( errFindBot, { command: 'getPerms', type: 'getBotDB' } ); } );
    const clientID = ( botConfig.ClientID || config.clientId || client.id );
    const botUsers = client.users.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( user.id === botOwner.id ? true : false );
    const globalBlacklist = ( botConfig.Blacklist || [] );
    const isGlobalBlacklisted = ( globalBlacklist.indexOf( user.id ) != -1 ? true : false );
    const globalWhitelist = ( botConfig.Whitelist || [] );
    const isGlobalWhitelisted = ( globalWhitelist.indexOf( user.id ) != -1 ? true : false );
    const botMods = ( botConfig.Mods || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( user.id ) != -1 ) ? true : false );
    const globalPrefix = ( botConfig.Prefix || config.prefix || '!' );

    var isDevGuild = false;
    var guildOwner = null;
    var guildAllowsPremium = false;
    var isGuildOwner = false;
    var roleServerBooster = null;
    var isServerBooster = false;
    var arrAuthorPermissions = [];

    var guildConfig = null;
    var objGuildMembers = null;

    if ( guild ) {
      const createConfig = {
        Guild: guild.id,
        Blacklist: { Members: [], Roles: [] },
        Commands: [],
        Invite: null,
        Logs: { Active: true, Chat: null, Default: null, Error: null },
        Prefix: globalPrefix,
        Premium: true,
        Welcome: { Active: false, Channel: null, Msg: null, Role: null },
        Whitelist: { Members: [], Roles: [] }
      };
      guildConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( async errFind => {
        console.error( 'Error attempting to find %s (ID:%s) in my database in config.js:\n%s', guild.name, guild.id, errFind.stack );
        await guildConfigDB.create( createConfig )
        .then( createSuccess => {
          console.log( 'Created a default DB entry for %s that was not set up.', guild.name );
          botOwner.send( 'Error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database, so I created it with default config.' );
        } )
        .catch( createError => {
          console.error( 'Error attempting to create %s (ID:%s) guild configuration in my database in config.js:\n%s', guild.name, guild.id, createError.stack );
          botOwner.send( 'Error attempting to create `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database.  Please check console for details.' );
        } );
        return createConfig;
      } );
      if ( !guildConfig ) {
        await guildConfigDB.create( createConfig )
        .then( createSuccess => {
          console.log( 'Created a default DB entry for %s that was not set up.', guild.name );
          botOwner.send( 'Error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database, so I created it with default config.' );
        } )
        .catch( createError => {
          console.error( 'Error attempting to create %s (ID:%s) guild configuration in my database in config.js:\n%s', guild.name, guild.id, createError.stack );
          botOwner.send( 'Error attempting to create `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database.  Please check console for details.' );
        } );
        guildConfig = createConfig;
      }
      isDevGuild = ( guild.id === botConfig.DevGuild ? true : false );
      objGuildMembers = guild.members.cache;
      guildOwner = objGuildMembers.get( guild.ownerId );
      isGuildOwner = ( user.id === guildOwner.id ? true : false );
      guildAllowsPremium = guildConfig.Premium;
      roleServerBooster = ( guild.roles.premiumSubscriberRole || null );
      isServerBooster = ( !roleServerBooster ? false : ( roleServerBooster.members.get( user.id ) ? true : false ) );
      arrAuthorPermissions = ( objGuildMembers.get( user.id ).permissions.toArray() || [] );
    }

    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const checkPermission = ( permission ) => { return ( ( hasAdministrator || arrAuthorPermissions.indexOf( permission ) !== -1 ) ? true : false ); };

    const guildBlacklist = ( guildConfig.Blacklist ? ( guildConfig.Blacklist.Roles || [] ) : [] );
    const arrBlackMembers = ( guildConfig.Blacklist ? ( guildConfig.Blacklist.Members || [] ) : [] );
    var arrBlackGuild = [];
    if ( guildBlacklist.length > 0 ) {
      for ( const role of guildBlacklist ) {
        let roleMembers = Array.from( await guild.roles.cache.get( role ).members.keys() );
        arrBlackGuild = arrBlackGuild.concat( roleMembers );
      }
    }
    if ( arrBlackMembers.length > 0 ) { arrBlackGuild = arrBlackGuild.concat( arrBlackMembers ); }
    const isGuildBlacklisted = ( arrBlackGuild.indexOf( user.id ) != -1 ? true : false );

    const guildWhitelist = ( guildConfig.Whitelist ? ( guildConfig.Whitelist.Roles || [] ) : [] );
    const arrWhiteMembers = ( guildConfig.Whitelist ? ( guildConfig.Whitelist.Members || [] ) : [] );
    var arrWhiteGuild = [];
    if ( guildWhitelist.length > 0 ) {
      for ( const role of guildWhitelist ) {
        let roleMembers = Array.from( await guild.roles.cache.get( role ).members.keys() );
        arrWhiteGuild = arrWhiteGuild.concat( roleMembers );
      }
    }
    if ( arrWhiteMembers.length > 0 ) { arrWhiteGuild = arrWhiteGuild.concat( arrWhiteMembers ); }
    const isGuildWhitelisted = ( arrWhiteGuild.indexOf( user.id ) != -1 ? true : false );

    const guildPrefix = ( guildConfig.Prefix || globalPrefix );
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
      checkPermission: checkPermission,
      guildAllowsPremium: guildAllowsPremium,
      roleServerBooster: roleServerBooster,
      isServerBooster: isServerBooster,
      isGuildBlacklisted: isGuildBlacklisted,
      isGlobalBlacklisted: isGlobalBlacklisted,
      isBlacklisted: isBlacklisted,
      isGuildWhitelisted: isGuildWhitelisted,
      isGlobalWhitelisted: isGlobalWhitelisted,
      isWhitelisted: isWhitelisted,
      content: false
    }

    if ( debug ) {
      let resultKeys = Object.keys( results );
      let debugResults = {};
      for ( const key of resultKeys ) {
        if ( typeof( results[ key ] ) != 'object' ) { debugResults[ key ] = results[ key ]; }
        else {
          let resultObj = results[ key ];
          let objType = resultObj.constructor.name;
          let objId = resultObj.id;
          let objName = ( resultObj.displayName || resultObj.globalName || resultObj.name );
          debugResults[ key ] = '{ ' + objType + ': ' + objId + ' }';
        }
      }
      console.log( 'getPerms is returning: %o', debugResults );
    }

    if ( doBlacklist && isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      results.content = 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.';
    }
    else if ( doBlacklist && isBotMod && isGuildBlacklisted ) {
      user.send( { content: 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '! Use `/config remove` to remove yourself from the blacklist.' } );
    }
    return results;
  }
  catch ( errPerms ) { await errHandler( errPerms, { command: 'getPerms', type: 'tryFunction' } ); }
};