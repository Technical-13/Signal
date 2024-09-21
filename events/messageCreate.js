// This is the event that runs for every message
// All modules must be re-imported since they are in a seperate file.

const Discord = require( "discord.js" );
const logSchema = require( '../models/Log' );
const { model, Schema } = require( 'mongoose' );

module.exports = {
	name: 'message', // Event name
	once: false, // multiple commands can be run
	run( message, client ) {
    console.log( 'I see a message!' );
  }
}
