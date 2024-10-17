const thisBotName = process.env.BOT_USERNAME;
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../../models/BotConfig.js' );

module.exports = {
  name: 'part',
  description: 'Leave the current guild.',
  ownerOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => {  console.error( 'Unable to find botConfig:\n%o', errFindBot );  } );
    const { author, guild } = message;
    const botOwner = client.users.cache.get( botConfig.Owner );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    if ( isBotOwner ) {
      console.log( 'args: %o', args );
 /*     await guild.leave()
        .then( left => { console.log( 'I left guild (%s)!\n\t%s', left.name, chanLinkUrl ); } )
        .catch( stayed => { console.error( 'I could NOT leave guild!\n%o', stayed ); } );//*/
    }
  }
};