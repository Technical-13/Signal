const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const userConfig = require( '../models/BotUser.js' );
const getBotConfig = require( './getBotDB.js' );
const getGuildConfig = require( './getGuildDB.js' );
const createNewUser = require( './createNewUser.js' );
const addUserGuild = require( './addUserGuild.js' );
const verUserDB = config.verUserDB;
const getDebugString = ( thing ) => {
  if ( Array.isArray( thing ) ) { return '{ object-Array: { length: ' + thing.length + ' } }'; }
  else if ( Object.prototype.toString.call( thing ) === '[object Date]' ) { return '{ object-Date: { ISOstring: ' + thing.toISOString() + ', value: ' + thing.valueOf() + ' } }'; }
  else if ( typeof( thing ) != 'object' ) { return thing; }
  else {
    let objType = ( thing ? 'object-' + thing.constructor.name : typeof( thing ) );
    let objId = ( thing ? thing.id : 'no.id' );
    let objName = ( thing ? ( thing.displayName || thing.globalName || thing.name ) : 'no.name' );
    return '{ ' + objType + ': { id: ' + objId + ', name: ' + objName + ' } }';
  }
};
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getPerms.js' );

module.exports = async ( user, guild, doBlacklist = true, debug = false ) => {
  try {
    if ( debug ) {
      const preUser = ( user ? '{ id: ' + user.id + ', displayName: ' + user.displayName + ' }' : user );
      const preGuild = ( guild ? '{ id: ' + guild.id + ', name: ' + guild.name + ' }' : guild );
      const preProcessed = { user: preUser, guild: preGuild, doBlacklist: doBlacklist };
      console.log( 'getPerms received inputs:%o', preProcessed );
    }
    if ( !user ) { throw new Error( 'No user to get permissions for.' ); }
    if ( !guild ) { throw new Error( 'No guild to get user permissions for.' ); }
    const users = client.users.cache;
    const members = guild.members.cache;

    const results = { errors: { hasNoMember: false, hasNoPerms: false } };
    const member = members.get( user.id );
    const dbHasMember = ( await userConfig.countDocuments( { _id: user.id } ) != 0 ? true : false );
    if ( member && !dbHasMember ) { await createNewUser( user ); }
    if ( member ) {
      const currUser = await userConfig.findOne( { _id: user.id } );
      const storedUserGuilds = [];
      currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
      if ( storedUserGuilds.indexOf( guild.id ) === -1 ) { await addUserGuild( user.id, guild ); }
    }
    else {
      results.errors.hasNoMember = true;
      results.errors.noMember = {
        console: 'Unable to get member ' + user.displayName + ' (🆔:' + user.id + ') from guild ' + guild.name + ' (🆔:' + guild.id + ').',
        message: 'Unable to get member <@' + user.id + '> (' + user.displayName + ') from [**`' + guild.name + '`**](https://discord.com/channels/' + guild.id + ').',
        status: true
      };
    }

    const botConfig = await getBotConfig();
    results.clientId = ( botConfig.ClientID || config.clientId || client.id );
    results.botOwner = users.get( botConfig.Owner );
    results.isBotOwner = ( user.id === results.botOwner.id ? true : false );
    const globalBlacklist = ( botConfig.Blacklist || [] );
    results.isGlobalBlacklisted = ( globalBlacklist.indexOf( user.id ) != -1 ? true : false );
    const globalWhitelist = ( botConfig.Whitelist || [] );
    results.isGlobalWhitelisted = ( globalWhitelist.indexOf( user.id ) != -1 ? true : false );
    const botMods = ( botConfig.Mods || [] );
    results.isBotMod = ( ( results.isBotOwner || botMods.indexOf( user.id ) != -1 ) ? true : false );
    results.globalPrefix = ( botConfig.Prefix || config.prefix || '!' );

    const guildConfig = await getGuildConfig( guild );
    results.isDevGuild = ( guild.id === botConfig.DevGuild ? true : false );
    results.guildOwner = members.get( guild.ownerId );
    results.isGuildOwner = ( user.id === results.guildOwner.id ? true : false );
    results.guildAllowsPremium = guildConfig.Premium;
    results.roleServerBooster = ( guild.roles.premiumSubscriberRole || null );
    results.isServerBooster = ( !results.roleServerBooster ? false : ( results.roleServerBooster.members.get( user.id ) ? true : false ) );
    const arrAuthorPermissions = ( member?.permissions.toArray() || [] );
    if ( !arrAuthorPermissions.length ) {
      results.errors.hasNoPerms = true;
      results.errors.noPerms = {
        console: 'Member ' + user.displayName + ' (🆔:' + user.id + ') has no permissions in ' + guild.name + ' (🆔:' + guild.id + ').',
        message: 'Member <@' + user.id + '> (' + user.tag + ') has no permissions in [**`' + guild.name + '`**](https://discord.com/channels/' + guild.id + ').',
        status: true
      };
    }

    results.hasAdministrator = ( ( results.isBotMod || results.isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    results.checkPermission = ( permission ) => { return ( ( results.hasAdministrator || arrAuthorPermissions.indexOf( permission ) !== -1 ) ? true : false ); };

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
    results.isGuildBlacklisted = ( arrBlackGuild.indexOf( user.id ) != -1 ? true : false );

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
    results.isGuildWhitelisted = ( arrWhiteGuild.indexOf( user.id ) != -1 ? true : false );

    results.guildPrefix = ( guildConfig.Prefix || results.globalPrefix );
    results.prefix = ( results.guildPrefix || results.globalPrefix || client.prefix );
    results.isBlacklisted = ( results.isGlobalBlacklisted || ( results.isGuildBlacklisted && !( results.isBotMod || results.isGlobalWhitelisted ) ) );
    results.isWhitelisted = ( results.isGlobalWhitelisted || ( results.isGuildWhitelisted && !results.isGlobalBlacklisted ) );

    results.content = false;

    if ( debug ) {
      let resultKeys = Object.keys( results );
      new Promise( async ( resolve ) => {
        let debugResults = {};
        for ( const key of resultKeys ) { debugResults[ key ] = await getDebugString( results[ key ] ); }
        resolve( debugResults );
      } )
      .then( debugResults => { console.log( 'getPerms is returning: %o', debugResults ); } );
    }

    if ( doBlacklist && results.isBlacklisted && !results.isGlobalWhitelisted ) {
      let contact = ( results.isGuildBlacklisted ? results.guildOwner.id : results.botOwner.id );
      results.content = 'Oh no!  It looks like you have been blacklisted from using my commands' + ( results.isGuildBlacklisted ? ' in this server!' : '!' ) + '  Please contact <@' + contact + '> to resolve the situation.';
    }
    else if ( doBlacklist && results.isBotMod && results.isGuildBlacklisted ) {
      user.send( { content: 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '! Use `/config remove` to remove yourself from the blacklist.' } );
    }

    return results;
  }
  catch ( errObject ) {
    console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack );
  }
};