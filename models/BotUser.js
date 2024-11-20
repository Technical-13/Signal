const { model, Schema } = require( 'mongoose' );

let userSchema = new Schema( {
  _id: String,
  Bot: Boolean,
  Guilds: [ {
    _id: String,
    Corrections: [ {
      ByID: String,
      ByName: String,
      Duration: String,
      StartedAt: Date,
      Type: String
    } ],
    Expires: Date,
    GuildName: String,
    MemberName: String,
    Roles: [ String ],
    Score: Number
  } ],
  Guildless: Date,
  Score: Number,
  UserName: String,
  Version: Number//,WikiAuthentication: { String }
}, { timestamps: true } );

module.exports = model( 'BotUser', userSchema );