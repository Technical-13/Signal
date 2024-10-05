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
    { type: 1, name: 'get-all', description: 'Get log channels for the server.' },
    { type: 1, name: 'get-default', description: 'Channel all requests not otherwise specified are logged.' },
    { type: 1, name: 'get-error', description: 'Channel errors are logged.' },
    { type: 1, name: 'get-chat', description: 'Channel chat command requests are logged.' },
    { type: 1, name: 'reset', description: 'Reset log channels for the server to defaul channel.',
     options: [ { name: 'all-logs', description: 'Channel to log all requests (current channel if not set).', type: 7 } ] },
    { type: 1, name: 'set', description: 'Set log channels for the server.',
     options: [
       {
         name: 'default',
         description: 'Channel to log all requests not otherwise specified.',
         type: 7
       }/*default channel//*/,
       {
         name: 'error',
         description: 'Channel to log errors.',
         type: 7
       }/*error channel//*/,
       {
         name: 'chat',
         description: 'Channel to log chat command (`/edit`, `/react`, `/reply`, and `/say`) requests.',
         type: 7
       }/*chat channel//*/
     ]
    }/*Set channels//*/
  ],
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const strAuthorTag = author.tag;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = [];
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const arrAuthorPermissions = ( guild.members.cache.get( author.id ).permissions.toArray() || [] );
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const hasManageServer = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageGuild' ) !== -1 ) ? true : false );
    const hasManageRoles = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'ManageRoles' ) !== -1 ) ? true : false );

    const myTask = interaction.options.getSubcommand();
    var setDefault, setError, setChat;
    if ( myTask === 'reset' &&  hasManageServer ) {
      setDefault = ( options.getChannel( 'all-logs' ) ? options.getChannel( 'all-logs' ).id : channel.id );
      await logSchema.updateOne(
        { Guild: guild.id },
        {
          Guild: guild.id,
          Logs: { Default: setDefault, Error: setDefault, Chat: setDefault }
        },
        { upsert: true } ).then( resetSuccess => {
        interaction.editReply( { content: 'Log channels reset.' } );
      } ).catch( resetError => {
        interaction.editReply( { content: 'Error reseting log channels.' } );
        console.error( 'Error attempting to reset logging channels in %s:\n%o', guild.name, resetError );
      } );
      return;
    } else if ( myTask === 'reset' ) {
      objGuildOwner.send( '<@' + author.id + '> attempted to reset my configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR` or `MANAGE_GUILD` permission, and my bot mods can do that.' );
      interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + objGuildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
      return;
    } else if ( myTask === 'set' ) {
      setDefault = options.getChannel( 'default' ) ? options.getChannel( 'default' ).id : null;
      setError = options.getChannel( 'error' ) ? options.getChannel( 'error' ).id : null;
      setChat = options.getChannel( 'chat' ) ? options.getChannel( 'chat' ).id : null;
    }

    logSchema.findOne( { Guild: interaction.guild.id } ).then( async data => {
      if ( myTask === 'set' && hasManageServer ) {
        if ( !data ) {
          if ( !setDefault ) { setDefault = channel.id; }
          if ( !setError ) { setError = setDefault; }
          if ( !setChat ) { setChat = setDefault; }
          await logSchema.create( {
            Guild: interaction.guild.id,
            Logs: { Default: setDefault, Error: setError, Chat: setChat }
          } ).then( setSuccess => {
            interaction.editReply( { content: 'Log channels set.' } );
          } ).catch( setError => {
            interaction.editReply( { content: 'Error setting log channels.' } );
            console.error( 'Error attempting to set logging channels in %s:\n%o', guild.name, setError );
          } );
        } else {
          let oldDefault = data.Logs.Default;
          let oldError = data.Logs.Error;
          let oldChat = data.Logs.Chat;
          await logSchema.updateOne( { Guild: guild.id }, {
            Guild: guild.id,
            Logs: {
              Default: setDefault || oldDefault,
              Error: setError || oldError,
              Chat: setChat || oldChat
            }
          } );
          interaction.editReply( {
            content: 'Log channels updated:\n\t' +
            'Default log channel is: <#' + ( setDefault || oldDefault ) + '>\n\t' +
            'Error message logs go to: <#' + ( setError || oldError ) + '>\n\t' +
            'Chat command requests log to: <#' + ( setChat || oldChat ) + '>' } );
        }
      } else if ( myTask.substring( 0, 3 ) === 'get' && hasManageRoles ) {
        if ( !data ) {
          interaction.editReply( { content: 'Log channels not configured for this server. All logs will go to the server owner, <@' + objGuildOwner.id + '>' } );
        } else if (  myTask === 'get-default' ) {
          interaction.editReply( { content: 'Default log channel is: <#' + data.Logs.Default + '>' } );
        } else if (  myTask === 'get-error' ) {
          interaction.editReply( { content: 'Error message logs go to: <#' + data.Logs.Error + '>' } );
        } else if (  myTask === 'get-chat' ) {
          interaction.editReply( { content: 'Chat command requests log to: <#' + data.Logs.Chat + '>' } );
        } else {
          //        } else if (  myTask === 'get-all' ) {
          interaction.editReply( {
            content: 'Log channels:\n\t' +
            'Default log channel is: <#' + data.Logs.Default + '>\n\t' +
            'Error message logs go to: <#' + data.Logs.Error + '>\n\t' +
            'Chat command requests log to: <#' + data.Logs.Chat + '>' } );
        }
      } else {
        objGuildOwner.send( '<@' + author.id + '> attempted to modify my configuration settings for `' + guild.name + '`.  Only yourself, those with the `ADMINISTRATOR` or `MANAGE_GUILD` permission, and my bot mods can do that.' );
        interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Please talk to <@' + objGuildOwner.id + '> or one of my masters if you think you shouldn\'t have gotten this error.' } );
      }
    } ).catch( err => {
      console.error( 'Encountered an error running config.js from %o<#%s>:\n\t%o', err );
      botOwner.send( 'Encountered an error running config.js from `' + guild.name + '`<#' + channel.id + '>.  Please check console for details.' );
    } );
  }
};
