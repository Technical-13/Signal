const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/admin/config.js' );

module.exports = {
  name: 'config',
  group: 'admin',
  description: 'Configure bot for this server.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  options: [// add, clear, commands, get, logs, remove, reset, set, welcome
    { type: 1, name: 'add', description: 'Add a user to the guild blacklist or whitelist.', options: [// blacklist, whitelist
      { type: 9, name: 'blacklist', description: 'Role or Member to block from using all commands.' },
      { type: 9, name: 'whitelist', description: 'Role or Member to permit to use all commands.' }
    ] },//*/
    { type: 1, name: 'clear', description: 'Clear guild\'s blacklist and/or whitelist.', options: [// blacklist, whitelist
      { type: 5, name: 'blacklist', description: 'Clear guild\'s blacklist.' },
      { type: 5, name: 'whitelist', description: 'Clear guild\'s whitelist.' }
    ] },//*/
    /*{ type: 1, name: 'commands', description: 'Manage command groups allowed in server.' },//*/
    { type: 1, name: 'get', description: 'Get all settings for the server.', options: [// share
      { type: 5, name: 'share', description: 'Share result to current channel instead of making it ephemeral.' }
    ] },//*/
    { type: 1, name: 'logs', description: '(Dis|En)able logs and set channels for them.', options: [// do-logs, log-chat, log-default, log-error
      { type: 5, name: 'do-logs', description: 'Send logs for uses of commands that may be devious in nature' },// disable all logs
      { type: 7, name: 'log-chat', description: 'Channel to log chat command (`/edit`, `/react`, `/reply`, and `/say`) requests.' },// chat channel
      { type: 7, name: 'log-default', description: 'Channel to log all requests not otherwise specified.' },// default channel
      { type: 7, name: 'log-error', description: 'Channel to log errors.' },// error channel
      { type: 5, name: 'log-reset', description: 'Reset logging to enabled and all logs DMed to guild owner.' }// reset log settings
    ] },//*/
    { type: 1, name: 'remove', description: 'Remove a user from the guild blacklist or whitelist.', options: [// blacklist, whitelist
      { type: 9, name: 'blacklist', description: 'Role or Member to remove from blacklist.' },
      { type: 9, name: 'whitelist', description: 'Role or Member to remove from whitelist.' }
    ] },//*/
    { type: 1, name: 'reset', description: 'Reset all settings for the server to default.' },//*/
    { type: 1, name: 'set', description: 'Set settings for the server.', options: [// invite, prefix, premium
      { type: 7, name: 'invite', description: 'Channel to make invites to. Will try to guess if not set.' },// invite channel
      { type: 3, name: 'prefix', description: 'Guild specific prefix for bot commands' },// guild prefix
      { type: 5, name: 'premium', description: 'Give nitro server boosters extra bot access? (default: TRUE)' }
    ] },//*/
    { type: 1, name: 'welcome', description: 'Modify the welcome message options.', options: [// do-welcome, welcome-message, welcome-dm, welcome-channel, welcome-role-give, welcome-role
      { type: 5, name: 'do-welcome', description: 'Send a message to welcome new members to the server?' },// welcomer on/off
      { type: 3, name: 'welcome-message', description: 'Message to send new members to the server?' },// welcome message
      { type: 5, name: 'welcome-dm', description: 'Send the welcome message to DM?  (default: TRUE)' },// welcome dm
      { type: 7, name: 'welcome-channel', description: 'Which channel would you like to send the message?' },// welcome channel
      { type: 8, name: 'welcome-role', description: 'Which role, if any, would you like to give new members on join?' },// welcome role
      { type: 5, name: 'welcome-clear-role', description: 'Clear role to assign' },// clear welcome role
      { type: 5, name: 'welcome-reset', description: 'Reset welcoming of new members to disabled.' },// reset welcomer settings
    ] }//*/
  ],
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { isBotOwner, botOwner, globalPrefix, guildOwner, hasAdministrator, checkPermission, isGuildWhitelisted, roleServerBooster, content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const createConfig = {
        _id: guild.id,
        Blacklist: { Members: [], Roles: [] },
        Commands: [],
        Guild: { Name: guild.name, Members: guild.members.cache.size },
        Invite: null,
        Logs: { Active: true, Chat: null, Default: null, Error: null },
        Prefix: globalPrefix,
        Premium: true,
        Welcome: { Active: false, Channel: null, Msg: null, Role: null },
        Whitelist: { Members: [], Roles: [] }
      };
      const oldConfig = ( await guildConfigDB.findOne( { _id: guild.id } ).catch( async errFind => {
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
      } ) || createConfig );
      const oldBlacklist = oldConfig.Blacklist;
      const oldBlackRoles = oldBlacklist.Roles;
      const oldBlackMembers = oldBlacklist.Members;
      var oldBlackGuild = [];
      if ( oldBlackRoles.length > 0 ) {
        for ( const role of oldBlackRoles ) {
          let roleMembers = Array.from( await guild.roles.cache.get( role ).members.keys() );
          oldBlackGuild = oldBlackGuild.concat( roleMembers );
        }
      }
      if ( oldBlackMembers.length > 0 ) { oldBlackGuild = oldBlackGuild.concat( oldBlackMembers ); }
      const oldCommands = oldConfig.Commands;
      const oldInvite = oldConfig.Invite;
      const oldLogs = oldConfig.Logs;
      const oldLogActive = oldLogs.Active;
      const oldLogChat = oldLogs.Chat;
      const oldLogDefault = oldLogs.Default;
      const oldLogError = oldLogs.Error;
      const oldPrefix = oldConfig.Prefix;
      const oldPremium = oldConfig.Premium;
      const oldWelcome = oldConfig.Welcome;
      const oldWelcomeActive = oldWelcome.Active;
      const oldWelcomeChannel = oldWelcome.Channel;
      const oldWelcomeMsg = oldWelcome.Msg;
      const oldWelcomeRole = oldWelcome.Role;
      const oldWhitelist = oldConfig.Whitelist;
      const oldWhiteRoles = oldWhitelist.Roles;
      const oldWhiteMembers = oldWhitelist.Members;
      var oldWhiteGuild = [];
      if ( oldWhiteRoles.length > 0 ) {
        for ( const role of oldWhiteRoles ) {
          let roleMembers = Array.from( await guild.roles.cache.get( role ).members.keys() );
          oldWhiteGuild = oldWhiteGuild.concat( roleMembers );
        }
      }
      if ( oldWhiteMembers.length > 0 ) { oldWhiteGuild = oldWhiteGuild.concat( oldWhiteMembers ); }

      const chanDefaultLog = ( oldLogDefault ? guild.channels.cache.get( oldLogDefault ) : guildOwner );
      const chanErrorLog = ( oldLogError ? guild.channels.cache.get( oldLogError ) : guildOwner );

      const canAdmin = ( hasAdministrator || ( checkPermission( 'ManageGuild' ) && isGuildWhitelisted ) );
      const objTasks = {
        admin: [ 'clear', 'reset', 'set' ],//, 'commands'
        manager: [ 'add', 'logs', 'remove' ],//, 'welcome'
        anyone: [ 'get' ]
      };
      const myTask = options.getSubcommand();
      const isAdminTask = ( objTasks.admin.indexOf( myTask ) != -1 ? true : false );
      const isManagerTask = ( objTasks.manager.indexOf( myTask ) != -1 ? true : false );
      const isAnyoneTask = ( objTasks.anyone.indexOf( myTask ) != -1 ? true : false );

      if ( isAnyoneTask ) {// get
        let showCommands = '**' + ( oldConfig.Commands.length === 0 ? 'All commands!' : '[ ' + oldConfig.Commands.join( ', ' ) + ' ]' ) + '**';
        let showInvite = ( oldConfig.Invite ? '<#' + oldConfig.Invite + '>' : '**My best guess** ¯\_(ツ)_/¯' );
        let showChat = ( oldLogChat ? '<#' + oldLogChat + '>' : 'DM to <@' + guild.ownerId + '>' );
        let showDefault = ( oldLogDefault ? '<#' + oldLogDefault + '>' : 'DM to <@' + guild.ownerId + '>' );
        let showError = ( oldLogError ? '<#' + oldLogError + '>' : 'DM to <@' + guild.ownerId + '>' );
        let showPrefix = '**`' + ( oldConfig.Prefix || globalPrefix ) + '`**';
        let showPremium = '**`' + ( oldConfig.Premium && roleServerBooster ? 'EN' : 'DIS' ) + 'ABLED`**';
        let showWelcomeRole = ( oldConfig.Welcome.Role ? 'assigned <@' + oldConfig.Welcome.Role + '> and ' : '' );
        let showWelcomeChan = 'sent to ' + ( '<#' + oldConfig.Welcome.Channel + '>' || 'DM' );
        let showWelcomeMsg = ' with the following message:\n```\n' + oldConfig.Welcome.Msg + '\n```\n';
        let showWelcome = ( oldConfig.Welcome.Active ? showWelcomeRole + showWelcomeChan + showWelcomeMsg : '**`DISABLED`**.' );
        let showBlackList = '**' + ( oldBlackGuild.length === 0 ? 'No one is blacklisted!' : '[ **<@' + oldBlackGuild.join( '>**, **<@' ) + '>** ]' ) + '**';
        let showWhiteList = '**' + ( oldWhiteGuild.length === 0 ? 'No one is whitelisted!' : '[ **<@' + oldWhiteGuild.join( '>**, **<@' ) + '>** ]' ) + '**';

        showConfigs = 'Guild configuration:\n\t' +
          'Invite channel is: ' + showInvite + '\n\t' +
  //        'Available command groups: ' + showCommands + '\n\t' +
          'Default log channel is: ' + showDefault + '\n\t' +
          'Error message logs go to: ' + showError + '\n\t' +
          'Chat command requests log to: ' + showChat + '\n\t' +
          'Nitro Server Booster permissions: ' + showPremium + '\n\t' +
          'Command prefix is set to: ' + showPrefix + '\n\t' +
  //        'On join welcomes are ' + showWelcome + '\n\t' +
          'Blacklist: ' + showBlackList + '\n\t' +
          'Whitelist: ' + showWhiteList;

        if ( options.getBoolean( 'share' ) && ( canAdmin || ( checkPermission( 'ManageGuild' ) && isGuildWhitelisted ) ) ) {
          channel.send( showConfigs )
          .then( sent => { return interaction.editReply( { content: 'I shared the settings in the channel.' } ); } )
          .catch( errSend => { return interaction.editReply( { content: 'Error sharing the settings in the channel.' } ); } );
        }
        else if ( options.getBoolean( 'share' ) ) { return interaction.editReply( { content: '**Only server administrators can share the configuration.**\n' + showConfigs } ); }
        else { return interaction.editReply( { content: showConfigs } ); }
      }
      else if ( ( !canAdmin && isAdminTask ) || ( !checkPermission( 'ManageGuild' ) && isManagerTask ) ) {
        guildOwner.send( '<@' + author.id + '> attempted to ' + ( myTask === 'get' ? 'view' : 'modify' ) + ' the configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR` permission or `MANAGE_GUILD` permission and is whitelisted in the server, and my bot mods can do that.' );
        return interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + guildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
      }
      else {
        var newConfig = {
          Blacklist: oldBlacklist,
          Commands: oldCommands,
          Guild: { ID: guild.id, Name: guild.name, Members: guild.members.cache.size },
          Invite: oldInvite,
          Logs: oldLogs,
          Prefix: oldPrefix,
          Premium: oldPremium,
          Welcome: oldWelcome,
          Whitelist: oldWhitelist
        };
        var successResult, successResultLog, successResultReply;
        const errHandlerOptions = {
          author: author,
          channel: channel,
          command: 'config',
          guild: guild,
          modType: myTask,
          type: 'modifyDB'
        };

        if ( canAdmin ) {// clear, commands, reset, set
          switch ( myTask ) {
            case 'clear':
              let clearBlack = options.getBoolean( 'blacklist' );
              let clearWhite = options.getBoolean( 'whitelist' );
              if ( !clearBlack && !clearWhite ) { return interaction.editReply( { content: 'You forgot to tell me which list to clear.' } ); }
              if ( clearBlack ) { newConfig.Blacklist = { Members: [], Roles: [] }; }
              if ( clearWhite ) { newConfig.Whitelist = { Members: [], Roles: [] }; }
              let clearLists = ( clearWhite && clearBlack ? 'white and black lists' : ( clearWhite ? 'whitelist' : 'blacklist' ) );
              errHandlerOptions.clearLists = clearLists;
              let haveHas = ( clearWhite && clearBlack ? 'have' : 'has' );
              successResultLog = 'My ' + clearLists + ' for this server ' + haveHas + ' been cleared.';
              successResult = 'My ' + clearLists + ' for this server ' + haveHas + ' been cleared.';
              break;
            case 'commands': if ( !isBotOwner ) {
              return interaction.editReply( { content: 'Coming **SOON:tm:**' } ); }// SOON SOON SOON SOON SOON SOON SOON SOON SOON SOON
              break;
            case 'reset':
              newConfig = createConfig;
              successResultLog = 'Guild settings reset by <@' + author.id + '>.';
              successResultReply = 'Guild settings reset.';
              break;
            case 'set':
              let changedInvite = options.getChannel( 'invite' );
              let changedPrefix = options.getString( 'prefix' );
              let changedPremium = ( options.getBoolean( 'premium' ) !== null ? true : false );
              let setInvite = ( changedInvite ? options.getChannel( 'invite' ).id : null );
              let setPrefix = ( changedPrefix ? options.getString( 'prefix' ) : globalPrefix );
              let setPremium = ( changedPremium ? options.getBoolean( 'premium' ) : true );
              if ( !changedInvite && !changedPrefix && !changedPremium ) { return interaction.editReply( { content: 'You forgot to tell me what to set.' } ); }
              let setDone = [];
              let alreadyDone = [];
              if ( setInvite ) {
                newConfig.Invite = setInvite;
                setDone.push( 'Invite to <#' + setInvite + '>' );
              }
              if ( setPrefix != oldPrefix ) {
                newConfig.Prefix = setPrefix;
                setDone.push( 'Prefix to **`' + setPrefix + '`**' );
              } else if ( changedPrefix ) { alreadyDone.push( 'Prefix was already `' + setPrefix + '`' ); }
              if ( setPremium != oldPremium ) {
                newConfig.Premium = setPremium;
                setDone.push( 'Premium to **' + ( setPremium ? 'EN' : 'DIS' ) + 'ABLED**' );
              } else if ( changedPremium ) { alreadyDone.push( 'Premium was already **' + ( setPremium ? 'EN' : 'DIS' ) + 'ABLED**' ); }
              let setsDone;
              switch ( setDone.length ) {
                case 0: setsDone = '**NOTHING**'; break;
                case 1: setsDone = setDone[ 0 ]; break;
                case 2: setsDone = setDone.join( ' and ' ); break;
                default:
                  let lastDone = setDone.pop();
                  setsDone = setDone.join( ', ' ) + ', and ' + lastDone;
              }
              let allsDone;
              switch ( alreadyDone.length ) {
                case 0: allsDone = ''; break;
                case 1: allsDone = alreadyDone[ 0 ]; break;
                case 2: allsDone = alreadyDone.join( ' and ' ); break;
                default:
                  let lastDone = alreadyDone.pop();
                  allsDone = alreadyDone.join( ', ' ) + ', and ' + lastDone;
              }
              successResultLog = ( setDone.length === 0 ? '' : setsDone + ( setDone.length === 1 ? ' was' : ' were' ) + ' set by <@' + author.id + '>.' );
              successResultReply = 'You have set ' + setsDone + ( alreadyDone.length === 0 ? '' : ' (' + allsDone + ')' ) + '.';
              break;
          }
        }
        if ( canAdmin || checkPermission( 'ManageGuild' ) ) {// add, logs, remove, welcome
          let setDone = [];
          let setsDone;
          let alreadyDone = [];
          let allsDone;
          switch ( myTask ) {
            case 'add':
              let addBlack = ( options.getMentionable( 'blacklist' ) ? options.getMentionable( 'blacklist' ) : null );
              let addWhite = ( options.getMentionable( 'whitelist' ) ? options.getMentionable( 'whitelist' ) : null );
              if ( !addBlack && !addWhite ) { return interaction.editReply( { content: 'You forgot to tell me which member or role to add.' } ); }
              if ( addBlack ) {
                errHandlerOptions.modTargetType = addBlack.constructor.name;
                errHandlerOptions.modBlack = addBlack.id;
                let blackActions;
                switch ( addBlack.constructor.name ) {
                  case 'GuildMember':
                    if ( oldBlackMembers.indexOf( addBlack.id ) != -1 ) { return interaction.editReply( { content: '<@' + addBlack.id + '> is already on the blacklist!' } ) }
                    newConfig.Blacklist.Members = oldBlackMembers.concat( [ addBlack.id ] );
                    blackActions = '<@' + addBlack.id + '> was added';
                    if ( oldWhiteMembers.indexOf( addBlack.id ) != -1 ) {
                      newConfig.Whitelist.Members = oldWhiteMembers.splice( oldWhiteMembers.indexOf( addBlack.id ), 1 );
                      blackActions = '<@' + addBlack.id + '> was moved from the whitelist';
                    }
                    break;
                  case 'Role':
                    if ( oldBlackRoles.indexOf( addBlack.id ) != -1 ) { return interaction.editReply( { content: '<@&' + addBlack.id + '> is already on the blacklist!' } ) }
                    newConfig.Blacklist.Roles = oldBlackRoles.concat( [ addBlack.id ] );
                    blackActions = '<@&' + addBlack.id + '> was added';
                    if ( oldWhiteRoles.indexOf( addBlack.id ) != -1 ) {
                      newConfig.Whitelist.Roles = oldWhiteRoles.splice( oldWhiteRoles.indexOf( addBlack.id ), 1 );
                      blackActions = '<@&' + addBlack.id + '> was moved from the whitelist';
                    }
                    break;
                  default:
                    console.log( '<@%s> tried to get me to add `%s: %s` to the blacklist of https://discord.com/channels/%s', author.id, addBlack.constructor.name, addBlack.id, guild.id );
                    botOwner.send( { content: '<@' + author.id + '> tried to get me to add `' + addBlack.constructor.name + ': ' + addBlack.id + '` to the blacklist of https://discord.com/channels/' + guild.id } )
                    .then( sentOwner => {
                      return interaction.editReply( { content: 'I don\'t know who or what `' + addBlack.constructor.name + ': ' + addBlack.id + '` is.  My owner should be looking into it shortly.' } );
                    } )
                    .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'config', guild: guild, type: 'errSend' } ) ); } );
                }
                setDone.push( blackActions + ' to the blacklist' );
              }
              if ( addWhite ) {
                errHandlerOptions.modTargetType = addWhite.constructor.name;
                errHandlerOptions.modWhite = addWhite.id;
                let whiteActions;
                switch ( addWhite.constructor.name ) {
                  case 'GuildMember':
                    if ( oldWhiteMembers.indexOf( addWhite.id ) != -1 ) { return interaction.editReply( { content: '<@' + addWhite.id + '> is already on the whitelist!' } ) }
                    newConfig.Whitelist.Members = oldWhiteMembers.concat( [ addWhite.id ] );
                    whiteActions = '<@' + addWhite.id + '> was added';
                    if ( oldBlackMembers.indexOf( addWhite.id ) != -1 ) {
                      newConfig.Blacklist.Members = oldBlackMembers.splice( oldBlackMembers.indexOf( addWhite.id ), 1 );
                      whiteActions = '<@' + addWhite.id + '> was moved from the blacklist';
                    }
                    break;
                  case 'Role':
                    if ( oldWhiteRoles.indexOf( addWhite.id ) != -1 ) { return interaction.editReply( { content: '<@&' + addWhite.id + '> is already on the whitelist!' } ) }
                    newConfig.Whitelist.Roles = oldWhiteRoles.concat( [ addWhite.id ] );
                    whiteActions = '<@&' + addWhite.id + '> was added';
                    if ( oldBlackRoles.indexOf( addWhite.id ) != -1 ) {
                      newConfig.Blacklist.Roles = oldBlackRoles.splice( oldBlackRoles.indexOf( addWhite.id ), 1 );
                      whiteActions = '<@&' + addWhite.id + '> was moved from the blacklist';
                    }
                    break;
                  default:
                    console.log( '<@%s> tried to get me to add `%s: %s` to the whitelist of https://discord.com/channels/%s', author.id, addWhite.constructor.name, addWhite.id, guild.id );
                    botOwner.send( { content: '<@' + author.id + '> tried to get me to add `' + addWhite.constructor.name + ': ' + addWhite.id + '` to the whitelist of https://discord.com/channels/' + guild.id } )
                    .then( sentOwner => {
                      return interaction.editReply( { content: 'I don\'t know who or what `' + addWhite.constructor.name + ': ' + addWhite.id + '` is.  My owner should be looking into it shortly.' } );
                    } )
                    .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'config', guild: guild, type: 'errSend' } ) ); } );
                }
                setDone.push( whiteActions + ' to the whitelist' );
              }
              successResultLog = setDone.join( ' and ' ) + ' for this server.';
              successResult = setDone.join( ' and ' ) + ' for this server.';
              break;
            case 'logs':
              let changedLogsActive = ( options.getBoolean( 'do-logs' ) !== null ? true : false );
              let changedLogsDefault = ( options.getChannel( 'log-default' ) ? true : false );
              let changedLogsChat = ( options.getChannel( 'log-chat' ) ? true : false );
              let changedLogsError = ( options.getChannel( 'log-error' ) ? true : false );
              let changedLogsRESET = ( options.getBoolean( 'log-reset' ) !== null ? true : false );
              var boolLogs = ( changedLogsActive ? options.getBoolean( 'do-logs' ) : true );
              var setDefault = ( changedLogsDefault ? options.getChannel( 'log-default' ).id : null );
              var setChat = ( changedLogsChat ? options.getChannel( 'log-chat' ).id : ( setDefault ? setDefault : null ) );
              var setError = ( changedLogsError ? options.getChannel( 'log-error' ).id : ( setDefault ? setDefault : null ) );
              var clearLogChans = ( changedLogsRESET ? options.getBoolean( 'log-reset' ) : false );
              if ( !changedLogsActive && !setDefault && !setChat && !setError && !changedLogsRESET ) { return interaction.editReply( { content: 'You forgot to tell me what logs to change.' } ); }
              if ( boolLogs != oldLogActive ) {
                newConfig.Logs.Active = boolLogs;
                setDone.push( '**' + ( boolLogs ? 'EN' : 'DIS' ) + 'ABLED** Logs' );
              } else if ( changedLogsActive ) { alreadyDone.push( 'Logs were already **' + ( boolLogs ? 'EN' : 'DIS' ) + 'ABLED**' ); }
              if ( setChat ) {
                newConfig.Logs.Chat = setChat;
                setDone.push( 'Chat log' );
              }
              if ( setDefault ) {
                newConfig.Logs.Default = setDefault;
                setDone.push( 'Default log' );
              }
              if ( setError ) {
                newConfig.Logs.Error = setError;
                setDone.push( 'Error log' );
              }
              if ( clearLogChans ) {
                newConfig.Logs.Active = true;
                newConfig.Logs.Chat = null;
                newConfig.Logs.Default = null;
                newConfig.Logs.Error = null;
                setDone = [];
              }
              switch ( setDone.length ) {
                case 0: setsDone = '**NOTHING**'; break;
                case 1: setsDone = setDone[ 0 ]; break;
                case 2: setsDone = setDone.join( ' and ' ); break;
                default:
                  let lastDone = setDone.pop();
                  setsDone = setDone.join( ', ' ) + ', and ' + lastDone;
              }
              switch ( alreadyDone.length ) {
                case 0: allsDone = ''; break;
                case 1: allsDone = alreadyDone[ 0 ]; break;
                case 2: allsDone = alreadyDone.join( ' and ' ); break;
                default:
                  let lastDone = alreadyDone.pop();
                  allsDone = alreadyDone.join( ', ' ) + ', and ' + lastDone;
              }
              successResultLog = ( setDone.length === 0 ? '' : setsDone + ( setDone.length === 1 ? ' was' : ' were' ) + ' set by <@' + author.id + '>.' );
              successResultReply = 'You have set ' + setsDone + ( alreadyDone.length === 0 ? '' : ' (' + allsDone + ')' ) + '.';
              break;
            case 'remove':
              let remBlack = ( options.getMentionable( 'blacklist' ) ? options.getMentionable( 'blacklist' ) : null );
              let remWhite = ( options.getMentionable( 'whitelist' ) ? options.getMentionable( 'whitelist' ) : null );
              if ( !remBlack && !remWhite ) { return interaction.editReply( { content: 'You forgot to tell me which member or role to remove.' } ); }
              if ( remBlack ) {
                errHandlerOptions.modTargetType = remBlack.constructor.name;
                errHandlerOptions.modBlack = remBlack.id;
                let blackActions;
                switch ( remBlack.constructor.name ) {
                  case 'GuildMember':
                    if ( oldBlackMembers.indexOf( remBlack.id ) === -1 ) { return interaction.editReply( { content: '<@' + remBlack.id + '> was not on the blacklist!' } ) }
                    newConfig.Blacklist.Members = oldBlackMembers.splice( remBlack.id, 1 );
                    whiteActions = '<@' + remBlack.id + '> was removed';
                    break;
                  case 'Role':
                    if ( oldBlackRoles.indexOf( remBlack.id ) === -1 ) { return interaction.editReply( { content: '<@&' + remBlack.id + '> was not on the blacklist!' } ) }
                    newConfig.Blacklist.Roles = oldBlackRoles.splice( remBlack.id, 1 );
                    whiteActions = '<@&' + remBlack.id + '> was removed';
                    break;
                  default:
                    console.log( '<@%s> tried to get me to remove `%s: %s` from the blacklist of https://discord.com/channels/%s', author.id, remBlack.constructor.name, remBlack.id, guild.id );
                    botOwner.send( { content: '<@' + author.id + '> tried to get me to remove `' + remBlack.constructor.name + ': ' + remBlack.id + '` from the blacklist of https://discord.com/channels/' + guild.id } )
                    .then( sentOwner => {
                      return interaction.editReply( { content: 'I don\'t know who or what `' + remBlack.constructor.name + ': ' + remBlack.id + '` is.  My owner should be looking into it shortly.' } );
                    } )
                    .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'config', guild: guild, type: 'errSend' } ) ); } );
                }
                setDone.push( blackActions + ' from the whitelist' );
              }
              if ( remWhite ) {
                errHandlerOptions.modTargetType = remWhite.constructor.name;
                errHandlerOptions.modWhite = remWhite.id;
                let whiteActions;
                switch ( remWhite.constructor.name ) {
                  case 'GuildMember':
                    if ( oldWhiteMembers.indexOf( remWhite.id ) === -1 ) { return interaction.editReply( { content: '<@' + remWhite.id + '> was not on the whitelist!' } ) }
                    newConfig.Whitelist.Members = oldWhiteMembers.splice( remWhite.id, 1 );
                    whiteActions = '<@' + remWhite.id + '> was removed';
                    break;
                  case 'Role':
                    if ( oldWhiteRoles.indexOf( remWhite.id ) === -1 ) { return interaction.editReply( { content: '<@&' + remWhite.id + '> was not on the whitelist!' } ) }
                    newConfig.Whitelist.Roles = oldWhiteRoles.splice( remWhite.id, 1 );
                    whiteActions = '<@&' + remWhite.id + '> was removed';
                    break;
                  default:
                    console.log( '<@%s> tried to get me to remove `%s: %s` from the whitelist of https://discord.com/channels/%s', author.id, remWhite.constructor.name, remWhite.id, guild.id );
                    botOwner.send( { content: '<@' + author.id + '> tried to get me to remove `' + remWhite.constructor.name + ': ' + remWhite.id + '` from the whitelist of https://discord.com/channels/' + guild.id } )
                    .then( sentOwner => {
                      return interaction.editReply( { content: 'I don\'t know who or what `' + remWhite.constructor.name + ': ' + remWhite.id + '` is.  My owner should be looking into it shortly.' } );
                    } )
                    .catch( async errSend => { return interaction.editReply( await errHandler( errSend, { command: 'config', guild: guild, type: 'errSend' } ) ); } );
                }
                setDone.push( whiteActions + ' from the whitelist' );
              }
              successResultLog = setDone.join( ' and ' ) + ' for this server.';
              successResult = setDone.join( ' and ' ) + ' for this server.';
              break;
            case 'welcome': if ( !isBotOwner ) {
              return interaction.editReply( { content: 'Coming **SOON:tm:**' } ); }// SOON SOON SOON SOON SOON SOON SOON SOON SOON SOON
              let changedWelcomeActive = ( options.getBoolean( 'do-welcome' ) !== null ? true : false );
              let changedWelcomeDM = ( options.getBoolean( 'welcome-dm' ) !== null ? true : false );
              let changedWelcomeChannel = ( options.getChannel( 'welcome-channel' ) ? true : false );
              let changedWelcomeMsg = ( options.getString( 'welcome-message' ) ? true : false );
              let changedWelcomeClearRole = ( options.getBoolean( 'welcome-clear-role' ) !== null ? true : false );
              let changedWelcomeRole = ( options.getRole( 'welcome-role' ) ? true : false );
              let changedWelcomeRESET = ( options.getBoolean( 'welcome-reset' ) !== null ? true : false );
              var newWelcomeActive = ( changedWelcomeActive ? options.getBoolean( 'do-welcome' ) : ( oldWelcomeActive || false ) );
              var sendDM = ( changedWelcomeDM ? options.getBoolean( 'welcome-dm' ) : ( oldWelcomeChannel || changedWelcomeChannel ? false : true ) );
              var newWelcomeChan = ( !sendDM && changedWelcomeChannel ? options.getChannel( 'welcome-channel' ).id : ( oldWelcomeChannel || null ) );
              var newWelcomeMsg = ( changedWelcomeMsg ? options.getString( 'welcome-message' ) : ( oldWelcomeMsg || null ) );
              var clearRole = ( changedWelcomeClearRole ? options.getBoolean( 'welcome-clear-role' ) : ( oldWelcomeRole || changedWelcomeClearRole ? false : true ) );
              var newWelcomeRole = ( !clearRole && changedWelcomeRole ? options.getRole( 'welcome-role' ).id : ( oldWelcomeRole || null ) );
              var clearAllWelcomes = ( changedWelcomeRESET ? options.getBoolean( 'welcome-reset' ) : false );
              if ( !changedWelcomeActive && !changedWelcomeChannel && !changedWelcomeDM && !changedWelcomeMsg && !changedWelcomeRole && !changedWelcomeClearRole && !changedWelcomeRESET ) { return interaction.editReply( { content: 'You forgot to tell me what welcoming stuff to change.' } ); }
              if ( newWelcomeActive != oldWelcomeActive ) {
                newConfig.Welcome.Active = newWelcomeActive;
                setDone.push( '**' + ( newWelcomeActive ? 'EN' : 'DIS' ) + 'ABLED** Welcoming' );
              } else if ( changedWelcomeActive ) { alreadyDone.push( 'Welcoming was already **' + ( newWelcomeActive ? 'EN' : 'DIS' ) + 'ABLED**' ); }
              if ( newWelcomeChan ) {
                newConfig.Welcome.Channel = newWelcomeChan;
                setDone.push( 'Welcome Channel' );
              }
              if ( newWelcomeMsg ) {
                newConfig.Welcome.Msg = newWelcomeMsg;
                setDone.push( 'Welcome Message' );
              }
              if ( newWelcomeRole ) {
                newConfig.Welcome.Role = newWelcomeRole;
                setDone.push( 'Welcome Role' );
              }
              if ( clearAllWelcomes ) {
                newConfig.Welcome.Active = false;
                newConfig.Welcome.Channel = null;
                newConfig.Welcome.Msg = null;
                newConfig.Welcome.Role = null;
                setDone = [];
              }
              switch ( setDone.length ) {
                case 0: setsDone = '**NOTHING**'; break;
                case 1: setsDone = setDone[ 0 ]; break;
                case 2: setsDone = setDone.join( ' and ' ); break;
                default:
                  let lastDone = setDone.pop();
                  setsDone = setDone.join( ', ' ) + ', and ' + lastDone;
              }
              switch ( alreadyDone.length ) {
                case 0: allsDone = ''; break;
                case 1: allsDone = alreadyDone[ 0 ]; break;
                case 2: allsDone = alreadyDone.join( ' and ' ); break;
                default:
                  let lastDone = alreadyDone.pop();
                  allsDone = alreadyDone.join( ', ' ) + ', and ' + lastDone;
              }
              successResultLog = ( setDone.length === 0 ? '' : setsDone + ( setDone.length === 1 ? ' was' : ' were' ) + ' set by <@' + author.id + '>.' );
              successResultReply = 'You have set ' + setsDone + ( alreadyDone.length === 0 ? '' : ' (' + allsDone + ')' ) + '.';
              break;
          }
        }
        await guildConfigDB.updateOne( { _id: guild.id }, newConfig, { upsert: true } )
        .then( updateSuccess => {
          if ( newConfig.Logs.Active && successResultLog ) {
            chanDefaultLog.send( { content: successResultLog } )
            .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'default', command: 'config', channel: channel, type: 'logLogs' } ) ); } );
          }
          if ( successResultReply ) { interaction.editReply( { content: successResultReply } ); }
          else if ( successResult ) {// deleteReply & return channel.send
            interaction.deleteReply();
            return channel.send( { content: successResult } );
          }
          else { interaction.editReply( { content: 'No result provided!' } ); }
        } )
        .catch( async updateError => { return interaction.editReply( { content: await errHandler( updateError, errHandlerOptions ) } ); } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};