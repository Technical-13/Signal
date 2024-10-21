const { ApplicationCommandType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'cipher',
  description: 'Cipher (de|en)coder.',
  type: ApplicationCommandType.ChatInput,
  options: [
    { type: 3, name: 'string', description: 'string to (de|en)code.', required: true },
    { type: 3, name: 'code', description: 'Decode or encode?', required: true,
      choices: [ { name: 'Decode', value: 'decode' }, { name: 'Encode', value: 'encode' } ] },
    { type: 3, name: 'use-type', description: 'Pick a type.',
      choices: [ { name: 'Letters A-Z', value: 'alphabetic' }, { name: 'Letters A-Z & Numbers 0-9', value: 'alphanumberic' }, { name: 'Numbers 0-9', value: 'numeric' } ] },
    { type: 10, name: 'numeric', description: 'Characters in the Latin alphabet. (default 5)', minValue: 1, maxValue: 10 },
    { type: 10, name: 'alphabetic', description: 'Characters in the Latin alphabet. (default 13)', minValue: 1, maxValue: 26 },
    { type: 10, name: 'alphanumberic', description: 'Characters in the Latin alphabet. (default 18)', minValue: 1, maxValue: 36 }
  ],
  modCmd: true,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: author } = interaction;
    const { content } = await userPerms( author, guild , true );
    if ( content ) { return interaction.editReply( { content: content } ); }
    
    return interaction.editReply( { content: 'Comming **SOON**:tm:' } );
  }
};