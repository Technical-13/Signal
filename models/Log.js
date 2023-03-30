const { model, Schema } = require( 'mongoose' );

let logSchema = new Schema( {
  Guild: String,
  Logs: {
    Default: String,
    Error: String,
    React: String,
    Reply: String,
    Say: String
  }
} );

module.exports = model( 'Log', logSchema );