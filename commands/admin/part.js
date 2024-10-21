const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'part',
  description: 'Leave the current guild.',
  modOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    const { author, guild } = message;
    const { botOwner, isBotOwner, isDevGuild } = await userPerms( author, guild );
    
    if ( isBotOwner ) {
      console.log( 'args: %o', args );
 /*     await guild.leave()
        .then( left => { console.log( 'I left guild (%s)!\n\t%s', left.name, chanLinkUrl ); } )
        .catch( stayed => { console.error( 'I could NOT leave guild!\n%o', stayed ); } );//*/
    }
  }
};