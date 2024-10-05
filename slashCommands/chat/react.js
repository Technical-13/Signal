const logSchema = require( '../../models/GuildLogs.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType } = require( 'discord.js' );

module.exports = {
    name: 'react',
    name_localizations: {
        de: 'reagieren',
        fr: 'réagir',
        fi: 'reagoi',
        pl: 'reagować',
        'sv-SE': 'reagera' },
    description: 'What reaction do you want me to use on which message?',
    options: [ {
        name: 'message-id',
        description: 'Paste message ID here:',
        required: true,
        type: 3
    }, {
        name: 'reaction',
        description: 'How do you want me to react?',
        required: true,
        type: 3
    } ],
    type: ApplicationCommandType.ChatInput,
    cooldown: 1000,
    run: async ( client, interaction ) => {
        await interaction.deferReply( { ephemeral: true } );
        const { channel, guild, options } = interaction;
        const author = interaction.user;
        const botOwner = client.users.cache.get( process.env.OWNER_ID );
        const isBotOwner = ( author.id === botOwner.id ? true : false );
        const botMods = [];
        const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
        const msgID = options.getString( 'message-id' );
        if ( !( /[\d]{18,19}/.test( msgID ) ) ) {
            interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } );
            return;
        }
        const theReaction = options.getString( 'reaction' );
        const strAuthorTag = author.tag;
        const objGuildMembers = guild.members.cache;
        const objGuildOwner = objGuildMembers.get( guild.ownerId );
        var logChan = objGuildOwner;
        var logErrorChan = objGuildOwner;

        var myReaction = theReaction;
        var rxp = /<:(.*)?:([\d]*)>/;
        if ( rxp.test( myReaction ) ) { myReaction = myReaction.match( rxp )[ 2 ]; }
        else { myReaction = encodeURI( myReaction ); }

        logSchema.findOne( { Guild: guild.id } ).then( async data => {
            if ( data ) {
                if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); }
                if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
            }
        let setupPlease = ( logChan == objGuildOwner ? '. Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '.\n----' );
            channel.messages.fetch( msgID ).then( async message => {
                await message.react( myReaction ).then( reacted => {
                    interaction.editReply( { content: 'Reacted!' } );
                    logChan.send( 'I reacted to https://discord.com/channels/' + message.guild.id + '/' + message.channel.id + '/' + message.id + ' by <@' + message.author.id + '> with ' + theReaction + ' at <@' + author.id + '>\'s request' + setupPlease )
                        .catch( noLogChan => { console.error( 'logChan.send error in react.js:\n%o', noLogChan ) } );
                } ).catch( noReaction => {
                    switch ( noReaction.code ) {
                        case 10014://
                            console.error( '10014: %o', noReaction.message );
                            interaction.editReply( { content: '`' + myReaction + '` is not a valid `reaction` to react with. Please try again; emoji picker is helpful in getting valid reactions.' } );
                        default:
                            botOwner.send( 'Error attempting to react with ' + theReaction +
                                          ' to https://discord.com/channels/' + guild.id + '/' + channel.id + '/' + msgID +
                                          ' as requested by: <@' + author.id + '>:\n```\n' + noReaction + '\n```')
                                .then( notified => {
                                interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + botOwner.id + '>, has been notified.' } );
                            } ).catch( notNotified => {
                                interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + botOwner.id + '>.' } );
                            } );
                            console.error( '%o requested me to react with %o (%s) to a message (#%o), and I couldn\'t:\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
                                          strAuthorTag, myReaction, theReaction, msgID, noReaction.code, noReaction.message, noReaction );
                    }
                } );
            } ).catch( noMessage => {
                switch( noMessage.code ) {
                    case 10008://Unknown Message
                        interaction.editReply( { content: 'Unable to find message to react to.' } ); break;
                    case 50035://Invalid Form Body\nmessage_id: Value "..." is not snowflake.
                        interaction.editReply( { content: '`' + msgID + '` is not a valid `message-id`. Please try again.' } ); break;
                    default:
                        botOwner.send( 'Error attempting to find message 🆔`' + msgID + '` while attempting to react with ' + theReaction +
                                      ' as requested by: <@' + author.id + '>' + ' from `' + guild.name +
                                      '`<#' + channel.id + '>:\n```\n' + noMessage + '\n```')
                            .then( notified => { interaction.editReply( { content: 'Unknown Error reacting to message. My owner, <@' + botOwner.id + '>, has been notified.' } ); } )
                            .catch( notNotified => { interaction.editReply( { content: 'Unknown Error reacting to message. Unable to notify owner, <@' + botOwner.id + '>.' } ); } );
                        console.error( '%s requested me to react with %o (%s) to a message I couldn\'t find (#%s):\n\tCode: %o\n\tMsg: %o\n\tErr: %o',
                                      strAuthorTag, myReaction, theReaction, msgID, noMessage.code, noMessage.message, noMessage
                                     );
                }
            } );
        } ).catch( err => { console.error( 'Encountered an error running react.js from %o<#%s>:\n\t%o', err ); } );
    }
};
