const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getBotConfig = require( '../../functions/getBotDB.js' );
const errHandler = require( '../../functions/errorHandler.js' );
const chalk = require( 'chalk' );

module.exports = {
  name: 'bot',
  description: 'Bot information and message management.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  devOnly: true,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      return interaction.editReply( { content: 'Comming **SOON**:tm:' } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './slashCommands/info/bot.js' ), errObject.stack ); }
  }
};