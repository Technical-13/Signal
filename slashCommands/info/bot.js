const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errHandler = require( '../../functions/errorHandler.js' );

module.exports = {
  name: 'bot',
  description: 'Bot information and message management.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  devOnly: true,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { content } = await userPerms( author, guild );
    if ( content ) { return interaction.editReply( { content: content } ); }

    return interaction.editReply( { content: 'Comming **SOON**:tm:' } );
  }
};