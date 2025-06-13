const client = require( '..' );
const config = require( '../config.json' );
const discord = require( 'discord.js' );
const objTimeString = require( '../jsonObjects/time.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );
const modData = { name: 'parser', type: 'functions' };
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.name + '.js' );

module.exports = async ( rawString, obj = { author: null, guild: null, interaction: null, member: null, uptime: null, useLang: null } ) => {
  try {
    const interaction = ( obj.interaction ?? null );
    const { channel, guild: iGuild, locale, options, user } = ( interaction ?? { channel: null, guild: null, locale: null, options: null, user: null } );
    const author = ( obj.author ? obj.author : ( user ?? null ) );
    const member = ( obj.member ?? null );
    const guild = ( obj.guild ? obj.guild : ( iGuild ?? ( author ? author.guild : ( member ? member.guild : null ) ) ) );
    const useLang = ( obj.useLang ?? options?.getString( 'language' ) ?? locale ?? guild?.preferedLocale ?? 'en-US' );
    const uptime = ( obj.uptime ? obj.uptime : null );
    // /* Something just came up that is time sensative, adding these to the parser is going to have to wait. */
    // const targetChannel = ( options?.getChannel( 'channel' ) ?? null );
    // const targetGuild = ( options?.getString( 'guild' ) ?? null );
    // const targetUser = ( options?.getUser( 'discord-user' ) ?? null );
    const ageUnits = { getDecades: true, getYears: true, getMonths: true, getWeeks: true, getDays: true, getHours: false, getMinutes: false };
    const bot = client.user;

    const transclusions = {
      '{{bot.age}}': await duration( Date.now() - bot.createdTimestamp, ageUnits ),
      '{{bot.guilds}}': client.guilds.cache.size.toLocaleString( useLang ),
      '{{bot.latency}}': Math.round( client.ws.ping ).toLocaleString( useLang ),
      '{{bot.members}}': client.users.cache.size.toLocaleString( useLang ),
      '{{bot.name}}': bot.displayName,
      '{{bot.owner.name}}': client.users.cache.get( client.ownerId ).displayName,
      '{{bot.owner.ping}}': '<@' + client.ownerId + '>',
      '{{bot.ping}}': '<@' + client.id + '>',
      '{{bot.since}}': bot.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) ),
      '{{bot.servers}}': client.guilds.cache.size.toLocaleString( useLang ),
      '{{bot.users}}': client.users.cache.size.toLocaleString( useLang ),
      '{{bot.uptime}}': await duration( client.uptime, uptime ),
      '{{bot.version.djs}}': 'v' + discord.version,
      '{{bot.version.node}}': process.version
    };
    const notAvailable = {};
    if ( author ) {
      transclusions[ '{{author.age}}' ] = await duration( Date.now() - author.createdTimestamp, ageUnits );
      transclusions[ '{{author.guild.age}}' ] = await duration( Date.now() - author.joinedTimestamp, ageUnits );
      transclusions[ '{{author.name}}' ] = author.displayName;
      transclusions[ '{{author.ping}}' ] = '<@' + author.id + '>';
      transclusions[ '{{author.server.age}}' ] = await duration( Date.now() - author.joinedTimestamp, ageUnits );
      transclusions[ '{{author.since}}' ] = author.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{author.user.since}}' ] = author.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{author.age}}' ] = 'author';
      notAvailable[ '{{author.guild.age}}' ] = 'author';
      notAvailable[ '{{author.name}}' ] = 'author';
      notAvailable[ '{{author.ping}}' ] = 'author';
      notAvailable[ '{{author.server.age}}' ] = 'author';
      notAvailable[ '{{author.since}}' ] = 'author';
      notAvailable[ '{{author.user.since}}' ] = 'author';
    }
    if ( author && guild ) {
      transclusions[ '{{author.member.since}}' ] = guild.members.cache.get( author.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{author.member.since}}' ] = 'author';
    }
    if ( channel ) {
      transclusions[ '{{channel.age}}' ] = await duration( Date.now() - channel.createdTimestamp, ageUnits );
      transclusions[ '{{channel.members}}' ] = channel.members.cache.size.toLocaleString( useLang );
      transclusions[ '{{channel.name}}' ] = channel.name;
      transclusions[ '{{channel.since}}' ] = channel.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{channel.topic}}' ] = channel.topic;
    }
    else {
      notAvailable[ '{{channel.age}}' ] = 'channel';
      notAvailable[ '{{channel.members}}' ] = 'channel';
      notAvailable[ '{{channel.name}}' ] = 'channel';
      notAvailable[ '{{channel.since}}' ] = 'channel';
      notAvailable[ '{{channel.topic}}' ] = 'channel';
    }
    if ( guild ) {
      transclusions[ '{{bot.guild.age}}' ] = await duration( Date.now() - guild.members.cache.get( bot.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{bot.guild.since}}' ] = guild.members.cache.get( bot.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{bot.member.age}}' ] = await duration( Date.now() - guild.members.cache.get( bot.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{bot.member.since}}' ] = guild.members.cache.get( bot.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{bot.server.age}}' ] = await duration( Date.now() - guild.members.cache.get( bot.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{bot.server.since}}' ] = guild.members.cache.get( bot.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{guild.age}}' ] = await duration( Date.now() - guild.createdTimestamp, ageUnits );
      transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
      transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
      transclusions[ '{{guild.members}}' ] = guild.members.cache.size.toLocaleString( useLang );
      transclusions[ '{{guild.name}}' ] = guild.name;
      transclusions[ '{{guild.since}}' ] = guild.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{server.age}}' ] = await duration( Date.now() - guild.createdTimestamp, ageUnits );
      transclusions[ '{{server.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
      transclusions[ '{{server.owner.ping}}' ] = '<@' + guild.ownerId + '>';
      transclusions[ '{{server.members}}' ] = guild.members.cache.size.toLocaleString( useLang );
      transclusions[ '{{server.name}}' ] = guild.name;
      transclusions[ '{{server.since}}' ] = guild.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{bot.guild.age}}' ] = 'guild';
      notAvailable[ '{{bot.guild.since}}' ] = 'guild';
      notAvailable[ '{{bot.member.age}}' ] = 'guild';
      notAvailable[ '{{bot.member.since}}' ] = 'guild';
      notAvailable[ '{{bot.server.age}}' ] = 'guild';
      notAvailable[ '{{bot.server.since}}' ] = 'guild';
      notAvailable[ '{{guild.age}}' ] = 'guild';
      notAvailable[ '{{guild.owner.name}}' ] = 'guild';
      notAvailable[ '{{guild.owner.ping}}' ] = 'guild';
      notAvailable[ '{{guild.members}}' ] = 'guild';
      notAvailable[ '{{guild.name}}' ] = 'guild';
      notAvailable[ '{{guild.since}}' ] = 'guild';
      notAvailable[ '{{server.age}}' ] = 'guild';
      notAvailable[ '{{server.owner.name}}' ] = 'guild';
      notAvailable[ '{{server.owner.ping}}' ] = 'guild';
      notAvailable[ '{{server.members}}' ] = 'guild';
      notAvailable[ '{{server.name}}' ] = 'guild';
      notAvailable[ '{{server.since}}' ] = 'guild';
    }
    if ( member ) {
      transclusions[ '{{member.age}}' ] = await duration( Date.now() - member.user.createdTimestamp, ageUnits );
      transclusions[ '{{member.guild.age}}' ] = await duration( Date.now() - member.joinedTimestamp, ageUnits );
      transclusions[ '{{member.name}}' ] = member.displayName;
      transclusions[ '{{member.ping}}' ] = '<@' + member.id + '>';
      transclusions[ '{{member.server.age}}' ] = await duration( Date.now() - member.joinedTimestamp, ageUnits );
      transclusions[ '{{member.since}}' ] = guild.members.cache.get( member.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{member.user.since}}' ] = member.user.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{member.age}}' ] = 'member';
      notAvailable[ '{{member.guild.age}}' ] = 'member';
      notAvailable[ '{{member.name}}' ] = 'member';
      notAvailable[ '{{member.ping}}' ] = 'member';
      notAvailable[ '{{member.server.age}}' ] = 'member';
      notAvailable[ '{{member.since}}' ] = 'member';
      notAvailable[ '{{member.user.since}}' ] = 'member';
    }

    arrTemplates = rawString.match( /\{\{((?:author|bot|channel|guild|member|server)\.[a-z\.]*)\}\}/g );
    var parsed = rawString;
    if ( arrTemplates ) {
      arrTemplates.forEach( template => {
        if ( transclusions[ template ] ) { parsed = parsed.replace( template, transclusions[ template ] ); }
        else if ( notAvailable[ template ] ) { parsed = parsed.replace( template, '*(unknown ' + notAvailable[ template ] + ')*' ); }
        else {
          parsed = parsed.replace( template, '[*' + template + '*](<' + config.issueRepo + '/issues/new?labels=enhancement&template=feature_request.md&title=' + encodeURIComponent( 'Please add ' + template + ' to ' + strScript ) + '>)' );
          console.log( 'Someone tried to transclude %s, search for a GitHub feature request:\n %s/issues?q=%s', chalk.bold.red( template ), config.issueRepo, encodeURIComponent( 'Please add ' + template + ' to ' + strScript ) );
        }
      } );
    }

    return parsed;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};