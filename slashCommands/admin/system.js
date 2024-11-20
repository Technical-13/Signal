require( 'dotenv' ).config();
const ENV = process.env;
const config = require( '../../config.json' );
const chalk = require( 'chalk' );
const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const ActivityTypes = { Playing: 0, Streaming: 1, Listening: 2, Watching: 3, Custom: 4, Competing: 5 };
const botConfigDB = require( '../../models/BotConfig.js' );
const errHandler = require( '../../functions/errorHandler.js' );
const thisBotName = ENV.BOT_USERNAME;
const botOwnerID = ENV.OWNER_ID;
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/admin/system.js' );

module.exports = {
  name: 'system',
  group: 'admin',
  description: 'Change bot configs.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  options: [/* add, clear, get, remove, reset, set //*/
    { type: 1, name: 'add', description: 'Add a user to one of my lists.', options: [
      { type: 6, name: 'blacklist', description: 'User to block from using all commands.' },
      { type: 6, name: 'moderator', description: 'User to add as a moderator.' },
      { type: 6, name: 'whitelist', description: 'User to permit to use all non-mod commands.' }
    ] }/* add //*/,
    { type: 1, name: 'clear', description: 'Clear bot\'s black, white, and/or moderator lists.', options: [
      { type: 5, name: 'blacklist', description: 'Clear bot\'s blacklist.' },
      { type: 5, name: 'moderators', description: 'Clear bot\'s moderator list.' },
      { type: 5, name: 'whitelist', description: 'Clear bot\'s whitelist.' }
    ] }/* clear //*/,
    { type: 1, name: 'get', description: 'Get my current configuration.', options: [
      { type: 5, name: 'share', description: 'Share result to current channel instead of making it ephemeral.' }
    ] },
    { type: 1, name: 'remove', description: 'Remove a user from one of my lists.', options: [
      { type: 6, name: 'blacklist', description: 'User to remove from blacklist.' },
      { type: 6, name: 'moderator', description: 'User to remove as moderator.' },
      { type: 6, name: 'whitelist', description: 'User to remove from whitelist.' }
    ] }/* remove //*/,
    { type: 1, name: 'reset', description: 'Watch me rise from the ashes like a phoenix.' },
    { type: 1, name: 'set', description: 'Set settings for the bot.', options: [
      { type: 3, name: 'status', description: 'Set the status.', choices: [
        { name: 'Online', value: 'online' }, { name: 'Idle', value: 'idle' },
        { name: 'Do Not Disturb', value: 'dnd' }, { name: 'Offline', value: 'offline' } ] },
      { type: 3, name: 'activity-type', description: 'Set the activity type.', choices: [
        { name: 'Playing', value: 'Playing' }, { name: 'Streaming', value: 'Streaming' },
        { name: 'Listening', value: 'Listening' }, { name: 'Watching', value: 'Watching' },
        { name: 'Custom', value: 'Custom' }, { name: 'Competing', value: 'Competing' } ] },
      { type: 3, name: 'activity', description: 'Set the activity.' },
      { type: 3, name: 'prefix', description: 'What character do I look for!?' },
      { type: 6, name: 'owner', description: 'Who is my master!?' },
      { type: 3, name: 'dev-guild', description: 'Where am I from!?' }
    ] }/* set //*/
  ]/* add, get, remove, reset, set //*/,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const botConfig = await botConfigDB.findOne( { _id: client.id } ).catch( async errFindBot => { await errHandler( errFindBot, { command: 'system', type: 'getBotDB' } ); } );
      const { guilds, user: bot, users } = client;
      const botUsers = users.cache;
      const botGuilds = guilds.cache;
      const botOwner = botUsers.get( botConfig.Owner );
      const isBotOwner = ( author.id === botOwner.id ? true : false );
      const arrBlackList = ( botConfig.Blacklist || [] );
      const botMods = ( botConfig.Mods || [] );
      const arrWhiteList = ( botConfig.Whitelist || [] );
      const isBotMod = ( ( isBotOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
      const myTask = options.getSubcommand();

      var newName = ( options.getString( 'name' ) || null );
      var newOwner = ( options.getUser( 'owner' ) || null );
      var newPrefix = ( options.getString( 'prefix' ) || null );
      var newDevGuild = ( options.getString( 'dev-guild' ) || null );
      var setStatus = ( options.getString( 'status' ) || null );
      var setActivityType = ( options.getString( 'activity-type' ) || null );
      var setActivity = ( options.getString( 'activity' ) || null );

      if ( !isBotMod ) { return interaction.editReply( { content: 'You are not the boss of me...' } ); }
      else if ( isBotMod && ( myTask === 'get' || ( myTask === 'set' && ( setStatus || setActivityType || setActivity ) ) ) ) {
        switch ( myTask ) {
          case 'get':
            let strBlackList = '**' + ( arrBlackList.length === 0 ? 'No one is blacklisted!' : '[ **<@' + arrBlackList.join( '>**, **<@' ) + '>** ]' ) + '**';
            let strModList = '**' + ( botMods.length === 0 ? 'No bot moderators!' : '[ **<@' + botMods.join( '>**, **<@' ) + '>** ]' ) + '**';
            let strWhiteList =  '**' + ( arrWhiteList.length === 0 ? 'No one is whitelisted!' : '[ **<@' + arrWhiteList.join( '>**, **<@' ) + '>** ]' ) + '**';
            const showConfigs = 'My configuration:\n\t' +
              'Name: `' + botConfig.BotName + '` (:id:`' + botConfig.ClientID + '`)\n\t' +
              'Owner: <@' + botConfig.Owner + '>\n\t' +
              'Command Prefix: `' + botConfig.Prefix + '`\n\t' +
              'Development Guild: `' + botGuilds.get( botConfig.DevGuild ).name + '`\n\t' +
              'Blacklist: ' + strBlackList + '\n\t' +
              'Whitelist: ' + strWhiteList + '\n\t' +
              'Moderators: ' + strModList;
            if ( !options.getBoolean( 'share' ) ) { return interaction.editReply( { content: showConfigs } ); }
            else {
              channel.send( { content: showConfigs } )
              .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
              .catch( async errSend => { return interaction.editReply( { content: await errHandler( errSend, { channel: channel, command: 'system', type: 'errSend' } ) } ); } );
            }
          break;
          case 'set':
            if ( setStatus || setActivityType || setActivity ) {
              const botPresence = bot.presence.toJSON();
              const botActivities = botPresence.activities[ 0 ];
              const botActivityType = Object.keys( ActivityTypes ).find( key => ActivityTypes[ key ] === botActivities.type );
              const selectActivityType = ( options.getString( 'activity-type' ) || botActivityType || 'Playing' );
              const currActivityName = ( botActivityType === 1 ? botActivities.url : ( botActivityType === 4 ? botActivities.state : botActivities.name ) );
              const selectActivityName = ( options.getString( 'activity' ) || currActivityName || '' );
              const setPresenceActivity = [ { type: ActivityTypes[ selectActivityType ], name: selectActivityName } ];
              const newActivity = ( selectActivityType === 'Custom' ? '' : ( selectActivityType === 'Competing' ? selectActivityType + ' in ' : selectActivityType ) ) + selectActivityName;
              const selectStatus = ( options.getString( 'status' ) || botPresence.status );

              bot.setPresence( { activities: setPresenceActivity, status: selectStatus } )
              .then( newPresence => { return interaction.editReply( { content: 'My presence has been changed to `' + newActivity + '` and my status is `' + selectStatus + '`' } ); } )
              .catch( async errSetPresence => { return interaction.editReply( { content: await errHandler( errSetPresence, { command: 'system', type: 'setPresence' } ) } ); } );
            }
        }
      }
      else if ( isBotMod && !isBotOwner ) { return interaction.editReply( { content: 'You may only get my configuration or set my presence.  Please try again.' } ); }
      else if ( isBotOwner ) {
        switch ( myTask ) {
          case 'add':
            let addBlack = ( options.getUser( 'blacklist' ) ? options.getUser( 'blacklist' ).id : null );
            let addMod = ( options.getUser( 'moderator' ) ? options.getUser( 'moderator' ).id : null );
            let addWhite = ( options.getUser( 'whitelist' ) ? options.getUser( 'whitelist' ).id : null );
            if ( addBlack ) {
              if ( arrBlackList.indexOf( addBlack ) != -1 ) { return interaction.editReply( { content: '<@' + addBlack + '> is already on the blacklist!' } ) }
              else {
                arrBlackList.push( addBlack );
                if ( botMods.indexOf( addBlack ) != -1 ) {
                  botMods.splice( botMods.indexOf( addBlack ), 1 );
                  console.log( chalk.bold.greenBright( `Removed ${addBlack} (${botUsers.get( addBlack ).displayName}) from Mods in the database.` ) );
                }
                if ( arrWhiteList.indexOf( addBlack ) != -1 ) {
                  arrWhiteList.splice( arrWhiteList.indexOf( addBlack ), 1 );
                  console.log( chalk.bold.greenBright( `Removed ${addBlack} (${botUsers.get( addBlack ).displayName}) from Whitelist in the database.` ) );
                }
                await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: botConfig.BotName,
                  ClientID: botConfig.ClientID,
                  Owner: botConfig.Owner,
                  Prefix: botConfig.Prefix,
                  Blacklist: arrBlackList,
                  Whitelist: arrWhiteList,
                  Mods: botMods,
                  DevGuild: botConfig.DevGuild
                }, { upsert: true } )
                .then( addSuccess => {
                  console.log( chalk.bold.greenBright( `Blacklisted ${addBlack} (${botUsers.get( addBlack ).displayName}) in the database.` ) );
                  return interaction.editReply( { content: 'Blacklisted <@' + addBlack + '> in the database.' } );
                } )
                .catch( async addError => { return interaction.editReply( { content: await errHandler( addError, { command: 'system', modBlack: addBlack, modType: 'add', type: 'modifyDB' } ) } ); } );
              }
            }
            if ( addMod ) {
              if ( botMods.indexOf( addMod ) != -1 ) { return interaction.editReply( { content: '<@' + addMod + '> is already a moderator of me!' } ) }
              else {
                botMods.push( addMod );
                if ( arrBlackList.indexOf( addMod ) != -1 ) {
                  arrBlackList.splice( arrBlackList.indexOf( addMod ), 1 );
                  console.log( chalk.bold.greenBright( `Removed ${addMod} (${botUsers.get( addMod ).displayName}) from Blacklist in the database.` ) );
                }
                if ( arrWhiteList.indexOf( addMod ) != -1 ) {
                  arrWhiteList.splice( arrWhiteList.indexOf( addMod ), 1 );
                  console.log( chalk.bold.greenBright( `Removed ${addMod} (${botUsers.get( addMod ).displayName}) from Whitelist in the database.` ) );
                }
                await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: botConfig.BotName,
                  ClientID: botConfig.ClientID,
                  Owner: botConfig.Owner,
                  Prefix: botConfig.Prefix,
                  Blacklist: arrBlackList,
                  Whitelist: arrWhiteList,
                  Mods: botMods,
                  DevGuild: botConfig.DevGuild
                }, { upsert: true } )
                .then( addSuccess => {
                  console.log( chalk.bold.greenBright( `Added moderator, ${addMod} (${botUsers.get( addMod ).displayName}), to database.` ) );
                  return interaction.editReply( { content: 'Added moderator, <@' + addMod + '>, to database.' } );
                } )
                .catch( async addError => { return interaction.editReply( { content: await errHandler( addError, { command: 'system', modMod: addMod, modType: 'add', type: 'modifyDB' } ) } ); } );
              }
            }
            if ( addWhite ) {
              if ( arrWhiteList.indexOf( addWhite ) != -1 ) { return interaction.editReply( { content: '<@' + addWhite + '> is already on the whitelist!' } ) }
              else {
                arrWhiteList.push( addWhite );
                if ( arrBlackList.indexOf( addWhite ) != -1 ) {
                  arrBlackList.splice( arrBlackList.indexOf( addWhite ), 1 );
                  console.log( chalk.bold.greenBright( `Removed ${addWhite} (${botUsers.get( addWhite ).displayName}) from Blacklist in the database.` ) );
                }
                if ( botMods.indexOf( addWhite ) != -1 ) {
                  botMods.splice( botMods.indexOf( addWhite ), 1 );
                  console.log( chalk.bold.greenBright( `Removed ${addWhite} (${botUsers.get( addWhite ).displayName}) from Mods in the database.` ) );
                }
                await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: botConfig.BotName,
                  ClientID: botConfig.ClientID,
                  Owner: botConfig.Owner,
                  Prefix: botConfig.Prefix,
                  Blacklist: arrBlackList,
                  Whitelist: arrWhiteList,
                  Mods: botMods,
                  DevGuild: botConfig.DevGuild
                }, { upsert: true } )
                .then( addSuccess => {
                  console.log( chalk.bold.greenBright( `Whitelisted ${addWhite} (${botUsers.get( addWhite ).displayName}) in the database.` ) );
                  return interaction.editReply( { content: 'Whitelisted <@' + addWhite + '> in the database.' } );
                } )
                .catch( async addError => { return interaction.editReply( { content: await errHandler( addError, { command: 'system', modWhite: addWhite, modType: 'add', type: 'modifyDB' } ) } ); } );
              }
            }
            break;
          case 'clear':
            let arrClearLists = [];
            let clearBlack = options.getBoolean( 'blacklist' );
            if ( clearBlack ) { arrClearLists.push( 'black' ); }
            let clearWhite = options.getBoolean( 'whitelist' );
            if ( clearWhite ) { arrClearLists.push( 'white' ); }
            let clearMods = options.getBoolean( 'moderators' );
            if ( clearMods ) { arrClearLists.push( 'moderator' ); }
            let intListsClear = arrClearLists.length;
            if ( intListsClear > 0 ) {
              arrClearLists[ 0 ] = arrClearLists[ 0 ].charAt( 0 ).toUpperCase() + arrClearLists[ 0 ].slice( 1 );
              let haveHas = ( intListsClear === 1 ? 'has' : 'have' );
              let clearLists = '';
              switch ( intListsClear ) {
                case 0: break;
                case 1:
                  clearLists = arrClearLists[ 0 ] + ' list';
                  break;
                case 2:
                  clearLists = arrClearLists.join( ' and ' ) + ' lists';
                  break;
                case 3: default:
                  let lastList = arrClearLists.pop();
                  clearLists = arrClearLists.join( ', ' ) + ', and ' + lastList + ' lists';
              }

              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: botConfig.BotName,
                ClientID: botConfig.ClientID,
                Owner: botConfig.Owner,
                Prefix: botConfig.Prefix,
                Blacklist: ( clearBlack ? [] : arrBlackList ),
                Whitelist: ( clearWhite ? [] : arrWhiteList ),
                Mods: ( clearMods ? [] : botMods ),
                DevGuild: botConfig.DevGuild
              }, { upsert: true } )
              .then( clearSuccess => {
                interaction.deleteReply();
                return channel.send( { content: 'My ' + clearLists + haveHas + ' been cleared.' } );
              } )
              .catch( async clearError => { return interaction.editReply( await errHandler( clearError, { author: author, clearLists: clearLists, command: 'system', guild: guild, modType: 'clear', type: 'modifyDB' } ) ); } );
            }
            break;
          case 'remove':
            let remBlack = ( options.getUser( 'blacklist' ) ? options.getUser( 'blacklist' ).id : null );
            let remMod = ( options.getUser( 'moderator' ) ? options.getUser( 'moderator' ).id : null );
            let remWhite = ( options.getUser( 'whitelist' ) ? options.getUser( 'whitelist' ).id : null );
            if ( remBlack ) {
              if ( arrBlackList.indexOf( remBlack ) === -1 ) { return interaction.editReply( { content: '<@' + remBlack + '> wasn\'t on the blacklist!' } ) }
              else {
                arrBlackList.splice( arrBlackList.indexOf( remBlack ), 1 );
                await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: botConfig.BotName,
                  ClientID: botConfig.ClientID,
                  Owner: botConfig.Owner,
                  Prefix: botConfig.Prefix,
                  Blacklist: arrBlackList,
                  Whitelist: arrWhiteList,
                  Mods: botMods,
                  DevGuild: botConfig.DevGuild
                }, { upsert: true } )
                .then( remSuccess => {
                  console.log( chalk.bold.greenBright( `Removed ${remBlack} (${botUsers.get( remBlack ).displayName}) from Blacklist in the database.` ) );
                  return interaction.editReply( { content: 'Removed <@' + remBlack + '> from Blacklist in the database.' } );
                } )
                .catch( async remError => { return interaction.editReply( { content: await errHandler( remError, { command: 'system', modBlack: remBlack, modType: 'remove', type: 'modifyDB' } ) } ); } );
              }
            }
            if ( remMod ) {
              if ( botMods.indexOf( remMod ) === -1 ) { return interaction.editReply( { content: '<@' + remMod + '> wasn\'t a moderator of me!' } ) }
              else {
                botMods.splice( botMods.indexOf( remMod ), 1 );
                await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: botConfig.BotName,
                  ClientID: botConfig.ClientID,
                  Owner: botConfig.Owner,
                  Prefix: botConfig.Prefix,
                  Blacklist: arrBlackList,
                  Whitelist: arrWhiteList,
                  Mods: botMods,
                  DevGuild: botConfig.DevGuild
                }, { upsert: true } )
                .then( remSuccess => {
                  console.log( chalk.bold.greenBright( `Removed moderator, ${remMod} (${botUsers.get( remMod ).displayName}), from database.` ) );
                  return interaction.editReply( { content: 'Removed moderator, <@' + remMod + '>, from database.' } );
                } )
                .catch( async remError => { return interaction.editReply( { content: await errHandler( remError, { command: 'system', modMod: remMod, modType: 'remove', type: 'modifyDB' } ) } ); } );
              }
            }
            if ( remWhite ) {
              if ( arrWhiteList.indexOf( remWhite ) === -1 ) { return interaction.editReply( { content: '<@' + remWhite + '> wasn\'t on the whitelist!' } ) }
              else {
                arrWhiteList.splice( arrWhiteList.indexOf( remWhite ), 1 );
                await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: botConfig.BotName,
                  ClientID: botConfig.ClientID,
                  Owner: botConfig.Owner,
                  Prefix: botConfig.Prefix,
                  Blacklist: arrBlackList,
                  Whitelist: arrWhiteList,
                  Mods: botMods,
                  DevGuild: botConfig.DevGuild
                }, { upsert: true } )
                .then( remSuccess => {
                  console.log( chalk.bold.greenBright( `Removed ${remWhite} (${botUsers.get( remWhite ).displayName}) from Whitelist in the database.` ) );
                  return interaction.editReply( { content: 'Removed <@' + remWhite + '> from Whitelist in the database.' } );
                } )
                .catch( async remError => { return interaction.editReply( { content: await errHandler( remError, { command: 'system', modWhite: remWhite, modType: 'remove', type: 'modifyDB' } ) } ); } );
              }
            }
            break;
          case 'reset':
            const thisBotName = ( config.botName || ENV.BOT_USERNAME || null );
            const botOwnerID = ( config.botOwnerId || ENV.OWNER_ID || null );
            const clientId = ( config.clientID || ENV.CLIENT_ID || client.id || null );
            const devGuildId = ( config.devGuildId || ENV.DEV_GUILD_ID || null );
            if ( thisBotName && botOwnerID && clientId && devGuildId ) {
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                BotName: thisBotName,
                Blacklist: [],
                ClientID: clientId,
                DevGuild: devGuildId,
                Mods: ( config.moderatorIds || [] ),
                Owner: botOwnerID,
                Prefix: ( config.prefix || '!' ),
                Whitelist: []
              }, { upsert: true } )
              .then( resetSuccess => {
                console.log( chalk.bold.greenBright( 'Bot configuration reset in my database.' ) );
                return interaction.editReply( { content: 'Bot configuration reset in my database.' } );
              } )
              .catch( async resetError => { return interaction.editReply( { content: await errHandler( resetError, { command: 'system', modType: 'reset', type: 'modifyDB' } ) } ); } );
            }
            else {
              if ( !thisBotName ) { console.error( chalk.bold.redBright( 'BotName missing attempting to reset configuration with `/system reset`.' ) ); }
              if ( !botOwnerID ) { console.error( chalk.bold.redBright( 'ClientID missing attempting to reset configuration with `/system reset`.' ) ); }
              if ( !clientId ) { console.error( chalk.bold.redBright( 'Owner missing attempting to reset configuration with `/system reset`.' ) ); }
              if ( !devGuildId ) { console.error( chalk.bold.redBright( 'DevGuild missing attempting to reset configuration with `/system reset`.' ) ); }
            }
            break;
          case 'set':
            if ( newName || newOwner || newPrefix || newDevGuild ) {
              newName = ( options.getString( 'name' ) || botConfig.BotName || config.botName );
              let newOwnerId = ( newOwner ? newOwner.id : ( botConfig.Owner || config.botOwnerId || botOwnerID ) );
              newPrefix = ( options.getString( 'prefix' ) || botConfig.Prefix || config.prefix );
              newDevGuild = ( options.getString( 'dev-guild' ) || botConfig.DevGuild || config.devGuildId );
              await botConfigDB.updateOne( { BotName: thisBotName }, {
                  BotName: newName,
                  Blacklist: arrBlackList,
                  ClientID: botConfig.ClientID,
                  DevGuild: newDevGuild,
                  Mods: botMods,
                  Owner: newOwnerId,
                  Prefix: newPrefix,
                  Whitelist: arrWhiteList
              }, { upsert: true } )
              .then( setSuccess => {
                console.log( chalk.bold.greenBright( 'Bot configuration modified in my database.' ) );
                let strBlackList = '**' + ( arrBlackList.length === 0 ? 'No one is blacklisted!' : '[ **<@' + arrBlackList.join( '>**, **<@' ) + '>** ]' ) + '**';
                let strModList = '**' + ( botMods.length === 0 ? 'No bot moderators!' : '[ **<@' + botMods.join( '>**, **<@' ) + '>** ]' ) + '**';
                let strWhiteList =  '**' + ( arrWhiteList.length === 0 ? 'No one is whitelisted!' : '[ **<@' + arrWhiteList.join( '>**, **<@' ) + '>** ]' ) + '**';
                return interaction.editReply( {
                  content: 'New configuration:\n\t' +
                  'Name: `' + newName + '` (:id:`' + botConfig.ClientID + '`)\n\t' +
                  'Owner: <@' + newOwnerId + '>\n\t' +
                  'Command Prefix: `' + newPrefix + '`\n\t' +
                  'Development Guild: `' + botGuilds.get( newDevGuild ).name + '`\n\t' +
                  'Blacklist: ' + strBlackList + '\n\t' +
                  'Whitelist: ' + strWhiteList + '\n\t' +
                  'Moderators: ' + strModList
                } );
              } )
              .catch( async setError => { return interaction.editReply( { content: await errHandler( setError, { command: 'system', modType: 'set', type: 'modifyDB' } ) } ); } );
            }
            break;
        }
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};