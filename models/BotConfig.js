const { model, Schema } = require( 'mongoose' );

let logSchema = new Schema( {
  Owner: String,
  Prefix: String,
  Mods: Array,
  DevGuild: String
} );

module.exports = model( 'BotConfig', logSchema );
