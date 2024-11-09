const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const chalk = require( 'chalk' );

module.exports = {
  name: 'roadmap',
  aliases: [ 'todo' ],
  description: 'Development ToDo list for me!',
  cooldown: 600000,
  run: async ( client, message, args ) => {
    try {
      const arrToDo = [
        'Move `§part` & `§inspectdb` to `/system`',
        'Update `/config` and `/system` for DB changes',
        'Do whatever is defined for guildConfig.Part in guildMemberKick.js, guildMemberBan.js, and/or guildMemberDelete.js',
        'Finish guildCreate.js event telling guild owner how to config bot.',
        'Get the `/bot` command working again so people can get bot info and links to request features and report bugs.',
        'Move this list so I can add/modify/remove items from Discord.' +
        '\nAdd integration to make this list an issue on GitHub and be able to view/edit all issues?' +
        '\n:arrow_right: <https://docs.github.com/en/rest/quickstart?apiVersion=latest>' +
        '\n:arrow_right: <https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=latest>' +
        '\n:arrow_right: <https://docs.github.com/en/rest/issues/issues?apiVersion=latest>',
        'Get `/guilds` and `/cipher` working.',
        'Create `/verify` command.',
        'Make `/ban` command to store better information on bans.'
      ];
      const embedToDo = new EmbedBuilder()
        .setTitle( 'Development Roadmap for bot:' )
        .setColor( '#FF00FF' )
        .setTimestamp()
        .setFooter( { text: client.user.tag } );

      arrToDo.forEach( item => {
          embedToDo.addFields( { name: '\u200B', value: item, inline: false } );
      } );
      message.reply( { embeds: [ embedToDo ] } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './commands/admin/roadmap.js' ), errObject.stack ); }
  }
};