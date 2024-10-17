const thisBotName = process.env.BOT_USERNAME;
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
    { type: 1, name: 'add', description: 'Add a user to the guild blacklist or whitelist.', options: [
      { type: 6, name: 'blacklist', description: 'User to block from using all commands.' },
      { type: 6, name: 'whitelist', description: 'User to permit to use all commands.' }
    ] }/* add //*/,
    { type: 1, name: 'get', description: 'Get all settings for the server.', options: [
      { type: 5, name: 'share', description: 'Share result to current channel instead of making it ephemeral.' }
    ] },
    { type: 1, name: 'remove', description: 'Remove a user from the guild blacklist or whitelist.', options: [
      { type: 6, name: 'blacklist', description: 'User to remove from blacklist.' },
      { type: 6, name: 'whitelist', description: 'User to remove from whitelist.' }
    ] }/* add //*/,
    { type: 1, name: 'reset', description: 'Reset all settings for the server to default.' },
    { type: 1, name: 'set', description: 'Set settings for the server.',/*Set options//*/
      options: [/* invite, log-chat, log-default, log-error, welcome, welcome-message, welcome-dm, welcome-channel, welcome-role-give, welcome-role //*/
        { type: 7, name: 'invite', description: 'Channel to make invites to. Will try to guess if not set.' }/*invite channel//*/,
        { type: 7, name: 'log-chat', description: 'Channel to log chat command (`/edit`, `/react`, `/reply`, and `/say`) requests.' }/*chat channel//*/,
        { type: 7, name: 'log-default', description: 'Channel to log all requests not otherwise specified.' }/*default channel//*/,
        { type: 7, name: 'log-error', description: 'Channel to log errors.' }/*error channel//*/,
        { type: 3, name: 'prefix', description: 'Guild specific prefix for bot commands' }/*guild prefix//*/,
        { type: 5, name: 'welcome', description: 'Send a message to welcome new members to the server?' }/*welcomer on/off//*/,
        { type: 3, name: 'welcome-message', description: 'Message to send new members to the server?' }/*welcome message//*/,
        { type: 5, name: 'welcome-dm', description: 'Send the welcome message to DM?  (default: TRUE)' }/*welcome dm//*/,
        { type: 7, name: 'welcome-channel', description: 'Which channel would you like to send the message?' }/*welcome channel//*/,
        { type: 5, name: 'welcome-role-give', description: 'Give new members a role on join?' }/*give welcome role//*/,
        { type: 8, name: 'welcome-role', description: 'Which role, if any, would you like to give new members on join?' }/*welcome role//*/
      ]
    }/*Set options//*/ ],
  run: async ( client, interaction ) => {
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const strAuthorTag = author.tag;
    await interaction.deferReply( { ephemeral: true } );
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => {  console.error( 'Unable to find botConfig:\n%o', errFindBot ); } );
    const botUsers = client.users.cache;
    const botOwner = botUsers.get( botConfig.Owner );
    const arrBlacklist = ( botConfig.Blacklist || [] );
    if ( arrBlacklist.indexOf( author.id ) != -1 ) {
      botOwner.send( 'Blacklisted user, <@' + author.id + '>, attempted to use `/config` in https://discord.com/channels/' + guild.id + '/' + channel.id );
      return interaction.editReply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands!  Please contact <@' + botConfig.Owner + '> to resolve the situation.' } );
    }
    
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = ( botConfig.Mods || [] );
    const isBotMod = ( ( isBotOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    const oldConfig = await guildConfigDB.findOne( { Guild: guild.id } ).catch( err => {
      console.error( 'Encountered an error attempting to find %s(ID:%s) in my database in preforming %s for %s in config.js:\n%s', guild.name, guild.id, myTask, strAuthorTag, err.stack );
      botOwner.send( 'Encountered an error attempting to find `' + guild.name + '`(:id:' + guild.id + ') in my database in preforming ' + myTask + ' for <@' + author.id + '>.  Please check console for details.' );
    } );
    const arrBlackGuild = ( oldConfig.Blacklist || [] );
    if ( !isBotMod && arrBlackGuild.indexOf( author.id ) != -1 ) {
      objGuildOwner.send( 'Blacklisted user, <@' + author.id + '>, attempted to use `/config` in https://discord.com/channels/' + guild.id + '/' + channel.id );
      return interaction.editReply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands!  Please contact <@' + guild.ownerId + '> to resolve the situation.' } );
    } else if ( arrBlackGuild.indexOf( author.id ) != -1 ) {
      author.send( 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '/' + channel.id + '! Use `/config remove` to remove yourself from the blacklist.' );
    }
    
    const arrWhiteGuild = ( oldConfig.Whitelist || [] );
    const isWhiteListed = ( arrWhiteGuild.indexOf( author.id ) != -1 ? true : false );
    const botGuilds = client.guilds.cache;
    const arrAuthorPermissions = ( objGuildMembers.get( author.id ).permissions.toArray() || [] );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const hasManageGuild = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 || isWhiteListed ) ? true : false );
    const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 || isWhiteListed ) ? true : false );

    const myTask = options.getSubcommand();
    
    if ( ( !hasAdministrator && ( myTask === 'add' || myTask === 'remove' ) ) || ( !hasManageGuild && ( myTask === 'reset' || myTask === 'set' ) ) || ( !hasManageRoles && myTask === 'get' ) ) {
      objGuildOwner.send( '<@' + author.id + '> attempted to ' + myTask + ' my configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR`, `MANAGE_GUILD`, or `MANAGE_ROLES` permission, and my bot mods can do that.' );
      return interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + objGuildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
    }
    else {
      if ( hasAdministrator && myTask === 'add' ) {
        let addBlack = options.getUser( 'blacklist' ).id;
        let addWhite = options.getUser( 'whitelist' ).id;
        if ( addBlack ) {
          if ( arrBlackGuild.indexOf( addBlack ) != -1 ) { return interaction.editReply( { content: '<@' + addBlack + '> is already on the blacklist!' } ) }
          else {
            arrBlackGuild.push( addBlack );
            if ( arrWhiteGuild.indexOf( addBlack ) != -1 ) { arrWhiteGuild.splice( arrWhiteGuild.indexOf( addBlack ), 1 ); }
          }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Msg: oldConfig.Welcome.Msg
            }
          }, { upsert: true } )
          .then( addSuccess => {
            return interaction.editReply( { content: 'Blacklisted <@' + addBlack + '> in the database.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to add %s (%s) to the blacklisted for %s: %o', addBlack, client.users.cache.get( addBlack ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to blacklisted <@' + addBlack + '> with `/config add` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => { return interaction.editReply( { content: 'Error attempting to blacklisted <@' + addBlack + '>! My owner has been notified.' } ); } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return interaction.editReply( { content: 'Error attempting to blacklisted <@' + addBlack + '>!' } );
            } );
          } );
        }
        if ( addWhite ) {
          if ( arrWhiteGuild.indexOf( addWhite ) != -1 ) { return interaction.editReply( { content: '<@' + addWhite + '> is already on the whitelist!' } ) }
          else {
            arrWhiteGuild.push( addWhite );
            if ( arrBlackGuild.indexOf( addWhite ) != -1 ) { arrBlackGuild.splice( arrBlackGuild.indexOf( addWhite ), 1 ); }
          }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Msg: oldConfig.Welcome.Msg
            }
          }, { upsert: true } )
          .then( addSuccess => {
            return interaction.editReply( { content: 'Whitelisted <@' + addWhite + '> in the database.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to add %s (%s) to the whitelist for %s: %o', addWhite, client.users.cache.get( addWhite ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to whitelist <@' + addWhite + '> with `/config add` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => { return interaction.editReply( { content: 'Error attempting to whitelist <@' + addWhite + '>! My owner has been notified.' } ); } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return interaction.editReply( { content: 'Error attempting to whitelist <@' + addWhite + '>!' } );
            } );
          } );
        }
      }
      else if ( hasAdministrator && myTask === 'remove' ) {
        let remBlack = options.getUser( 'blacklist' ).id;
        let remWhite = options.getUser( 'whitelist' ).id;
        if ( remBlack ) {
          if ( arrBlackGuild.indexOf( remBlack ) != -1 ) { return interaction.editReply( { content: '<@' + remBlack + '> wasn\'t on the blacklist!' } ) }
          else { arrBlackGuild.splice( arrBlackGuild.indexOf( remBlack ), 1 ); }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Msg: oldConfig.Welcome.Msg
            }
          }, { upsert: true } )
          .then( addSuccess => {
            return interaction.editReply( { content: 'De-blacklisted <@' + remBlack + '> from the database.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to de-blacklist %s (%s) from %s: %o', remBlack, client.users.cache.get( remBlack ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to de-blacklist <@' + remBlack + '> with `/config remove` from https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => { return interaction.editReply( { content: 'Error attempting to blacklisted <@' + remBlack + '>! My owner has been notified.' } ); } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return interaction.editReply( { content: 'Error attempting to blacklisted <@' + remBlack + '>!' } );
            } );
          } );
        }
        if ( remWhite ) {
          if ( arrWhiteGuild.indexOf( remWhite ) != -1 ) { return interaction.editReply( { content: '<@' + remWhite + '> wasn\'t on the whitelist!' } ) }
          else { arrWhiteGuild.splice( arrWhiteGuild.indexOf( remWhite ), 1 ); }
          await guildConfigDB.updateOne( { Guild: oldConfig.Guild }, {
            Guild: oldConfig.Guild,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: oldConfig.Invite,
            Logs: {
              Default: oldConfig.Logs.Default,
              Error: oldConfig.Logs.Error,
              Chat: oldConfig.Logs.Chat
            },
            Prefix: oldConfig.Prefix,
            Welcome: {
              Active: oldConfig.Welcome.Active,
              Msg: oldConfig.Welcome.Msg
            }
          }, { upsert: true } )
          .then( addSuccess => {
            return interaction.editReply( { content: 'De-whitelisted <@' + remWhite + '> from the database.' } );
          } )
          .catch( addError => {
            console.error( 'Error attempting to de-whitelist %s (%s) from %s: %o', remWhite, client.users.cache.get( remWhite ).displayName, guild.name, addError );
            botOwner.send( 'Error attempting to de-whitelist <@' + remWhite + '> with `/config remove` in https://discord.com/channels/' + guild.id + '/' + channel.id + '.  Please check the console.' )
            .then( sentOwner => { return interaction.editReply( { content: 'Error attempting to de-whitelist <@' + remWhite + '>! My owner has been notified.' } ); } )
            .catch( errSend => {
              console.error( 'Error attempting to DM you about above error: %o', errSend );
              return interaction.editReply( { content: 'Error attempting to de-whitelist <@' + remWhite + '>!' } );
            } );
          } );
        }
      }
      else if ( hasManageRoles && myTask === 'get' ) {
        if ( !oldConfig ) {
          const showConfigs = 'Guild configuration:\n\t' +
            'Invite channel is not configured for this server\n\t' +
            'Log channels are not configured for this server.\n\t' +
            '\tAll logs will go to the server owner, <@' + objGuildOwner.id + '>\n\t' +
            'Global prefix being used.\n\t' +
            'No members are blacklisted or whitelisted.\n\t' +
            'On join welcomes are **DISABLED**.';            
          if ( !options.getBoolean( 'share' ) ) {
            return interaction.editReply( { content: showConfigs } );
          } else {
            channel.send( { body: showConfigs } )
            .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
            .catch( errSend => { return interaction.editReply( { content: 'Error sharing the settings in the channel.' } ); } );        
          }
        }
        else {
          let showInvite = oldConfig.Invite;
          let showChat = oldConfig.Logs.Chat;
          let showDefault = oldConfig.Logs.Default;
          let showError = oldConfig.Logs.Error;
          let showPrefix = ( oldConfig.Prefix || botConfig.Prefix );
          let showWelcomeRole = ( oldConfig.Welcome.Role ? 'assigned <@' + oldConfig.Welcome.Role + '> and ' : '' );
          let showWelcomeChan = 'sent to ' + ( '<#' + oldConfig.Welcome.Channel + '>' || 'DM' );
          let showWelcomeMsg = ' with the following message:\n```\n' + oldConfig.Welcome.Msg + '\n```\n';
          let showWelcome = ( oldConfig.Welcome.Active ? showWelcomeRole + showWelcomeChan + showWelcomeMsg : '**DISABLED**.' );
          //blacklist
          //whitelist
          
          const showConfigs = 'Guild configuration:\n\t' +
            'Invite channel is: <#' + showInvite + '>\n\t' +
            'Default log channel is: <#' + showDefault + '>\n\t' +
            'Error message logs go to: <#' + showError + '>\n\t' +
            'Chat command requests log to: <#' + showChat + '>\n\t' +
            'Command prefix is set to: `' + showPrefix + '`\n\t' +
            'On join welcomes are ' + showWelcome;            
          if ( !options.getBoolean( 'share' ) ) {
            return interaction.editReply( { content: showConfigs } );
          } else {
            channel.send( showConfigs )
            .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
            .catch( errSend => { return interaction.editReply( { content: 'Error sharing the settings in the channel.' } ); } );        
          }
        }
      }
      else if ( hasManageGuild && myTask === 'reset' ) {
        await guildConfigDB.updateOne(
          { Guild: guild.id },
          {
            Guild: guild.id,
            Blacklist: [],
            Whitelist: [],
            Invite: null,
            Logs: { Chat: null, Default: null, Error: null },
            Prefix: botConfig.Prefix,
            Welcome: { Active: false, Channel: null, Msg: null, Role: null }
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
        var setInvite = ( options.getChannel( 'invite' ) ? options.getChannel( 'invite' ).id : null );
        var setChat = ( options.getChannel( 'log-chat' ) ? options.getChannel( 'log-chat' ).id : null );
        var setDefault = ( options.getChannel( 'log-default' ) ? options.getChannel( 'log-default' ).id : null );
        var setError = ( options.getChannel( 'log-error' ) ? options.getChannel( 'log-error' ).id : null );
        var setPrefix = ( options.getString( 'prefix' ) ? options.getString( 'prefix' ) : null );
        var boolWelcome = ( options.getBoolean( 'welcome' ) ? options.getBoolean( 'welcome' ) : false );
        var strWelcome = ( options.getString( 'welcome-message' ) ? options.getString( 'welcome-message' ) : null );
        var setWelcome = ( options.getChannel( 'welcome-channel' ) ? options.getChannel( 'welcome-channel' ).id : null );
        var sendDM = ( options.getBoolean( 'welcome-dm' ) ? options.getBoolean( 'welcome-dm' ) : ( setWelcome ? false : true ) );
        var joinWelcome = ( options.getRole( 'welcome-role' ) ? options.getRole( 'welcome-role' ).id : null );
        var giveRole = ( options.getBoolean( 'welcome-role-give' ) ? options.getBoolean( 'welcome-role-give' ) : ( joinWelcome ? true : false ) );        
        
        if ( !oldConfig ) {
          if ( !setInvite ) { setInvite = channel.id; }
          if ( !setDefault ) { setDefault = channel.id; }
          if ( !setChat ) { setChat = setDefault; }
          if ( !setError ) { setError = setDefault; }
          if ( !setPrefix ) { setPrefix = botConfig.Prefix; }
          await guildConfigDB.create( {
            Guild: guild.id,
            Blacklist: [],
            Whitelist: [],
            Invite: setInvite,
            Logs: { Default: setDefault, Error: setError, Chat: setChat },
            Prefix: setPrefix,
            Welcome: { Active: boolWelcome, Channel: ( !sendDM ? setWelcome : null ), Msg: strWelcome, Role: giveRole }
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
          let oldPrefix = oldConfig.Prefix;
          let oldWelcome = oldConfig.Welcome.Active;
          let oldWelcomeMsg = oldConfig.Welcome.Message;
          await guildConfigDB.updateOne( { Guild: guild.id }, {
            Guild: guild.id,
            Blacklist: arrBlackGuild,
            Whitelist: arrWhiteGuild,
            Invite: setInvite || oldInvite,
            Logs: {
              Default: setDefault || oldDefault,
              Error: setError || oldError,
              Chat: setChat || oldChat
            },
            Prefix: setPrefix || oldPrefix,
            Welcome: {
              Active: boolWelcome || oldWelcome,
              Message: strWelcome || oldWelcomeMsg
            }
          } )
          .then( updateSuccess => {
            let showInvite = ( setInvite || oldInvite );
            let showChat = ( setChat || oldChat );
            let showDefault = ( setDefault || oldDefault );
            let showError = ( setError || oldError );
            let showPrefix = ( setPrefix || oldPrefix );
            let showWelcomeRole = ( oldConfig.Welcome.Role ? 'assigned <@' + oldConfig.Welcome.Role + '> and ' : '' );
            let showWelcomeChan = 'sent to ' + ( '<#' + oldConfig.Welcome.Channel + '>' || 'DM' );
            let showWelcomeMsg = ' with the following message:\n```\n' + ( strWelcome || oldWelcomeMsg ) + '\n```\n';
            let showWelcome = ( ( boolWelcome || oldWelcome ) ? showWelcomeRole + showWelcomeChan + showWelcomeMsg : '**DISABLED**.' );
            //blacklist
            //whitelist
            interaction.editReply( { content:
              'Guild configuration:\n\t' +
              'Invite channel is: <#' + showInvite + '>\n\t' +
              'Default log channel is: <#' + showDefault + '>\n\t' +
              'Error message logs go to: <#' + showError + '>\n\t' +
              'Chat command requests log to: <#' + showChat + '>\n\t' +
              'Command prefix is set to: `' + showPrefix + '`\n\t' +
              'On join welcomes are ' + showWelcome
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