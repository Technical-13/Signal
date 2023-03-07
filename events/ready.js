const Discord = require( 'discord.js' );
const mongoose = require( 'mongoose' );

module.exports = {
	name: 'ready',
	once: true,
	async run( client ) {
    mongoose.set( 'strictQuery', false );
    client.user.setActivity( 'Geocaching', { type: 'PLAYING' } );
    mongoose.disconnect( () => console.log( 'Closed MongoDBs.' ) );
    await mongoose.connect( process.env.mongodb || '', { keepAlive: true } )
      .then( connected => {
        console.log( 'Connected to MongoDB.' );
      } ).catch( errDB => {
        console.error( 'Failed to connect to MongoDB:\n%o', errDB );
      } );
    
    console.log( 'Successfully logged in as: ' + client.user.tag );
	}
}