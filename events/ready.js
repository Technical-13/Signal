const Discord = require( 'discord.js' );
const mongoose = require( 'mongoose' );

module.exports = {
	name: 'ready',
	once: true,
	async run( client ) {
    const myOwner = client.users.cache.get( process.env.OWNERID );
    
    mongoose.set( 'strictQuery', false );
    client.user.setActivity( 'Geocaching', { type: 'PLAYING' } );
    mongoose.disconnect( () => console.log( 'Closed MongoDBs.' ) );
    await mongoose.connect( process.env.mongodb || '', { keepAlive: true } )
      .then( connected => { console.log( 'Connected to MongoDB.' ); } )
      .catch( errDB => {
        myOwner.send( 'Failed to connect to MongoDB:\n```\n' + errDB + '\n```' )
          .catch( errSend => { console.error( 'Unable to send DM:\n%o', errSend ); } );
        console.error( 'Failed to connect to MongoDB:\n%o', errDB );
      } );
    
    console.log( 'Successfully logged in as: ' + client.user.tag );
	}
}