const client = require( '..' );
const chalk = require( 'chalk' );
const { OAuth2Scopes, PermissionFlagsBits } = require( 'discord.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const createNewUser = require( '../functions/createNewUser.js' );
const addUserGuild = require( '../functions/addUserGuild.js' );
const duration = require( '../functions/duration.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const userConfig = require( '../models/BotUser.js' );
const objTimeString = require( '../jsonObjects/time.json' );

client.on( 'guildDelete', async ( guild ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const guildMembers = guild.members.cache;
    const guildOwner = guildMembers.get( guild.ownerId );
    const dbExpires = new Date( ( new Date() ).setMonth( ( new Date() ).getMonth() + 1 ) );
    const inviteUrl = client.generateInvite( {
      permissions: [
        PermissionFlagsBits.CreateInstantInvite,
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ManageWebhooks,
        PermissionFlagsBits.UseApplicationCommands
      ],
      scopes: [
        OAuth2Scopes.Bot,
        OAuth2Scopes.ApplicationsCommands
      ],
    } );
    const newGuildConfig = await getGuildConfig( guild );
    const roleEveryone = guild.roles.cache.find( role => role.name === '@everyone' );
    const chanWidget = ( guild.widgetEnabled ? guild.widgetChannelId : null );
    const chanRules = guild.rulesChannelId;
    const chanPublicUpdates = guild.publicUpdatesChannelId;
    const chanSafetyAlerts = guild.safetyAlertsChannelId;
    const chanSystem = guild.systemChannelId;
    const chanFirst = Array.from( guild.channels.cache.filter( chan => !chan.nsfw && chan.permissionsFor( roleEveryone ).has( 'ViewChannel' ) ).keys() )[ 0 ];
    const definedInvite = newGuildConfig.Invite;
    const chanInvite = ( definedInvite || chanWidget || chanRules || chanPublicUpdates || chanSafetyAlerts || chanSystem || chanFirst );
    const doChanError = ( !( chanSystem || chanSafetyAlerts || chanFirst || null ) ? null : guild.channels.cache.get( chanSystem || chanSafetyAlerts || chanFirst ) );
    newGuildConfig.Expires = dbExpires;
    await guildConfig.updateOne( { _id: guild.id }, newGuildConfig, { upsert: true } )
    .then( updateSuccess => {
      console.log( 'Set expriation of DB entry for %s (id: %s) upon leaving guild to: %o', chalk.bold.red( guild.name ), guild.id, dbExpires.toLocaleTimeString( 'en-US', objTimeString ) );
      guildOwner.send( { content: 'Hello! You or someone has removed me from https://discord.com/channels/' + guild.id + '/' + chanInvite + '!  You can get me back at any time by [re-adding](<' + inviteUrl + '>) me.\nI think this might have been an error, so I\'ll save your server\'s configuration settings for a month until `' + dbExpires.toLocaleTimeString( 'en-US', objTimeString ) + '` in case you want me back.' } )
      .catch( errSendDM => {
        if ( doChanError ) {
          doChanError.send( { content: 'Someone has removed me from https://discord.com/channels/' + guild.id + '/' + chanInvite + ' and I was unable to DM <@' + guild.ownerId + '> about it directly!  You can get me back at any time by [re-adding](<' + inviteUrl + '>) me.\nI think this might have been an error, so I\'ll save your server\'s configuration settings for a month until `' + dbExpires.toLocaleTimeString( 'en-US', objTimeString ) + '` in case you want me back.' } )
          .catch( errSendChan => {
            console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o\nerrSendChan: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM, errSendChan );
            botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or send a message to a channel that I left https://discord.com/channels/' + guild.id + '/' + chanInvite + '.' } );
          } );
        }
        else {
          console.error( 'chanSystem: %s\nchanSafetyAlerts: %s\nchanFirst: %s\ndoChanError: %s\nerrSendDM: %o', chanSystem, chanSafetyAlerts, chanFirst, doChanError, errSendDM );
          botOwner.send( { content: 'Failed to DM <@' + guild.ownerId + '> or find a channel to notify them that I left https://discord.com/channels/' + guild.id + '/' + chanInvite + '.' } );
        }
      } );
    } )
    .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( `Error attempting to update ${guild.name} (id: ${guild.id}) to expire in DB:\n${dbExpires}\nError:\n${updateError}` ) ); } );

    const memberIds = Array.from( guildMembers.keys() );
    memberIds.forEach( async ( memberId ) => {// Update users for this guild to expire.
      let member = guild.members.cache.get( memberId );
      if ( await userConfig.countDocuments( { _id: userId } ) === 0 ) { await createNewUser( user ); }
      await addUserGuild( userId, guild );
      let currUser = await userConfig.findOne( { _id: userId } );
      let storedUserGuilds = [];
      currUser.Guilds.forEach( ( entry, i ) => { storedUserGuilds.push( entry._id ); } );
      let ndxUserGuild = storedUserGuilds.indexOf( guild.id );
      if ( ndxUserGuild != -1 ) {
        let currUserGuild = currUser.Guilds[ ndxUserGuild ];
        currUserGuild.Expires = dbExpires;
        console.log( 'Guild %s (%s) expires from %s (%s) in %s on: %o', guild.id, chalk.red( currUserGuild.GuildName ), currUser._id, chalk.red( currUser.UserName ), chalk.bold.redBright( await duration( dbExpires - ( new Date() ), { getWeeks: true } ) ), dbExpires );
        userConfig.updateOne( { _id: userId }, currUser, { upsert: true } )
        .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update guild %s (id: %s) for user %s (id: %s) to expire %o in my database in guildDelete.js:\n%o' ), guild.name, guild.id, currUser.UserName, userId, dbExpires, updateError ); } );
      }
    } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './events/guildDelete.js' ), errObject.stack ); }
} );