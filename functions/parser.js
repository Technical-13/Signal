const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );

module.exports = async ( rawString, obj = { guild: null, member: null, uptime: null } ) => {
  const member = ( obj.member ? obj.member : null );
  const guild = ( member ? member.guild : ( obj.guild ? obj.guild : null ) );
  const uptime = ( obj.uptime ? obj.uptime : null );
  const bot = client.user;

  const currUptime = await duration( client.uptime,  );
  const transclusions = {
    '{{bot.name}}': bot.displayName,
    '{{bot.owner.name}}': client.users.cache.get( client.ownerId ).displayName,
    '{{bot.owner.ping}}': '<@' + client.ownerId + '>',
    '{{bot.servers}}': client.guilds.cache.size.toLocaleString(),
    '{{bot.users}}': client.users.cache.size.toLocaleString(),
    '{{bot.uptime}}': currUptime
  };
  const notAvailable = {};

  if ( guild ) {
    transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
    transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
    transclusions[ '{{guild.members}}' ] = guild.members.cache.size.toLocaleString();
    transclusions[ '{{guild.name}}' ] = guild.name;
  } else {
    notAvailable[ '{{guild.owner.name}}' ] = 'guild';
    notAvailable[ '{{guild.owner.ping}}' ] = 'guild';
    notAvailable[ '{{guild.members}}' ] = 'guild';
    notAvailable[ '{{guild.name}}' ] = 'guild';
  }

  if ( member ) {
    transclusions[ '{{member.name}}' ] = member.displayName;
    transclusions[ '{{member.ping}}' ] = '<@' + member.id + '>';
  } else {
    notAvailable[ '{{member.name}}' ] = 'member';
    notAvailable[ '{{member.ping}}' ] = 'member';
  }

  arrTemplates = rawString.match( /\{\{((?:bot|guild|member)\.[a-z\.]*)\}\}/g );
  var parsed = rawString;
  if ( arrTemplates.length != 0 ) {
    arrTemplates.forEach( template => {
      if ( transclusions[ template ] ) { parsed = parsed.replace( template, transclusions[ template ] ); }
      else if ( notAvailable[ template ] ) { parsed = parsed.replace( template, '*(unknown ' + notAvailable[ template ] + ')*' ); }
      else {
        parsed = parsed.replace( template, '[*' + template + '*](<https://github.com/Technical-13/' + bot.username + '/issues/new?labels=enhancement&template=feature_request.md&title=' + encodeURI( 'Please add ' + template + ' to transclude.js' ) + '>)' );
        console.log( 'Someone tried to transclude %s, search for a GitHub feature request:\n https://github.com/Technical-13/%s/issues?q=%s', chalk.bold.red( template ), bot.username, encodeURI( 'Please add ' + template + ' to transclude.js' ) );
      }
    } );
  }

  return parsed;
};