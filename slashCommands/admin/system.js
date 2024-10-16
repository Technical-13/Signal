const thisBotName = process.env.BOT_USERNAME;
const botOwnerID = process.env.OWNER_ID;
const botConfigDB = require( '../../models/BotConfig.js' );
const config = require( '../../config.json' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );

module.exports = {
  name: 'system',
  description: 'Change bot configs.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  modCmd: true,
  options: [/* add, get, remove, reset, set //*/
    { type: 1, name: 'add', description: 'Add a user to my moderator list', options: [
      { type: 6, name: 'moderator', description: 'User to add.', required: true }
    ] }/* add //*/,
    { type: 1, name: 'get', description: 'Get my current configuration.', options: [
      { type: 5, name: 'share', description: 'Share result to current channel instead of making it ephemeral.' }
    ] },
    { type: 1, name: 'remove', description: 'Remove a user from my moderator list.', options: [
      { type: 6, name: 'moderator', description: 'User to remove.', required: true }
    ] }/* remove //*/,
    { type: 1, name: 'reset', description: 'Watch me rise from the ashes like a phoenix.' },
    { type: 1, name: 'set', description: 'Set settings for the bot.', options: [
      { type: 3, name: 'name', description: 'What\'s my name!?' },
      { type: 3, name: 'prefix', description: 'What character do I look for!?' },
      { type: 6, name: 'owner', description: 'Who is my master!?' },
      { type: 3, name: 'dev-guild', description: 'Where am I from!?' }
    ] }/* set //*/
  ]/* add, get, remove, reset, set //*/,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const strAuthorTag = author.tag;
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => {  console.error( 'Unable to find botConfig:\n%o', errFindBot );  } );
    const botUsers = client.users.cache;
    const botGuilds = client.guilds.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = ( Array.from( botConfig.Mods ) || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const myTask = options.getSubcommand();

    if ( !isBotMod ) { return interaction.editReply( { content: 'You are not the boss of me...' } ); }
    else if ( isBotMod && myTask === 'get' ) {
      let strModList = ( botMods.length === 0 ? '`None`' : '\n\t\t`[`\n\t\t\t<@' + botMods.join( '>`,`\n\t\t\t<@' ) + '>\n\t\t`]`' );
      const showConfigs = 'My configuration:\n\t' +
        'Name: `' + botConfig.BotName + '` (:id:`' + botConfig.ClientID + '`)\n\t' +
        'Owner: <@' + botConfig.Owner + '>\n\t' +
        'Command Prefix: `' + botConfig.Prefix + '`\n\t' +
        'Development Guild: `' + botGuilds.get( botConfig.DevGuild ).name + '`\n\t' +
        'Moderators: ' + strModList;
      if ( !options.getBoolean( 'share' ) ) {
        return interaction.editReply( { content: showConfigs } );
      } else {
        channel.send( showConfigs )
        .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
        .catch( errSend => { return interaction.editReply( { content: 'Error sharing the settings in the channel.' } ); } );        
      }
    }
    else if ( isBotMod && !isBotOwner ) { return interaction.editReply( { content: 'You may only get my configuration.  Please try again.' } ); }
    else if ( isBotOwner ) {
      switch ( myTask ) {
        case 'add':
          let addMod = options.getUser( 'moderator' ).id;
          if ( botMods.indexOf( addMod ) != -1 ) { return interaction.editReply( { content: '<@' + addMod + '> is already a moderator of me!' } ) }
          else {
            botMods.push( addMod );
            await botConfigDB.updateOne( { BotName: thisBotName }, {
              BotName: botConfig.BotName,
              ClientID: botConfig.ClientID,
              Owner: botConfig.Owner,
              Prefix: botConfig.Prefix,
              Mods: botMods,
              DevGuild: botConfig.DevGuild
            }, { upsert: true } )
            .then( addSuccess => {
              console.log( chalk.bold.greenBright( `Added moderator, ${addMod} (${botUsers.get( addMod ).displayName}), to database.` ) );
              return interaction.editReply( { content: 'Added moderator, <@' + addMod + '>, to database.' } );
            } )
            .catch( addError => {
              console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to add moderator to database:\n${addError}` ) );
              return interaction.editReply( { content: 'Encountered an error attempting to add moderator, <@' + addMod + '>, to database. Please check the console.' } );
            } );
          }
          break;
        case 'remove':
          let remMod = options.getUser( 'moderator' ).id;
          if ( botMods.indexOf( remMod ) === -1 ) { return interaction.editReply( { content: '<@' + remMod + '> wasn\'t a moderator of me!' } ) }
          else {
            botMods.splice( botMods.indexOf( remMod ), 1 );
            await botConfigDB.updateOne( { BotName: thisBotName }, {
              BotName: botConfig.BotName,
              ClientID: botConfig.ClientID,
              Owner: botConfig.Owner,
              Prefix: botConfig.Prefix,
              Mods: botMods,
              DevGuild: botConfig.DevGuild
            }, { upsert: true } )
            .then( remSuccess => {
              console.log( chalk.bold.greenBright( `Removed moderator, ${remMod} (${botUsers.get( remMod ).displayName}), from database.` ) );
              return interaction.editReply( { content: 'Removed moderator, <@' + remMod + '>, from database.' } );
            } )
            .catch( remError => {
              console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to remove moderator from database:\n${remError}` ) );
              return interaction.editReply( { content: 'Encountered an error attempting to remove moderator, <@' + remMod + '>, from database. Please check the console.' } );
            } );
          }
          break;
        case 'reset':
          await botConfigDB.updateOne( { BotName: thisBotName }, {
            BotName: thisBotName,
            ClientID: ( config.clientID || process.env.CLIENT_ID || client.id ),
            Owner: botOwnerID,
            Prefix: ( config.prefix || '!' ),
            Mods: ( config.moderatorIds || [] ),
            DevGuild: ( config.devGuildId || '' )
          }, { upsert: true } )
          .then( resetSuccess => {
            console.log( chalk.bold.greenBright( 'Bot configuration reset in my database.' ) );
            return interaction.editReply( { content: 'Bot configuration reset in my database.' } );
          } )
          .catch( resetError => {
            console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to reset bot configuration in my database:\n${resetError}` ) );
            return interaction.editReply( { content: 'Encountered an error attempting to reset bot configuration in my database. Please check the console.' } );
          } );
          break;
        case 'set':
          let newName = ( options.getString( 'name' ) || botConfig.BotName || config.botName );
          let newOwner = options.getUser( 'owner' );
          let newOwnerId = ( newOwner ? newOwner.id : ( botConfig.Owner || config.botOwnerId || botOwnerID ) );
          let newPrefix = ( options.getString( 'prefix' ) || botConfig.Prefix || config.prefix );
          let newDevGuild = ( options.getString( 'dev-guild' ) || botConfig.DevGuild || config.devGuildId );
          await botConfigDB.updateOne( { BotName: thisBotName }, {
              BotName: newName,
              ClientID: botConfig.ClientID,
              Owner: newOwnerId,
              Prefix: newPrefix,
              Mods: botMods,
              DevGuild: newDevGuild
          }, { upsert: true } )
          .then( setSuccess => {
            console.log( chalk.bold.greenBright( 'Bot configuration modified in my database.' ) );
            let strModList = ( botMods.length === 0 ? '`None`' : '\n\t\t`[`\n\t\t<@' + botMods.join( '>`,`\n\t\t\t<@' ) + '>\n\t\t`]`' );
            return interaction.editReply( {
              content: 'New configuration:\n\t' +
              'Name: `' + newName + '` (:id:`' + botConfig.ClientID + '`)\n\t' +
              'Owner: <@' + newOwnerId + '>\n\t' +
              'Command Prefix: `' + newPrefix + '`\n\t' +
              'Development Guild: `' + botGuilds.get( newDevGuild ).name + '`\n\t' +
              'Moderators: ' + strModList
            } );
          } )
          .catch( setError => {
            console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to modify bot configuration in my database:\n${setError}` ) );
            return interaction.editReply( { content: 'Encountered an error attempting to modify bot configuration in my database. Please check the console.' } );
          } );
          break;
      }
    }
  }
};