const botConfigDB = require( '../../models/BotConfig.js' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );

module.exports = {
  name: 'system',
  description: 'Change bot configs.',
  type: ApplicationCommandType.ChatInput,
  cooldown: 1000,
  modCmd: true,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );

    const bot = client.user;
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = await botConfig.find();
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );

    if ( !botOwner ) { return interaction.editReply( { content: 'You are not the boss of me...' } ); }
  }
};