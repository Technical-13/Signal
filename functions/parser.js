const client = require( '..' );
const config = require( '../config.json' );
const discord = require( 'discord.js' );
const objTimeString = require( '../jsonObjects/time.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );
const modData = { name: 'parser', type: 'functions' };
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.name + '.js' );

module.exports = ( rawString, obj = { author: null, guild: null, interaction: null, member: null, uptime: null, useLang: null, user: null } ) => {
  try {
    const interaction = ( obj.interaction ?? null );
    const { channel, guild: iGuild, locale, options, user: iUser } = ( interaction ?? { channel: null, guild: null, locale: null, options: null, user: null } );
    const author = ( obj.author ? obj.author : ( iUser ?? null ) );
    const member = ( obj.member ?? null );
    const guild = ( obj.guild ? obj.guild : ( iGuild ?? ( member ? member.guild : null ) ) );
    const useLang = ( obj.useLang ?? options?.getString( 'language' ) ?? locale ?? guild?.preferedLocale ?? 'en-US' );
    const uptime = ( obj.uptime ? obj.uptime : null );
    // /* Something just came up that is time sensative, adding these to the parser is going to have to wait. */
    // const targetChannel = ( options?.getChannel( 'channel' ) ?? null );
    // const targetGuild = ( options?.getString( 'guild' ) ?? null );
    const geocacher = ( options?.getUser( 'discord-user' ) ?? null );
    const taggee =  ( options?.getUser( 'taggee' ) ?? null );
    const user = ( obj.user ?? null );
    const ageUnits = { getDecades: true, getYears: true, getMonths: true, getWeeks: true, getDays: true, getHours: false, getMinutes: false };
    const { user: bot, guilds, ownerId, users, ws } = ( client ?? { bot: null, guilds: null, ownerId: config.botOwnerId, users: null, ws: null } );

    const transclusions = {
      '{{bot.owner.ping}}': '<@' + ownerId + '>',
      '{{bot.version.djs}}': 'v' + discord.version,
      '{{bot.version.node}}': process.version
    };
    const notAvailable = {};
    if ( bot ) {
      transclusions[ '{{bot.age}}' ] = duration( Date.now() - bot.createdTimestamp, ageUnits );
      transclusions[ '{{bot.guilds}}' ] = guilds.cache.size.toLocaleString( useLang );
      transclusions[ '{{bot.latency}}' ] = Math.round( ws.ping ).toLocaleString( useLang );
      transclusions[ '{{bot.members}}' ] = users.cache.size.toLocaleString( useLang );
      transclusions[ '{{bot.name}}' ] = bot.displayName;
      transclusions[ '{{bot.owner.name}}' ] =  users.cache.get( ownerId ).displayName;
      transclusions[ '{{bot.ping}}' ] = '<@' + bot.id + '>';
      transclusions[ '{{bot.since}}' ] = bot.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{bot.servers}}' ] = guilds.cache.size.toLocaleString( useLang );
      transclusions[ '{{bot.users}}' ] = users.cache.size.toLocaleString( useLang );
      transclusions[ '{{bot.uptime}}' ] = duration( client.uptime, uptime );
    }
    else {
      notAvailable[ '{{bot.age}}' ] = 'bot';
      notAvailable[ '{{bot.guilds}}' ] = 'bot';
      notAvailable[ '{{bot.latency}}' ] = 'bot';
      notAvailable[ '{{bot.members}}' ] = 'bot';
      notAvailable[ '{{bot.name}}' ] = 'bot';
      notAvailable[ '{{bot.owner.name}}' ] = 'bot';
      notAvailable[ '{{bot.ping}}' ] = 'bot';
      notAvailable[ '{{bot.since}}' ] = 'bot';
      notAvailable[ '{{bot.servers}}' ] = 'bot';
      notAvailable[ '{{bot.users}}' ] = 'bot';
      notAvailable[ '{{bot.uptime}}' ] = 'bot';
    }
    if ( author ) {
      transclusions[ '{{author.age}}' ] = duration( Date.now() - author.createdTimestamp, ageUnits );
      transclusions[ '{{author.guild.age}}' ] = duration( Date.now() - author.joinedTimestamp, ageUnits );
      transclusions[ '{{author.name}}' ] = author.displayName;
      transclusions[ '{{author.ping}}' ] = '<@' + author.id + '>';
      transclusions[ '{{author.server.age}}' ] = duration( Date.now() - author.joinedTimestamp, ageUnits );
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
      transclusions[ '{{channel.age}}' ] = duration( Date.now() - channel.createdTimestamp, ageUnits );
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
    if ( geocacher ) {
      transclusions[ '{{geocacher.age}}' ] = duration( Date.now() - geocacher.createdTimestamp, ageUnits );
      transclusions[ '{{geocacher.name}}' ] = geocacher.displayName;
      transclusions[ '{{geocacher.ping}}' ] = '<@' + geocacher.id + '>';
      transclusions[ '{{geocacher.since}}' ] = geocacher.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{geocacher.age}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.name}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.ping}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.since}}' ] = 'geocacher';
    }
    if ( guild ) {
      transclusions[ '{{bot.guild.age}}' ] = duration( Date.now() - guild.members.cache.get( bot.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{bot.guild.since}}' ] = guild.members.cache.get( bot.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{bot.member.age}}' ] = duration( Date.now() - guild.members.cache.get( bot.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{bot.member.since}}' ] = guild.members.cache.get( bot.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{bot.server.age}}' ] = duration( Date.now() - guild.members.cache.get( bot.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{bot.server.since}}' ] = guild.members.cache.get( bot.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{guild.age}}' ] = duration( Date.now() - guild.createdTimestamp, ageUnits );
      transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
      transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
      transclusions[ '{{guild.members}}' ] = guild.members.cache.size.toLocaleString( useLang );
      transclusions[ '{{guild.name}}' ] = guild.name;
      transclusions[ '{{guild.since}}' ] = guild.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{server.age}}' ] = duration( Date.now() - guild.createdTimestamp, ageUnits );
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
      transclusions[ '{{member.age}}' ] = duration( Date.now() - member.user.createdTimestamp, ageUnits );
      transclusions[ '{{member.guild.age}}' ] = duration( Date.now() - member.joinedTimestamp, ageUnits );
      transclusions[ '{{member.name}}' ] = member.displayName;
      transclusions[ '{{member.ping}}' ] = '<@' + member.id + '>';
      transclusions[ '{{member.server.age}}' ] = duration( Date.now() - member.joinedTimestamp, ageUnits );
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
    if ( taggee ) {
      transclusions[ '{{taggee.age}}' ] = duration( Date.now() - taggee.createdTimestamp, ageUnits );
      transclusions[ '{{taggee.name}}' ] = taggee.displayName;
      transclusions[ '{{taggee.ping}}' ] = '<@' + taggee.id + '>';
      transclusions[ '{{taggee.since}}' ] = taggee.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{taggee.age}}' ] = 'taggee';
      notAvailable[ '{{taggee.name}}' ] = 'taggee';
      notAvailable[ '{{taggee.ping}}' ] = 'taggee';
      notAvailable[ '{{taggee.since}}' ] = 'taggee';
    }
    if ( user ) {
      transclusions[ '{{user.age}}' ] = duration( Date.now() - user.createdTimestamp, ageUnits );
      transclusions[ '{{user.name}}' ] = user.displayName;
      transclusions[ '{{user.ping}}' ] = '<@' + user.id + '>';
      transclusions[ '{{user.since}}' ] = user.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{user.age}}' ] = 'user';
      notAvailable[ '{{user.name}}' ] = 'user';
      notAvailable[ '{{user.ping}}' ] = 'user';
      notAvailable[ '{{user.since}}' ] = 'user';
    }

    arrTemplates = rawString.match( /\{\{((?:author|bot|channel|geocacher|guild|member|server|taggee|user)\.[a-z\.]*)\}\}/g );
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