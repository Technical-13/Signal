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
            const mentionsIds = ( message.content ? ( message.content.match( /<@[\d]{17,20}>/g ) || [] ) : [] );
            let strMentions = '';
            if ( mentionsIds.length > 0 ) {
                strMentions = ' mentioning ';
                switch ( mentionsIds.length ) {
                    case 1: strMentions += mentionsIds.pop(); break;
                    case 2:  strMentions += mentionsIds.join( ' and ' ); break;
                    default:
                        let lastMention = mentionsIds.pop();
                        strMentions += mentionsIds.join( ', ' ) + ', and ' + lastMention;
                }
            }
            
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
            if ( intEmbeds != 0 ) {
                let embeds = [];
                await message.embeds.forEach( embed => { embeds.push( embed.footer ? embed.footer.text : embed.title ); } );
                if ( intEmbeds >= 3 ) {
                    let lastEmbed = embeds.pop();
                    strEmbedList = ' [ `' + embeds.join( '`, `' ) + '`, and `' + lastEmbed + '` ]';
                } else if ( intEmbeds === 2 ) {
                    strEmbedList = ' (`' + embeds.join( '` and `' ) + '``)';
                } else if ( intEmbeds === 1 ) {
                    strEmbedList = ' (`' + embeds[ 0 ] + '`)';
                }
            }
            
            const strEmbeds = ( intEmbeds == 0 ? 'no embeds' : intEmbeds == 1 ? 'an embed'  : intEmbeds + ' embeds' ) + strEmbedList + ', and ';
            const content = ( message.content ? 'the following content:\n```\n' + message.content + '\n```\n' : 'no content.\n' );
            const msgContained = ( ( attachments.length == 0 && intEmbeds === 0 && !message.content ) ? 'and was completely empty.' : 'with ' + strAttachments + strEmbeds + content );
            logChan.send( {
                content: ( author ? '<@' + author.id + '>\'s' : 'A' ) + ' message' + strMentions + ' in <#' + channel.id + '> was deleted ' + msgContained + setupPlease,
                files: ( attachments.length === 0 ? null : attachments )
            } ).catch( noLogChan => { console.error( 'logChan.send error:\n%o', noLogChan ) } );
        }
    } ).catch( err => { console.error( 'Encountered an error running messageDelete.js from %s:\n\t%o', guild.name, err ); } );
} );
