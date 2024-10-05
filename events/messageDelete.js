const client = require( '..' );
const { Collection } = require( 'discord.js' );
const logSchema = require( '../models/GuildLogs.js' );
const { model, Schema } = require( 'mongoose' );

client.on( 'messageDelete', async message => {
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const { author, guild, channel } = message;
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    var logChan = objGuildOwner;

    logSchema.findOne( { Guild: guild.id } ).then( async data => {
        if ( data ) {  if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); } }
        let setupPlease = ( logChan == objGuildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );
        if ( logChan !== channel ) {
            var attachments = [];
            if ( message.attachments.size != 0 ) {
                message.attachments.each( attachment => {
                    let imageSize = attachment.size;
                    if ( imageSize > ( 1024 ** 3 ) ) { imageSize = ( imageSize / ( 1024 ** 3 ) ).toFixed( 2 ) + 'gb '; }
                    else if ( imageSize > ( 1024 ** 2 ) ) { imageSize = ( imageSize / ( 1024 ** 2 ) ).toFixed( 2 ) + 'mb '; }
                    else if ( imageSize > 1024 ) { imageSize = ( imageSize / 1024 ).toFixed( 2 ) + 'kb '; }
                    else { imageSize = imageSize + 'b '; }
                    let thisAttachment = {
                        name: attachment.name,
                        attachment: attachment.attachment,
                        description: attachment.height + 'x' + attachment.width + 'px ' + imageSize + attachment.type + ( attachment.description ? ': ' + attachment.description : '.' )
                    }
                    attachments.push( thisAttachment );
                } );
            }
            const strAttachments = ( attachments.length == 0 ? 'no attachments' : attachments.length === 1 ? 'an attachment' : attachments.length + ' attachments' ) + ', ';
            var intEmbeds = message.embeds.length;
            var strEmbedList = '';
            if ( intEmbeds === 1 ) { strEmbedList = ' (`' + message.embeds[ 0 ].footer.text + '`)'; }
            else if ( intEmbeds === 2 ) {
                strEmbedList = ' (`' + message.embeds[ 0 ].footer.text + '` and `' +  message.embeds[ 0 ].footer.text + '``)';
            }
            else if ( intEmbeds != 0 ) {
                let embeds = [];
                await message.embeds.forEach( embed => { embeds.push( embed.footer.text ); } );
                let lastEmbed = embeds.pop();
                strEmbedList = ' [ `' + embeds.join( '`, `' ) + '`, and `' + lastEmbed + '` ]';
            }
            const strEmbeds = ( intEmbeds == 0 ? 'no embeds' : intEmbeds == 1 ? 'an embed'  : intEmbeds + ' embeds' ) + strEmbedList + ', and ';
            const content = ( message.content ? ':\n```\n' + message.content + '\n```\n' : ' no content.\n' );
            const msgContained = strAttachments + strEmbeds + content;
            logChan.send( {
                content: ( author ? '<@' + author.id + '>\'s' : 'A' ) + ' message in <#' + channel.id + '> was deleted with ' + msgContained + setupPlease,
                files: ( attachments.length === 0 ? null : attachments )
            } ).catch( noLogChan => { console.error( 'logChan.send error:\n%o', noLogChan ) } );
        }
    } ).catch( err => { console.error( 'Encountered an error running messageDelete.js from %s:\n\t%o', guild.name, err ); } );
} );
