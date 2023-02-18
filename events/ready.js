const Discord = require( 'discord.js' );
const mongoose = require( 'mongoose' );

module.exports = {
	name: 'ready',
	once: true,
	async run( client ) {
    client.user.setActivity( 'Geocaching', { type: 'PLAYING' } );
    mongoose.disconnect( () => console.log( 'Closed MongoDBs.' ) );
    await mongoose.connect( process.env.mongodb || '', { keepAlive: true } );
    if ( mongoose.connect ) {
      console.log( 'Connected to MongoDB.' );
    }
    
    console.log( 'Successfully logged in as: ' + client.user.tag );
	}
}