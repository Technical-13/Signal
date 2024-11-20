const chalk = require( 'chalk' );
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './commands/admin/roadmap.js' );

module.exports = {
  name: 'roadmap',
  aliases: [ 'todo' ],
  group: 'admin',
  description: 'Development ToDo list for me!',
  cooldown: 600000,
  run: async ( client, message, args ) => {
    try {
      const arrToDo = [
        'Move `§help` to `/help` so response can be ephemeral',
        'Move `§invite` to `/invite` and make User cmd so response can be ephemeral',
        'Add "*bump buddy*" thing for DISBOARD bumps.',
        'Build [`bot`.magentarv.info](<https://ShoeBot.MagentaRV.info>) stuff.',
        'Build `returnurl` stuff for APIs to send stuff back to the bot.',
        'Update `/config` and `/system` for DB changes',
        'Do whatever is defined for guildConfig.Part in guildMemberKick.js and guildMemberBan.js',
        'Finish guildCreate.js event telling guild owner how to config bot.',
        'Get the `/bot` command working again and make User cmd, so people can get bot info and links to request features and report bugs.',
        'Move this list so I can add/modify/remove items from Discord.' +
        '\nAdd integration to make this list an issue on GitHub and be able to view/edit all issues?' +
        '\n:arrow_right: <https://docs.github.com/en/rest/quickstart?apiVersion=latest>' +
        '\n:arrow_right: <https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=latest>' +
        '\n:arrow_right: <https://docs.github.com/en/rest/issues/issues?apiVersion=latest>',
        'Get `/guilds` and `/cipher` working.',
        'Create `/verify` command.',
        'Store information on TOs, kicks, and bans.'
      ];
      const embedToDo = new EmbedBuilder()
        .setTitle( 'Development Roadmap for bot:' )
        .setColor( '#FF00FF' )
        .setTimestamp()
        .setFooter( { text: client.user.tag } );

      arrToDo.forEach( item => { embedToDo.addFields( { name: '\u200B', value: item, inline: false } ); } );
      message.reply( { embeds: [ embedToDo ] } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};