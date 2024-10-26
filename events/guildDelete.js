const client = require( '..' );

client.on( 'guildDelete', async guild => {
  const botOwner = client.users.cache.get( client.ownerId );
  console.log( 'I have left %s (id:%s).', guild.name, guild.id );
} );