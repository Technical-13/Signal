const client = require( '..' );

client.on( 'guildMemberAdd', async ( member ) => {
  const botOwner = client.users.cache.get( client.ownerId );
  const { guild } = member;
  console.log( '%s (id:%s) has joined %s (id:%s).', member.displayName, member.id, guild.name, guild.id );
} );