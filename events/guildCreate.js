const client = require( '..' );
require( 'dotenv' ).config();
const ENV = process.env;
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const botConfigDB = require( '../models/BotConfig.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const errHandler = require( '../functions/errorHandler.js' );
const createNewGuild = require( '../functions/createNewGuild.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const createNewUser = require( '../functions/createNewUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const botVerbosity = client.verbosity;
const verUserDB = config.verUserDB;
const strScript = chalk.hex( '#FFA500' ).bold( './events/guildCreate.js' );

client.on( 'guildCreate', async ( guild ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const guildOwner = guild.members.cache.get( guild.ownerId );
    if ( await guildConfig.countDocuments( { _id: guild.id } ) === 0 ) {
      if ( botVerbosity >= 1 ) { console.log( 'Adding G:%s to my database...', chalk.bold.green( guild.name ) ); }
      await createNewGuild( guild );
    }
    const newGuildConfig = await getGuildConfig( guild, true )
    .then( async gotGuild => {
      if ( gotGuild.Expires ) {
        if ( botVerbosity >= 2 ) { console.log( 'Clearing %s Date for G:%s in my database...', chalk.bold.red( 'Expires' ), chalk.bold.green( guild.name ) ); }
        gotGuild.Expires = null;
        await guildConfig.updateOne( { _id: guild.id }, gotGuild, { upsert: true } )
        .then( updateSuccess => { console.log( '\tCleared expriation of DB entry for %s in %s.', chalk.bold.green( guild.name ), strScript ); } )
        .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( '\tError attempting to update %s (id: %s) to clear expiration in %s:\n%o' ), guild.name, guild.id, strScript, updateError ); } );
      }
      const roleEveryone = guild.roles.cache.find( role => role.name === '@everyone' );
      const chanWidget = ( guild.widgetEnabled ? guild.widgetChannelId : null );
      const chanRules = guild.rulesChannelId;
      const chanPublicUpdates = guild.publicUpdatesChannelId;
      const chanSafetyAlerts = guild.safetyAlertsChannelId;
      const chanSystem = guild.systemChannelId;
      const chanFirst = Array.from( guild.channels.cache.filter( chan => !chan.nsfw && chan.permissionsFor( roleEveryone ).has( 'ViewChannel' ) ).keys() )[ 0 ];
      const definedInvite = gotGuild.Invite;
      const chanInvite = ( definedInvite || chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
      const doChanError = ( !( chanSystem || chanSafetyAlerts || chanFirst || null ) ? null : guild.channels.cache.get( chanSystem || chanSafetyAlerts || chanFirst ) );
      guildOwner.send( { content: 'Hello! You or someone with `ADMINISTRATOR` or `MANAGE_SERVER` permissions has added me to https://discord.com/channels/' + guild.id + '/' + chanInvite + '!' } )
      .catch( errSendDM => {
        const chanSystem = guild.systemChannelId;
        const chanSafetyAlerts = guild.safetyAlertsChannelId;
        const chanFirst = guild.channels.cache.filter( chan => { if ( !chan.nsfw && chan.viewable ) { return chan; } } ).first().id;
        if ( doChanError ) {
          doChanError.send( { content: 'Someone from https://discord.com/channels/' + guild.id + '/' + chanInvite + ' with `ADMINISTRATOR` or `MANAGE_SERVER` permissions has added me to your server and I was unable to DM <@' + guild.ownerId + '> about it directly!' } )
          .catch( errSendChan => {
            console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o\nerrSendChan: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM, errSendChan );
            botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or send a message to a channel that I joined https://discord.com/channels/' + guild.id + '/' + chanInvite + '.' } );
          } );
        }
        else {
          console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM );
          botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or find a channel to notify them that I joined https://discord.com/channels/' + guild.id + '/' + chanInvite + '.' } );
        }
      } )
    } )
    .catch( errGetGuild => {
      console.error( '\tFailed to create %s (id: %s) in %s: %o', guild.name, guild.id, strScript, errGetGuild );
      botOwner.send( { content: 'Error adding [' + guild.name + '](<https://discord.com/channels/' + guild.id + '>) to the database.' } );
    } );

    const guildMembers = Array.from( guild.members.cache.keys() );
    guildMembers.forEach( async memberId => {
      let member = guild.members.cache.get( memberId );
      let { user } = member;
      if ( await userConfig.countDocuments( { _id: memberId } ) === 0 ) {
        if ( botVerbosity >= 1 ) { console.log( '\tAdding U:%s to my database...', chalk.bold.green( user.displayName ) ); }
        await createNewUser( user );
      }
      const currUser = await userConfig.findOne( { _id: memberId } );
      const storedUserGuilds = [];
      currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
      let ndxUserGuild = storedUserGuilds.indexOf( guild.id );
      if ( ndxUserGuild === -1 ) {
        if ( botVerbosity >= 2 ) { console.log( '\t\tAdding G:%s to U:%s.', chalk.bold.green( guild.name ), chalk.bold.green( user.displayName ) ); }
        await addUserGuild( memberId, guild );
      }
      else {
        if ( botVerbosity >= 2 ) { console.log( '\t\tClearing %s Date from G:%s for U:%s.', chalk.bold.red( 'Expires' ), chalk.bold.green( guild.name ), chalk.bold.green( user.displayName ) ); }
        let currUserGuild = currUser.Guilds[ ndxUserGuild ];
        currUserGuild.Expires = null;
        userConfig.updateOne( { _id: memberId }, currUser, { upsert: true } )
        .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update G:%s for U:%s to expire %o in my database in %s:\n%o' ), guild.name, currUser.UserName, dbExpires, strScript, updateError ); } );
      }
    } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
} );