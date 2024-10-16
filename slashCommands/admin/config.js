const botConfigDB = require( '../../models/BotConfig.js' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );

module.exports = {
  name: 'config',
  description: 'Configure bot for this server.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  options: [/* get, reset, set //*/
    { type: 1, name: 'get', description: 'Get all settings for the server.' },
    { type: 1, name: 'reset', description: 'Reset all settings for the server to default.' },
    { type: 1, name: 'set', description: 'Set settings for the server.',/*Set options//*/
      options: [/* invite, log-chat, log-default, log-error, welcome, welcome-message, welcome-dm, welcome-channel, welcome-role-give, welcome-role //*/
        { name: 'invite', description: 'Channel to make invites to. Will try to guess if not set.', type: 7 }/*invite channel//*/,
        { name: 'log-chat', description: 'Channel to log chat command (`/edit`, `/react`, `/reply`, and `/say`) requests.', type: 7 }/*chat channel//*/,
        { name: 'log-default', description: 'Channel to log all requests not otherwise specified.', type: 7 }/*default channel//*/,
        { name: 'log-error', description: 'Channel to log errors.', type: 7 }/*error channel//*/,
        { name: 'welcome', description: 'Send a message to welcome new members to the server?', type: 5 }/*welcomer on/off//*/,
        { name: 'welcome-message', description: 'Message to send new members to the server?', type: 3 }/*welcome message//*/,
        { name: 'welcome-dm', description: 'Send the welcome message to DM?  (default: TRUE)', type: 5 }/*welcome dm//*/,
        { name: 'welcome-channel', description: 'Which channel would you like to send the message?', type: 7 }/*welcome channel//*/,
        { name: 'welcome-role-give', description: 'Give new members a role on join?', type: 5 }/*give welcome role//*/,
        { name: 'welcome-role', description: 'Which role, if any, would you like to give new members on join?', type: 8 }/*welcome role//*/
      ]
    }/*Set options//*/ ],
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const strAuthorTag = author.tag;
    const botConfig = await guildConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => {  console.error( 'Unable to find botConfig:\n%o', errFindBot );  } );
    const botUsers = client.users.cache;
    const botGuilds = client.guilds.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = ( Array.from( botConfig.Mods ) || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const objGuildMembers = guild.members.cache;
    const arrAuthorPermissions = ( objGuildMembers.get( author.id ).permissions.toArray() || [] );
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const hasManageGuild = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 ) ? true : false );
    const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 ) ? true : false );

    const myTask = options.getSubcommand();
    
    if ( ( !hasManageRoles && myTask === 'get' ) || ( !hasManageGuild && ( myTask === 'reset' || myTask === 'set' ) ) ) {
      objGuildOwner.send( '<@' + author.id + '> attempted to ' + myTask + ' my configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR`, `MANAGE_GUILD`, or `MANAGE_ROLES` permission, and my bot mods can do that.' );
      return interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + objGuildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
    }
    else {
      const oldConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( err => {
        console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in preforming %s for %s in config.js:\n%s', guild.name, guild.id, myTask, strAuthorTag, err.stack );
        botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in preforming ' + myTask + ' for <@' + author.id + '>.  Please check console for details.' );
      } );
      if ( hasManageRoles && myTask === 'get' ) {
        if ( !oldConfig ) {
          return interaction.editReply( {
            content: 'Guild configuration:\n\t' +
            'Invite channel is not configured for this server\n\t' +
            'Log channels are not configured for this server.\n\t' +
            '\tAll logs will go to the server owner, <@' + objGuildOwner.id + '>\n\t' +
            'On join welcomes are **DISABLED**.'
          } );
        }
        else {
          let showInvite = oldConfig.Invite;
          let showChat = oldConfig.Logs.Chat;
          let showDefault = oldConfig.Logs.Default;
          let showError = oldConfig.Logs.Error;
          let showWelcomeRole = ( oldConfig.Welcome.Role ? 'assigned <@' + oldConfig.Welcome.Role + '> and ' : '' );
          let showWelcomeChan = 'sent to ' + ( '<#' + oldConfig.Welcome.Channel + '>' || 'DM' );
          let showWelcomeMsg = ' with the following message:\n```\n' + oldConfig.Welcome.Msg + '\n```\n';
          let showWelcome = ( oldConfig.Welcome.Active ? '**DISABLED**.' : showWelcomeRole + showWelcomeChan + showWelcomeMsg );
          
          interaction.editReply( {
            content: 'Guild configuration:\n\t' +
            'Invite channel is: <#' + showInvite + '>\n\t' +
            'Default log channel is: <#' + showDefault + '>\n\t' +
            'Error message logs go to: <#' + showError + '>\n\t' +
            'Chat command requests log to: <#' + showChat + '>\n\t' +
            'On join welcomes are ' + showWelcome
          } );
        }
      }
      else if ( hasManageGuild && myTask === 'reset' ) {
        await guildConfigDB.updateOne(
          { Guild: guild.id },
          {
            Guild: guild.id,
            Invite: channel.id,
            Logs: { Chat: channel.id, Default: channel.id, Error: channel.id },
            Welcome: { Active: false, Channel: null, Msg: 'Welcome!', Role: null }
          },
          { upsert: true } )
        .then( resetSuccess => {
          return interaction.editReply( { content: 'Guild reset.' } );
        } )
        .catch( resetError => {
          console.error( 'Encountered an error attempting to reset %s(ID:%s) in my database for %s in config.js:\n%o', guild.name, guild.id, strAuthorTag, resetError );
          botOwner.send( 'Encountered an error attempting to reset `' + guild.name + '`(:id:' + guild.id + ') in my database for <@' + author.id + '>.  Please check console for details.' );
          return interaction.editReply( { content: 'Error resetting guild.' } );
        } );
      }
      else if ( hasManageGuild && myTask === 'set' ) {
        const setInvite = ( options.getChannel( 'invite' ) ? options.getChannel( 'invite' ).id : null );
        const setChat = ( options.getChannel( 'log-chat' ) ? options.getChannel( 'log-chat' ).id : null );
        const setDefault = ( options.getChannel( 'log-default' ) ? options.getChannel( 'log-default' ).id : null );
        const setError = ( options.getChannel( 'log-error' ) ? options.getChannel( 'log-error' ).id : null );
        const boolWelcome = ( options.getBoolean( 'welcome' ) ? options.getBoolean( 'welcome' ) : false );
        const strWelcome = ( options.getString( 'welcome-message' ) ? options.getString( 'welcome-message' ) : null );
        const setWelcome = ( options.getChannel( 'welcome-channel' ) ? options.getChannel( 'welcome-channel' ).id : null );
        const sendDM = ( options.getBoolean( 'welcome-dm' ) ? options.getBoolean( 'welcome-dm' ) : ( setWelcome ? false : true ) );
        const joinWelcome = ( options.getRole( 'welcome-role' ) ? options.getRole( 'welcome-role' ).id : null );
        const giveRole = ( options.getBoolean( 'welcome-role-give' ) ? options.getBoolean( 'welcome-role-give' ) : ( joinWelcome ? true : false ) );
        
        
        if ( !oldConfig ) {
          if ( !setInvite ) { setInvite = channel.id; }
          if ( !setDefault ) { setDefault = channel.id; }
          if ( !setChat ) { setChat = setDefault; }
          if ( !setError ) { setError = setDefault; }
          await guildConfigDB.create( {
            Guild: interaction.guild.id,
            Invite: setInvite,
            Logs: { Default: setDefault, Error: setError, Chat: setChat },
            Welcome: { Active: boolWelcome, Message: strWelcome }
          } )
          .then( createSuccess => { interaction.editReply( { content: 'Guild configuration set.' } ); } )
          .catch( setError => {
            interaction.editReply( { content: 'Error setting guild configuration.' } );
            console.error( 'Encountered an error attempting to create %s(ID:%s) guild configuration in my database for %s in config.js:\n%o', guild.name, guild.id, strAuthorTag, setError );
            botOwner.send( 'Encountered an error attempting to create `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database for <@' + author.id + '>.  Please check console for details.' );
          } );
        }
        else {
          let oldInvite = oldConfig.Invite;
          let oldDefault = oldConfig.Logs.Default;
          let oldError = oldConfig.Logs.Error;
          let oldChat = oldConfig.Logs.Chat;
          let oldWelcome = oldConfig.Welcome.Active;
          let oldWelcomeMsg = oldConfig.Welcome.Message;
          await guildConfigDB.updateOne( { Guild: guild.id }, {
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
          } )
          .then( updateSuccess => {
            interaction.editReply( {
              content: 'Guild configuration updated:\n\t' +
              'Invite channel is: <#' + ( setInvite || oldInvite ) + '>\n\t' +
              'Default log channel is: <#' + ( setDefault || oldDefault ) + '>\n\t' +
              'Error message logs go to: <#' + ( setError || oldError ) + '>\n\t' +
              'Chat command requests log to: <#' + ( setChat || oldChat ) + '>\n\t' +
              'On join welcomes are ' + ( !( boolWelcome || oldWelcome ) ? '**DISABLED**.' : '**ENABLED** and the message is set to:\n```\n' + ( strWelcome || oldWelcomeMsg ) + '\n```\n' )
            } );
          } )
          .catch( setError => {
            interaction.editReply( { content: 'Error setting guild configuration.' } );
            console.error( 'Encountered an error attempting to update %s(ID:%s) guild configuration in my database for %s in config.js:\n%o', guild.name, guild.id, strAuthorTag, setError );
            botOwner.send( 'Encountered an error attempting to update `' + guild.name + '`(:id:' + guild.id + ') guild configuration in my database for <@' + author.id + '>.  Please check console for details.' );
          } );
        }
      }
    }
  }
};