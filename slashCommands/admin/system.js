const thisBotName = process.env.BOT_USERNAME;
const botOwnerID = process.env.OWNER_ID;
const botConfig = require( '../../models/BotConfig.js' );
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
      { type: 6, name: 'add-moderator', description: 'User to add.' }
    ] }/* add //*/,
    { type: 1, name: 'get', description: 'Get my current configuration.' },
    { type: 1, name: 'remove', description: 'Remove a user from my moderator list.', options: [
      { type: 6, name: 'remove-moderator', description: 'User to remove.' }
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
    const oldConfig = await botConfig.findOne( { BotName: thisBotName } )
    .catch( errFindBot => {  console.error( 'Unable to find oldConfig:\n%o', errFindBot );  } );
    const botOwner = client.users.cache.get( botOwnerID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = ( oldConfig.Mods || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const myTask = options.getSubcommand();

    if ( !isBotMod ) { return interaction.editReply( { content: 'You are not the boss of me...' } ); }
    else if ( isBotMod && myTask === 'get' ) {
      let strModList = ( oldConfig.Mods.length === 0 ? '`None`' : '\n\t\t`[`\n\t\t<@' + oldConfig.Mods.join( '>`,`\n\t\t\t<@' ) + '>\n\t\t`]`' );
      return interaction.editReply( {
        content: 'My configuration:\n\t' +
        'Name: `' + oldConfig.BotName + '` (:id:`' + oldConfig.ClientID + '`)\n\t' +
        'Owner: <@' + oldConfig.Owner + '>\n\t' +
        'Command Prefix: `' + oldConfig.Prefix + '`\n\t' +
        'Development Guild: `' + client.guilds.cache.get( oldConfig.DevGuild ).name + '`\n\t' +
        'Moderators: ' + strModList
      } );
    }
    else if ( isBotMod && !isBotOwner ) { return interaction.editReply( { content: 'You may only get my configuration.  Please try again.' } ); }
    else if ( isBotOwner ) {
      switch ( myTask ) {
        case 'add':
          let addMod = options.getUser( 'add-moderator' ).id;
          if ( oldConfig.Mods.indexOf( addMod ) != -1 ) { return interaction.editReply( { content: '<@' + addMod + '> is already a moderator of me!' } ) }
          else {
            await botConfig.updateOne( { BotName: thisBotName }, {
              BotName: oldConfig.BotName,
              ClientID: oldConfig.ClientID,
              Owner: oldConfig.Owner,
              Prefix: oldConfig.Prefix,
              Mods: oldConfig.Mods.push( addMod ),
              DevGuild: oldConfig.DevGuild
            }, { upsert: true } )
            .then( initSuccess => {
              console.log( chalk.bold.greenBright( 'Added moderator to database.' ) );
              return interaction.editReply( { content: 'Added moderator, <@' + addMod + '>, to database.' } );
            } )
            .catch( initError => {
              console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to add moderator to database:\n${initError}` ) );
              return interaction.editReply( { content: 'Encountered an error attempting to add moderator, <@' + addMod + '>, to database. Please check the console.' } );
            } );
          }
          break;
        case 'remove':
          let remMod = options.getUser( 'remove-moderator' ).id;
          if ( oldConfig.Mods.indexOf( remMod ) === -1 ) { return interaction.editReply( { content: '<@' + addMod + '> wasn\'t a moderator of me!' } ) }
          else {
            await botConfig.updateOne( { BotName: thisBotName }, {
              BotName: oldConfig.BotName,
              ClientID: oldConfig.ClientID,
              Owner: oldConfig.Owner,
              Prefix: oldConfig.Prefix,
              Mods: oldConfig.Mods.splice( oldConfig.Mods.indexOf( remMod ), 1 ),
              DevGuild: oldConfig.DevGuild
            }, { upsert: true } )
            .then( initSuccess => {
              console.log( chalk.bold.greenBright( 'Removed moderator from database.' ) );
              return interaction.editReply( { content: 'Removed moderator, <@' + remMod + '>, from database.' } );
            } )
            .catch( initError => {
              console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to remove moderator from database:\n${initError}` ) );
              return interaction.editReply( { content: 'Encountered an error attempting to remove moderator, <@' + remMod + '>, from database. Please check the console.' } );
            } );
          }
          break;
        case 'reset':
          await botConfig.updateOne( { BotName: thisBotName }, {
            BotName: thisBotName,
            ClientID: ( config.clientID || process.env.CLIENT_ID || client.id ),
            Owner: botOwnerID,
            Prefix: ( config.prefix || '!' ),
            Mods: ( config.moderatorIds || [] ),
            DevGuild: ( config.devGuildId || '' )
          }, { upsert: true } )
          .then( initSuccess => {
            console.log( chalk.bold.greenBright( 'Bot configuration reset in my database.' ) );
            return interaction.editReply( { content: 'Bot configuration reset in my database.' } );
          } )
          .catch( initError => {
            console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to reset bot configuration in my database:\n${initError}` ) );
            return interaction.editReply( { content: 'Encountered an error attempting to reset bot configuration in my database. Please check the console.' } );
          } );
          break;
        case 'set':
          let newName = ( options.getString( 'name' ) || oldConfig.BotName );
          let newOwner = ( options.getUser( 'owner' ) || oldConfig.Owner );
          let newPrefix = ( options.getString( 'prefix' ) || oldConfig.Prefix );
          let newDevGuild = ( options.getString( 'dev-guild' ) || oldConfig.DevGuild );
          await botConfig.updateOne( { BotName: thisBotName }, {
              BotName: newName,
              ClientID: oldConfig.ClientID,
              Owner: newOwner,
              Prefix: newPrefix,
              Mods: ( oldConfig.Mods || [] ),
              DevGuild: newDevGuild
          }, { upsert: true } )
          .then( initSuccess => {
            console.log( chalk.bold.greenBright( 'Bot configuration modified in my database.' ) );
            return interaction.editReply( { content: 'Bot configuration modified in my database.' } );
          } )
          .catch( initError => {
            console.error( chalk.bold.red.bgYellowBright( `Encountered an error attempting to modify bot configuration in my database:\n${initError}` ) );
            return interaction.editReply( { content: 'Encountered an error attempting to modify bot configuration in my database. Please check the console.' } );
          } );
          break;
      }
    }
  }
};