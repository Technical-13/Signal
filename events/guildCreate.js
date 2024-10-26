const client = require( '..' );

client.on( 'guildCreate', async guild => {
  const botOwner = client.users.cache.get( client.ownerId );
  console.log( 'I have joined %s (id:%s).', guild.name, guild.id );
} );