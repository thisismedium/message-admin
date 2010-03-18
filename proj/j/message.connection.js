/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___

  MessageAdmin 2

  -----------------------------
  DB Connection:

  Provides a light wrapper around Strophe, as well as event
  registry for connection events (connected, disconnected, &c.)


////////////////////////////////////////////////////////////*/
(function(){
  var BOSH = 'http://' + window.location.hostname + ':5280/bosh/http-bind',
      connection,
      db_is_connected = false;

  function raw_input( data ){
    M.log('RECV: ' + data, 0);
  }

  function raw_output( data ){
    M.log('SENT: ' + data, 0);
  }

  function connect( jid, pass ){
    connection.connect(jid, pass, connection_update);
  }

  function connection_update( status ){
    if (status === Strophe.Status.CONNECTING)
      connecting();
    else if (status === Strophe.Status.CONNFAIL)
      failed();
    else if (status === Strophe.Status.DISCONNECTING)
      disconnecting();
    else if (status === Strophe.Status.DISCONNECTED)
      disconnected();
    else if (status === Strophe.Status.CONNECTED)
      connected();
  }

  function disconnecting(){
    M.log( 'Disconnecting from Database…' );
    db_event( 'disconnecting' );
  }

  function disconnected(){
    M.log( 'Disconnected.' );
    db_is_connected = false;
    db_event( 'disconnected' );
  }

  function connecting(){
    M.log( 'Connecting to Database…' );
    db_event( 'connecting' );
  }

  function connected(){
    M.log( 'Connected.' );
    db_is_connected = true;
    db_event( 'connected' );
  }

  function failed(){
    M.log( 'Failed to connect to Database.' );
    db_is_connected = false;
    db_event( 'failed' );
  }

  function query( expr, success, error ){
    success = success || function(){};
    error = error || function(){};

    evaluate({
      query: expr,
      success: function( elem, reply ) { success( expr, reply ); },
      error: function( message ) { error( expr, message ); }
    });
  }

  // A schema is a JSON object that looks like this:
  //
  //   schema('TypeName') ==> {
  //       type: "record",
  //       name: "TypeName",
  //       fields: [{ type: "String", name: "title" }, ...]
  //   }
  //
  // Each entry in fields is a dictionary that describes the field.
  // The "name" and "type" attributes are required.  Other, optional
  // attributes are:
  //
  //   title -- a friendly title (label) for the field
  //   doc -- help text
  //   default -- a default value
  //   required -- true if this field is required
  //
  function schema( expr, success, error ){
    success = success || function(){};
    error = error || function(){};

    evaluate({
      method: 'schema',
      query: expr,
      success: function( elem, reply ) { success(expr, attr(elem, 'match'), reply); },
      error: function( message ) { error( expr, message ); }
    });
  }

  // ----- Queries ----- //
  function evaluate( opt ){
    send_iq({
      iq: make_iq(opt.method || 'query', opt.query),
      success: function(iq) { iq_response(iq, opt.success); },
      error: function(iq) { iq_error(iq, opt.error); }
    });
  }

  function attr( elem, name ) {
      return elem.attributes['match'].nodeValue;
  }

  function make_iq( method, query ) {
    return $iq({ type: 'get' })
        .c(method, { xmlns: 'urn:message' })
        .t(Base64.encode(query));
  }

  function iq_response( iq, k ){
    var elem = iq.childNodes[0];
    k(elem, Base64.decode(elem.textContent));
  }

  function iq_error( iq, k ){
    k($(iq).find('text').text());
  }


  // ----- BOSH ----- //
  function send_iq( opt ){
    return connection.sendIQ(
      opt.iq,
      opt.success,
      opt.error || iq_error,
      opt.timeout || 2000
    );
  }

  function iq_error( data ){
    console.error('IQ failed!', data);
  }

  function strophe( settings ){
    return $.extend(new Strophe.Connection(settings.url), settings);
  }


  // ----- Event Binding ----- //
  var registry = {};

  function listen( evt, fn ){
    ( registry[ evt ] || (registry[ evt ] = []) )
      .push( fn );
  }

  function unlisten( evt, fn ){
    if( ! registry[ evt ] ) return;

    var fns = registry[ evt ];
    for( var n = 0, len = fns.length; n < len; n++ )
      if( fns[n] === fn )
        fns.splice( n, 1 );
  }

  function db_event( evt ){
    if( ! registry[ evt ] ) return;

    var fns = registry[ evt ];
    for( var n = 0, len = fns.length; n < len; n++ )
      fns[ n ]();
  }

  function is_connected(){
    return db_is_connected;
  }

  // ----- DOM Ready ----- //
  $(function(){
    connection = strophe({
      url: BOSH,
      rawInput: raw_input,
      rawOutput: raw_output
    });

    connect('user@localhost', 'secret');

    M.db.is_connected = is_connected;
    M.db.connection = connection;
    M.db.query = query;
    M.db.schema = schema;
    M.db.listen = listen;
    M.db.unlisten = unlisten;
  });
})();
