const { model, Schema } = require( 'mongoose' );

let botSchema = new Schema( {
  BotName: String,
  Owner: String,
  Prefix: String,
  Mods: Array,
  DevGuild: String
} );

module.exports = model( 'BotConfig', botSchema );