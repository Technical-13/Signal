const { model, Schema } = require( 'mongoose' );

let botSchema = new Schema( {
  BotName: String,
  ClientID: String,
  Owner: String,
  Prefix: String,
  Mods: [ String ],
  DevGuild: String
} );

module.exports = model( 'BotConfig', botSchema );