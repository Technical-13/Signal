const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './commands/info/ping.js' );

module.exports = {
	name: 'ping',
  group: 'info',
	description: 'Check bot\'s ping.',
	cooldown: 3000,
	run: async ( client, message, args ) => {
    try {
      const msg = await message.reply( 'Pinging...' )
      await msg.edit( `Pong! **${client.ws.ping} ms**` )
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
	}
};