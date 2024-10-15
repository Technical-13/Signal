const logSchema = require( '../../models/GuildLogs.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );

module.exports = {
  name: 'config',  
  description: 'Configure bot for this server.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  options: [
    { type: 1, name: 'get', description: 'Get all settings for the server.' },
    { type: 1, name: 'reset', description: 'Reset all settings for the server to default.' },
    { type: 1, name: 'set', description: 'Set settings for the server.',
     options: [
       { name: 'invite', description: 'Channel to make invites to. Will try to guess if not set.', type: 7 }/*invite channel//*/,
       { name: 'log-default', description: 'Channel to log all requests not otherwise specified.', type: 7 }/*default channel//*/,
       { name: 'log-error', description: 'Channel to log errors.', type: 7 }/*error channel//*/,
       { name: 'log-chat', description: 'Channel to log chat command (`/edit`, `/react`, `/reply`, and `/say`) requests.', type: 7 }/*chat channel//*/,
       { name: 'welcome', description: 'Send a DM to welcome new members to the server?', type: 5 }/*welcomer on/off//*/,
       { name: 'welcome-message', description: 'Message to DM new members to the server?', type: 3 }/*welcome message//*/
     ]
    }/*Set channels//*/
  ],
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const strAuthorTag = author.tag;
console.log('strAuthorTag: %s', strAuthorTag);
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
console.log('\tisBotOwner:%o',isBotOwner);
    const botMods = [];
console.log('\tbotMods.indexOf( author.id ):%o',botMods.indexOf( author.id ));
console.log('\tbotMods.indexOf( author.id ) != -1:%o',botMods.indexOf( author.id ) != -1);
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
console.log('\tisBotMod:%o',isBotMod);
    const arrAuthorPermissions = ( guild.members.cache.get( author.id ).permissions.toArray() || [] );
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const hasManageGuild = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 ) ? true : false );
    const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 ) ? true : false );

    const myTask = interaction.options.getSubcommand();
    var setInvite, setDefault, setError, setChat, boolWelcome, strWelcome;
    if ( myTask === 'reset' &&  hasManageGuild ) {
      await logSchema.updateOne(
        { Guild: guild.id },
        {
          Guild: guild.id,
          Invite: channel.id,
          Logs: { Default: channel.id, Error: channel.id, Chat: channel.id },
          Welcome: { Active: false, Message: 'Welcome!' }
        },
        { upsert: true } ).then( resetSuccess => {
        interaction.editReply( { content: 'Guild reset.' } );
      } ).catch( resetError => {
        interaction.editReply( { content: 'Error resetting guild.' } );
        console.error( 'Error attempting to reset guild for %s:\n%o', guild.name, resetError );
      } );
      return;
    } else if ( myTask === 'reset' ) {
      objGuildOwner.send( '<@' + author.id + '> attempted to reset my configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR` or `MANAGE_GUILD` permission, and my bot mods can do that.' );
      interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + objGuildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
      return;
    } else if ( myTask === 'set' ) {
      setInvite = options.getChannel( 'invite' ) ? options.getChannel( 'invite' ).id : null;
      setDefault = options.getChannel( 'log-default' ) ? options.getChannel( 'log-default' ).id : null;
      setError = options.getChannel( 'log-error' ) ? options.getChannel( 'log-error' ).id : null;
      setChat = options.getChannel( 'log-hat' ) ? options.getChannel( 'log-chat' ).id : null;
      boolWelcome = options.getBoolean( 'welcome' ) ? options.getBoolean( 'welcome' ) : null;
      strWelcome = options.getString( 'welcome-message' ) ? options.getString( 'welcome-message' )  : null;
    }

    logSchema.findOne( { Guild: interaction.guild.id } ).then( async data => {
      if ( myTask === 'set' && hasManageGuild ) {
        if ( !data ) {
          if ( !setInvite ) { setInvite = channel.id; }
          if ( !setDefault ) { setDefault = channel.id; }
          if ( !setError ) { setError = setDefault; }
          if ( !setChat ) { setChat = setDefault; }          
          await logSchema.create( {
            Guild: interaction.guild.id,
            Invite: setInvite,
            Logs: { Default: setDefault, Error: setError, Chat: setChat },
            Welcome: { Active: boolWelcome, Message: strWelcome }
          } ).then( setSuccess => {
            interaction.editReply( { content: 'Guild configuration set.' } );
          } ).catch( setError => {
            interaction.editReply( { content: 'Error setting guild configuration.' } );
            console.error( 'Error attempting to set guild configuration for %s:\n%o', guild.name, setError );
          } );
        } else {
          let oldInvite = data.Invite;
          let oldDefault = data.Logs.Default;
          let oldError = data.Logs.Error;
          let oldChat = data.Logs.Chat;
          let oldWelcome = data.Welcome.Active;
          let oldWelcomeMsg = data.Welcome.Message;
          await logSchema.updateOne( { Guild: guild.id }, {
            Guild: guild.id,
            Invite: setInvite || oldInvite,
            Logs: {
              Default: setDefault || oldDefault,
              Error: setError || oldError,
              Chat: setChat || oldChat
            },
            Welcome: {
              Active: boolWelcome || oldWelcome,
              Message: strWelcome || oldWelcomeMsg
            }
          } );
          interaction.editReply( {
            content: 'Guild configuration updated:\n\t' +
            'Invite channel is: <#' + ( setInvite || oldInvite ) + '>\n\t' +
            'Default log channel is: <#' + ( setDefault || oldDefault ) + '>\n\t' +
            'Error message logs go to: <#' + ( setError || oldError ) + '>\n\t' +
            'Chat command requests log to: <#' + ( setChat || oldChat ) + '>\n\t' +
            'On join welcomes are ' + ( !( boolWelcome || oldWelcome ) ? '**DISABLED**.' : '**ENABLED** and the message is set to:\n```\n' + ( strWelcome || oldWelcomeMsg ) + '\n```\n' ) } );
        }
      } else if ( myTask === 'get' && hasManageRoles ) {
        if ( !data ) {
          interaction.editReply( {
            content: 'Guild configuration:\n\t' +
            'Invite channel is not configured for this server\n\t' +
            'Log channels are not configured for this server.\n\t' +
            'All logs will go to the server owner, <@' + objGuildOwner.id + '>\n\t' +
            'On join welcomes are **DISABLED**.'
          } );
        } else {
          let oldInvite = data.Invite;
          let oldDefault = data.Logs.Default;
          let oldError = data.Logs.Error;
          let oldChat = data.Logs.Chat;
          let oldWelcome = data.Welcome.Active;
          let oldWelcomeMsg = data.Welcome.Message;
          interaction.editReply( {
            content: 'Guild configuration:\n\t' +
            'Invite channel is: <#' + ( setInvite || oldInvite ) + '>\n\t' +
            'Default log channel is: <#' + ( setDefault || oldDefault ) + '>\n\t' +
            'Error message logs go to: <#' + ( setError || oldError ) + '>\n\t' +
            'Chat command requests log to: <#' + ( setChat || oldChat ) + '>\n\t' +
            'On join welcomes are ' + ( !( boolWelcome || oldWelcome ) ? '**DISABLED**.' : '**ENABLED** and the message is set to:\n```\n' + ( strWelcome || oldWelcomeMsg ) + '\n```\n' )
          } );
        }
      } else {
        objGuildOwner.send( '<@' + author.id + '> attempted to modify my configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR` or `MANAGE_GUILD` permission, and my bot mods can do that.' );
        interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + objGuildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
      }
    } ).catch( err => {
      console.error( 'Encountered an error running config.js from %s(ID:%s):\n%s', guild.name, guild.id, err.stack );
      botOwner.send( 'Encountered an error running config.js from `' + guild.name + '`<#' + channel.id + '>.  Please check console for details.' );
    } );
  }
};
