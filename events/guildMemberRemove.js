const client = require( '..' );

client.on( 'guildMemberRemove', async ( member ) => {
  const botOwner = client.users.cache.get( client.ownerId );
  const { guild } = member;
  console.log( '%s (id:%s) has left %s (id:%s).', member.displayName, member.id, guild.name, guild.id );
} );