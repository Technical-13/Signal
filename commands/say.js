const logSchema = require( '../models/Log' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: "say",
	description: "What do you want me to say?",
	cooldown: 1000,
	async run( interaction, client ) {
    await interaction.deferReply( { ephemeral: true } );
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );
    const speakChannel = interaction.options.getChannel( 'channel' ) || interaction.channel;
    const mySaying = interaction.options.getString( 'saying' );
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );
    var logChan = objGuildOwner;
    var logErrorChan = objGuildOwner;
    const author = interaction.user;
    const strAuthorTag = author.tag;
    const arrAuthorPermissions = ( interaction.guild.members.cache.get( author.id ).permissions.toArray() || [] );
    const cmdAllowed = ( arrAuthorPermissions.indexOf( 'PRIORITY_SPEAKER' ) !== -1 ? true : false );

    if ( mySaying ) {    
      logSchema.findOne( { Guild: interaction.guild.id }, async ( err, data ) => {
        if ( data ) {
          logChan = interaction.guild.channels.cache.get( data.Logs.Say );
          logErrorChan = interaction.guild.channels.cache.get( data.Logs.Error );
        }
        if ( cmdAllowed ) {
          speakChannel.send( mySaying ).then( async spoke => {
            logChan.send( 'I spoke in https://discord.com/channels/' + spoke.guild.id + '/' + spoke.channel.id + '/' + spoke.id + ' at <@' + interaction.user.id + '>\'s request:\n```\n' + mySaying + '\n```' );
            interaction.editReply( { content: 'I said the thing!' } );
          } ).catch( async muted => {
            switch ( muted.code ) {
              case 50001 :
                const noChan = '<#' + speakChannel + '>';
                await logErrorChan.send( 'Please give me permission to send to ' + noChan );
                await interaction.editReply( { content: 'I do not have permission to send messages in ' + noChan + '.' } );
                break;
              default:
                myOwner.send( 'Error attempting to speak as requested by: <@' + interaction.user.id + '>' +
                  ' from `' + interaction.guild.name + '`<#' + interaction.channel.id + '>:\n```\n' + muted + '\n```')
                  .then( notified => {
                    interaction.editReply( { content: 'Unknown error speaking. My owner, <@' + myOwner.id + '>, has been notified.' } );
                  } ).catch( notNotified => {
                    interaction.editReply( { content: 'Unknown error speaking. Unable to notify my owner, <@' + myOwner.id + '>.' } );
                  } );
                console.error( 'Unable to speak:\n\tCode: %o\n\tMsg: %o\n\tErr: %o', muted.code, muted.message, muted );
            }
          } );
        } else {
          logChan.send( '<@' + interaction.user.id + '> has no permission to use my `/say` command from <#' + interaction.channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```');
          interaction.editReply( { content: 'You don\'t have permission to get me to speak in `' +
            interaction.guild.name + '`<#' + interaction.channel.id + '>.' } );
        }
      } );
    } else {
      console.error( 'mySaying: %o', mySaying );
      interaction.editReply( { content: 'I don\'t know what to say.' } );
    }
	}
}
