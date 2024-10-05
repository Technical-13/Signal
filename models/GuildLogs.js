const { model, Schema } = require( 'mongoose' );

let logSchema = new Schema( {
  Guild: String,
  Logs: {
    Default: String,
    Error: String,
    Chat: String
  }
} );

module.exports = model( 'GuildLogs', logSchema );
