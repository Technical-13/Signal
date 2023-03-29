const logSchema = require( '../models/Log' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: 'setup-log',
	description: 'Set up log channels for this server.',
	cooldown: 1000,
	async run( interaction, client ) {
    await interaction.deferReply();
    const { channel, options } = interaction;
    const botMods = process.env.OWNER_IDS.split( ';' );
    const botOwner = client.users.cache.get( botMods[ 0 ] );
    const newAll = ( options.getChannel( 'default-channel' ) || channel ).id;
    const newReact = ( newAll ? newAll : options.getChannel( 'react-channel' ).id );
    const newReply = ( newAll ? newAll : options.getChannel( 'reply-channel' ).id );
    const newSay = ( newAll ? newAll : options.getChannel( 'say-channel' ).id );
    const author = interaction.user;
    const strAuthorTag = author.tag;
    const arrAuthorPermissions = ( interaction.guild.members.cache.get( author.id ).permissions.toArray() || [] );
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );
    const isBotMod = ( botMods.indexOf( author.id ) != -1 ? true : false );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const hasAdministrator = ( arrAuthorPermissions.indexOf( 'ADMINISTRATOR' ) !== -1 ? true : false );
    const hasManageServer = ( arrAuthorPermissions.indexOf( 'MANAGE_SERVER' ) !== -1 ? true : false );

    if ( isBotMod || isGuildOwner || hasAdministrator || hasManageServer ) {
      logSchema.findOne( { Guild: interaction.guild.id }, async ( err, data ) => {
        if ( err ) {
          console.error( 'Encountered an error running setup-log.js from %o<#%s>:\n\t%o', err );
          botOwner.send( 'Encountered an error running setup-log.js from `' + interaction.guild.name + '`<#' + interaction.channel.id + '>.  Please check console for details.' );
        } else if ( !data ) {
          const newLog = await logSchema.create( {
            Guild: interaction.guild.id,
            Logs: {
              React: newReact,
              Reply: newReply,
              Say: newSay
            }
          } );
          interaction.editReply( { content: 'Log channels created.' } );
        } else {
          let oldReact = data.Logs.React;
          let oldReply = data.Logs.Reply;
          let oldSay = data.Logs.Say;
          const updateLog = await logSchema.updateOne( {
            Guild: interaction.guild.id,
            Logs: {
              React: newReact || oldReact,
              Reply: newReply || oldReply,
              Say: newSay || oldSay
            }
          } );
          interaction.editReply( { content:
            'Log channels updated:' +
            '\n\t`/React` requests log to: <#' +
            ( newReact || oldReact ) + '>' +
            '\n\t`/Reply` requests log to: <#' +
            ( newReply || oldReply ) + '>' +
            '\n\t`/Say` requests log to: <#' +
            ( newSay || oldSay ) + '>'
          } );
        }
      } );
    } else {
      objGuildOwner.send( '<@' + interaction.author.id + '> attempted to modify my logging channels for `' + interaction.guild.name + '`.  Only those with the `MANAGE_SERVER` permission and my bot mods can do that.' );
      interaction.editReply( { content: 'Sorry, you do not have permission to do that.  Only those with the `MANAGE_SERVER` permission and my bot mods can do that.' } );
    }
  }
}