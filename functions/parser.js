const client = require( '..' );
const config = require( '../config.json' );
const discord = require( 'discord.js' );
const objTimeString = require( '../jsonObjects/time.json' );
const chalk = require( 'chalk' );
const duration = require( './duration.js' );
const modData = { name: 'parser', type: 'functions' };
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.name + '.js' );
const dispNames = ( dLang ) => { return new Intl.DisplayNames( [ dLang ], { type: 'language' } ); };
const objDefaults = { author: null, channel: null, command: null, guild: null, interaction: null, member: null, respMsg: null, uptime: null, useLang: null, user: null };
const getDebugString = ( thing ) => {
  if ( thing === null ) { return 'null'; }
  else if ( Array.isArray( thing ) ) { return '{ object-Array: { length: ' + thing.length + ' } }'; }
  else if ( Object.prototype.toString.call( thing ) === '[object Date]' ) { return '{ object-Date: { ISOstring: ' + thing.toISOString() + ', value: ' + thing.valueOf() + ' } }'; }
  else if ( typeof( thing ) != 'object' ) { return thing; }
  else {
    let objType = 'object-' + thing.constructor.name;
    let objId = ( thing?.id ?? 'undefined' );
    let objName = ( thing?.displayName ?? thing?.globalName ?? thing?.name ?? 'undefined' );
    return '{ ' + objType + ': ' + ( objType === 'object-Object' ? Object.keys( thing ) : '{ id: ' + objId + ', name: ' + objName + objSize + ' }' ) + ' }';
  }
};

module.exports = ( rawString, obj = objDefaults, debug = false ) => {
  try {
    if ( debug ) {
      const preAuthor = getDebugString( obj.author );
      const preChannel = getDebugString( obj.channel );
      const preCommand = getDebugString( obj.command );
      const preGuild = getDebugString( obj.guild );
      const preInteraction = getDebugString( obj.interaction );
      const preMember = getDebugString( obj.member );
      const preRespMsg = getDebugString( obj.respMsg );
      const preUptime = getDebugString( obj.uptime );
      const preUseLang = getDebugString( obj.useLang );
      const preUser = getDebugString( obj.user );
      const preProcessed = { rawString: rawString, obj: { author: preAuthor, channel: preChannel, command: preCommand, guild: preGuild, interaction: preInteraction, member: preMember, respMsg: preRespMsg, uptime: preUptime, useLang: preUseLang, user: preUser } };
      console.warn( modData.type + '/' + modData.name + '.js recieved: %o', preProcessed );
    }
    const interaction = ( obj.interaction ?? { channel: null, command: null, commandId: null, commandName: null, guild: null, guildLocale: null, locale: null, options: null, user: null } );
    const { channel: iChannel, command: iCommand, commandId, commandName, guild: iGuild, guildLocale, locale, options, user: iUser } = interaction;
    const author = ( obj.author ?? iUser ?? null );
    const channel = ( obj.channel ?? iChannel ?? null );
    const command = ( obj.command ?? iCommand ?? ( commandId && commandName ? { id: commandId, name: commandName } : null ) );
    const member = ( obj.member ?? null );
    const guild = ( obj.guild ?? iGuild ?? member?.guild ?? null );
    const respMsg = ( obj.respMsg ?? null );
    const uptime = ( obj.uptime ?? null );
    const user = ( obj.user ?? null );
    const authorLang = ( locale ?? 'en-US' );
    const authorLangName = dispNames( authorLang ).of( authorLang );
    const guildLang = ( guild?.preferedLocale ?? guildLocale ?? 'en-US' );
    const guildLangName = dispNames( guildLang ).of( guildLang );
    const useLang = ( obj.useLang ?? options?.getString( 'language' ) ?? locale ?? guildLang );
    const useLangName = dispNames( useLang ).of( useLang );
    const geocacher = ( options?.getUser( 'discord-user' ) ?? null );
    const taggee = ( options?.getUser( 'taggee' ) ?? respMsg?.author ?? null );
    const { user: bot, guilds, ownerId, users, ws } = ( client ?? { bot: null, guilds: null, ownerId: config.botOwnerId, users: null, ws: null } );
    const ageUnits = { getDecades: true, getYears: true, getMonths: true, getWeeks: true, getDays: true, getHours: false, getMinutes: false };
    if ( debug ) {
      const prcAuthor = getDebugString( author );
      const prcChannel = getDebugString( channel );
      const prcCommand = getDebugString( command );
      const prcGeocacher = getDebugString( geocacher );
      const prcGuild = getDebugString( guild );
      const prcMember = getDebugString( member );
      const prcTaggee = getDebugString( taggee );
      const prcUser = getDebugString( user );
      const processed = { author: prcAuthor, channel: prcChannel, command: prcCommand, geocacher: prcGeocacher, guild: prcGuild, member: prcMember, authorLang: authorLang, useLang: useLang, guildLang: guildLang, taggee: prcTaggee, user: prcUser };
      console.warn( modData.type + '/' + modData.name + '.js processed options: %o', processed );
    }

    const transclusions = {
      '{{bot.owner.ping}}': '<@' + ownerId + '>',
      '{{bot.version.djs}}': 'v' + discord.version,
      '{{bot.version.node}}': process.version
    };
    const notAvailable = {};
    if ( author ) {
      transclusions[ '{{author.age}}' ] = duration( Date.now() - author.createdTimestamp, ageUnits );
      transclusions[ '{{author.language.code}}' ] = authorLang;
      transclusions[ '{{author.language.name}}' ] = authorLangName;
      transclusions[ '{{author.name}}' ] = author.displayName;
      transclusions[ '{{author.ping}}' ] = '<@' + author.id + '>';
      transclusions[ '{{author.since}}' ] = author.createdTimestamp;
    }
    else {
      notAvailable[ '{{author.age}}' ] = 'author';
      notAvailable[ '{{author.language.code}}' ] = 'author';
      notAvailable[ '{{author.language.name}}' ] = 'author';
      notAvailable[ '{{author.name}}' ] = 'author';
      notAvailable[ '{{author.ping}}' ] = 'author';
      notAvailable[ '{{author.since}}' ] = 'author';
    }
    if ( author && guild ) {
      transclusions[ '{{author.guild.age}}' ] = duration( Date.now() - guild.members.cache.get( author.id ).joinedTimestamp, ageUnits );
      transclusions[ '{{author.member.since}}' ] = guild.members.cache.get( author.id ).joinedAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{author.server.age}}' ] = duration( Date.now() - guild.members.cache.get( author.id ).joinedTimestamp, ageUnits );
    }
    else {
      notAvailable[ '{{author.guild.age}}' ] = 'author';
      notAvailable[ '{{author.member.since}}' ] = 'author';
      notAvailable[ '{{author.server.age}}' ] = 'author';
    }
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
    if ( channel ) {
      transclusions[ '{{channel.age}}' ] = duration( Date.now() - channel.createdTimestamp, ageUnits );
      transclusions[ '{{channel.link}}' ] = '<https://discord.com/channels/' + guild.id + '/' + channel.id + '>';
      transclusions[ '{{channel.members}}' ] = channel.members.size.toLocaleString( useLang );
      transclusions[ '{{channel.name}}' ] = channel.name;
      transclusions[ '{{channel.ping}}' ] = '<#' + channel.id + '>';
      transclusions[ '{{channel.since}}' ] = channel.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{channel.topic}}' ] = channel.topic;
    }
    else {
      notAvailable[ '{{channel.age}}' ] = 'channel';
      notAvailable[ '{{channel.link}}' ] = 'channel';
      notAvailable[ '{{channel.members}}' ] = 'channel';
      notAvailable[ '{{channel.name}}' ] = 'channel';
      notAvailable[ '{{channel.ping}}' ] = 'channel';
      notAvailable[ '{{channel.since}}' ] = 'channel';
      notAvailable[ '{{channel.topic}}' ] = 'channel';
    }
    if ( command ) {
      transclusions[ '{{cmd.id}}' ] = command.id;
      transclusions[ '{{cmd.lang.code}}' ] = useLang;
      transclusions[ '{{cmd.lang.name}}' ] = useLangName;
      transclusions[ '{{cmd.name}}' ] = command.name;
      transclusions[ '{{command.id}}' ] = command.id;
      transclusions[ '{{command.language.code}}' ] = useLang;
      transclusions[ '{{command.language.name}}' ] = useLangName;
      transclusions[ '{{command.name}}' ] = command.name;
    }
    else {
      notAvailable[ '{{cmd.id}}' ] = 'command';
      notAvailable[ '{{cmd.lang.code}}' ] = 'command';
      notAvailable[ '{{cmd.lang.name}}' ] = 'command';
      notAvailable[ '{{cmd.name}}' ] = 'command';
      notAvailable[ '{{command.id}}' ] = 'command';
      notAvailable[ '{{command.language.code}}' ] = 'command';
      notAvailable[ '{{command.language.name}}' ] = 'command';
      notAvailable[ '{{command.name}}' ] = 'command';
    }
    if ( geocacher ) {
      transclusions[ '{{geocacher.age}}' ] = duration( Date.now() - geocacher.createdTimestamp, ageUnits );
      transclusions[ '{{geocacher.name}}' ] = geocacher.displayName;
      transclusions[ '{{geocacher.ping}}' ] = '<@' + geocacher.id + '>';
      transclusions[ '{{geocacher.language.code}}' ] = useLang;
      transclusions[ '{{geocacher.language.name}}' ] = useLangName;
      transclusions[ '{{geocacher.since}}' ] = geocacher.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{geocacher.age}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.name}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.ping}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.language.code}}' ] = 'geocacher';
      notAvailable[ '{{geocacher.language.name}}' ] = 'geocacher';
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
      transclusions[ '{{guild.language.code}}' ] = guildLang;
      transclusions[ '{{guild.language.name}}' ] = guildLangName;
      transclusions[ '{{guild.link}}' ] = '<https://discord.com/channels/' + guild.id + '>';
      transclusions[ '{{guild.owner.name}}' ] = guild.members.cache.get( guild.ownerId ).displayName;
      transclusions[ '{{guild.owner.ping}}' ] = '<@' + guild.ownerId + '>';
      transclusions[ '{{guild.members}}' ] = guild.members.cache.size.toLocaleString( useLang );
      transclusions[ '{{guild.name}}' ] = guild.name;
      transclusions[ '{{guild.since}}' ] = guild.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
      transclusions[ '{{server.age}}' ] = duration( Date.now() - guild.createdTimestamp, ageUnits );
      transclusions[ '{{server.language.code}}' ] = guildLang;
      transclusions[ '{{server.language.name}}' ] = guildLangName;
      transclusions[ '{{server.link}}' ] = '<https://discord.com/channels/' + guild.id + '>';
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
      notAvailable[ '{{guild.language.code}}' ] = 'guild';
      notAvailable[ '{{guild.language.name}}' ] = 'guild';
      notAvailable[ '{{guild.link}}' ] = 'guild';
      notAvailable[ '{{guild.owner.name}}' ] = 'guild';
      notAvailable[ '{{guild.owner.ping}}' ] = 'guild';
      notAvailable[ '{{guild.members}}' ] = 'guild';
      notAvailable[ '{{guild.name}}' ] = 'guild';
      notAvailable[ '{{guild.since}}' ] = 'guild';
      notAvailable[ '{{server.age}}' ] = 'guild';
      notAvailable[ '{{server.language.code}}' ] = 'guild';
      notAvailable[ '{{server.language.name}}' ] = 'guild';
      notAvailable[ '{{server.link}}' ] = 'guild';
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
      transclusions[ '{{taggee.language.code}}' ] = useLang;
      transclusions[ '{{taggee.language.name}}' ] = useLangName;
      transclusions[ '{{taggee.since}}' ] = taggee.createdAt.toLocaleTimeString( useLang, ( useLang === 'en-US' ? objTimeString : null ) );
    }
    else {
      notAvailable[ '{{taggee.age}}' ] = 'taggee';
      notAvailable[ '{{taggee.name}}' ] = 'taggee';
      notAvailable[ '{{taggee.ping}}' ] = 'taggee';
      notAvailable[ '{{taggee.language.code}}' ] = 'taggee';
      notAvailable[ '{{taggee.language.name}}' ] = 'taggee';
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

    arrTemplates = rawString.match( /\{\{((?:author|bot|cmd|command|channel|geocacher|guild|member|server|taggee|user)\.[a-z\.]*)\}\}/g );
    if ( debug ) { console.warn( 'arrTemplates: %o', arrTemplates ); }
    var parsed = rawString;
    if ( arrTemplates ) {
      arrTemplates.forEach( template => {
        if ( debug ) { console.warn( 'template: %o', template ); }
        if ( transclusions[ template ] ) { parsed = parsed.replace( template, transclusions[ template ] ); }
        else if ( notAvailable[ template ] ) { parsed = parsed.replace( template, '(*`unknown ' + notAvailable[ template ] + '`*)' ); }
        else {
          parsed = parsed.replace( template, '[*' + template + '*](<' + config.issueRepo + '/issues/new?labels=enhancement&template=feature_request.md&title=' + encodeURIComponent( 'Please add ' + template + ' to ' + strScript ) + '>)' );
          console.log( 'Someone tried to transclude %s, search for a GitHub feature request:\n %s/issues?q=%s', chalk.bold.red( template ), config.issueRepo, encodeURIComponent( 'Please add ' + template + ' to ' + strScript ) );
        }
      } );
    }
     if ( debug ) { console.warn( 'parsed: %o', parsed ); }
    return parsed;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};