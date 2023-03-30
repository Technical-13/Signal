const logSchema = require( '../models/Log' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: "reply",
	description: "What do you want me to say in response?",
	cooldown: 1000,
	async run( interaction, client ) {
    interaction.deferReply( { ephemeral: true } );
    const myOwner = client.users.cache.get( process.env.OWNER_IDS.split( ';' )[ 0 ] );
    const { channel, options } = interaction;
    const msgID = interaction.options.getString( 'message-id' );
    const myResponse = interaction.options.getString( 'response' );
    const objGuildMembers = interaction.guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );
    var logChan = objGuildOwner;
    var logErrorChan = objGuildOwner;
    const author = interaction.user;
    const strAuthorTag = author.tag;
    const arrAuthorPermissions = ( interaction.guild.members.cache.get( author.id ).permissions.toArray() || [] );
    const cmdAllowed = ( arrAuthorPermissions.indexOf( 'PRIORITY_SPEAKER' ) !== -1 ? true : false );

    logSchema.findOne( { Guild: interaction.guild.id }, async ( err, data ) => {
      if ( data ) {
        logChan = interaction.guild.channels.cache.get( data.Logs.Reply );
        logErrorChan = interaction.guild.channels.cache.get( data.Logs.Error );
      }
      channel.messages.fetch( msgID ).then( async message => {
        if ( cmdAllowed ) {
          await message.reply( myResponse ).then( async responded => {
            interaction.editReply( { content: 'Responded!' } );
            logChan.send( 'I replied to <@' + message.author.id + '>\'s message in <#' +
              message.channel.id + '> at <@' + interaction.user.id + '>\'s request:\n```\n' + myResponse + '\n```' );
          } );
        } else {
          logErrorChan.send( '<@' + interaction.user.id + '> has no permission to use my `/reply` command from <#' +
            interaction.channel.id + '>. They tried to get me to reply to <@' + message.author.id +
            '>\'s message:' + ( message.content === '' ? ' **__Attachment Only!__**\n' : '\n```\n' + message.content + '\n```' ) + 'With:\n```\n' + myResponse + '\n```' );   
          interaction.editReply( { content: 'You don\'t have permission to get me to speak in `' +
            interaction.guild.name + '`<#' + interaction.channel.id + '>.' } );      
        }
      } ).catch( noMessage => {
        switch( noMessage.code ) {
          case 10008://Unknown Message
            interaction.editReply( { content: 'Unable to find message to reply to.' } ); break;
          case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
            interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
          default:
            myOwner.send( 'Error attempting to reply with ' + myResponse + ' to message :ID:`' + msgID +
              '` as requested by: <@' + interaction.user.id + '>' + ' from `' + interaction.guild.name +
              '`<#' + interaction.channel.id + '>:\n```\n' + noMessage + '\n```')
              .then( notified => { interaction.editReply( { content: 'Unknown Error replying to message. My owner, <@' + myOwner.id + '>, has been notified.' } ); } )
              .catch( notNotified => { interaction.editReply( { content: 'Unknown Error replying to message. Unable to notify owner, <@' + myOwner.id + '>.' } ); } );
            console.error( '%o requested me to reply with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
              strAuthorTag, myResponse, msgID, noMessage.code, noMessage.message, noMessage
            );
        }
      } );
    } );
	}
}