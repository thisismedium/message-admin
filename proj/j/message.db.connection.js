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

  // Items are fetched using a path query.  Items may be changed by
  // sending a changeset that looks like this:
  //
  //   delta = [{ "method": "method-name", "data": { ... } }, ...]
  //
  // The "data" attribute is the JSON object you wish to change.  All
  // methods use the "_path" property to identify which object to act
  // on.  The "method" may be:
  //
  //   create -- create a new object
  //   save -- replace an existing object
  //   remove -- delete an existing object
  //
  // For "create", the path should be "/parent/folder/path/NAME" where
  // "NAME" is the same as the name of the item to create.  If the
  // optional "name" property is also given, it must match.
  //
  // For "delete", all properties are ignored except for "_path"; you
  // don't need to fetch the object before deleting it if you know its
  // name and the path of its parent.
  //
  function query( expr, success, error ){
    return service('get', 'item', expr, success, error);
  }

  function change( changes, success, error ) {
    console.log( changes );
    return service('set', 'item', changes, success, error);
  }

  // Users work the same way items do, but they aren't queryable.
  //
  //   list_users() -- list all users
  //   get_user(name) -- get a user by name
  //   change_users(changes) -- update users with a delta
  //
  // The change_users() delta has the same format as the item delta
  // described above.  Users are identified by "_key" instead of by
  // "_path".
  //
  // A users password is always empty.  When you change_users(), a
  // missing or empty password means to leave the password as it is.
  // Providing a password will change it.
  //
  function list_users( success, error ){
    return get_user('', success, error);
  }

  function get_user( expr, success, error ){
    return service('get', 'user', expr, success, error);
  }

  function change_users( changes, success, error ){
    return service('set', 'user', changes, success, error);
  }

  // Branches work the same way Users do:
  //
  //   list_branches() -- list all branches
  //   get_user(name) -- get a branch by name
  //   change_users(changes) -- update users with a delta
  //
  function list_branches( success, error ){
    return get_branch('', success, error);
  }

  function get_branch( expr, success, error ){
    return service('get', 'branch', expr, success, error);
  }

  function change_branches( changes, success, error ){
    return service('set', 'branch', changes, success, error);
  }

  // A schema is a JSON object that looks like this:
  //
  //   schema('TypeName') ==> {
  //       type: "record",
  //       name: "TypeName",
  //       fields: [{ type: "String", name: "title" }, ...]
  //   }
  //
  // Each entry in fields is an object that describes the field.  The
  // "name" and "type" attributes are required.  Other, optional
  // attributes are:
  //
  //   title -- a friendly title (label) for the field
  //   doc -- help text
  //   default -- a default value
  //   required -- true if this field is required
  //
  function schema( expr, success, error ){
    success = success || Noop;
    error = error || Noop;

    evaluate({
      method: 'schema',
      data: expr,
      success: function( elem, reply ) { success(expr, attr(elem, 'match'), reply); },
      error: function( message ) { error( expr, message ); }
    });
  }

  // ----- Queries ----- //

  function service( type, method, expr, success, error ){
    success = success || Noop;
    error = error || Noop;

    evaluate({
      type: type,
      method: method,
      data: prepare(expr),
      success: function( elem, reply ) { success(expr, reply); },
      error: function( message ) { error( expr, message ); }
    });
  }

  function prepare(data){
      data = data || '';
      return ( typeof data === 'string' ) ?
        data :
        JSON.stringify( data );
  }

  function evaluate( opt ){
    send_iq({
      iq: make_iq(opt.type || 'get', opt.method, opt.data),
      success: function(iq) { iq_response(iq, opt.success); },
      error: function(iq) { iq_error(iq, opt.error); }
    });
  }

  function attr( elem, name ) {
      return elem.attributes['match'].nodeValue;
  }

  function make_iq( type, method, query ) {
    return $iq({ type: type })
        .c(method, { xmlns: 'urn:M' })
        .t(query && Base64.encode(query));
  }

  function iq_response( iq, k ){
    var elem = iq.childNodes[0];
    k(elem, elem.textContent && Base64.decode(elem.textContent));
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

  M.db = {};

  // ----- DOM Ready ----- //
  M.ready(function(){
    connection = strophe({
      url: BOSH,
      rawInput: raw_input,
      rawOutput: raw_output
    });

    connect('user@localhost', 'secret');

    M.db.is_connected = is_connected;
    M.db.connection = connection;
    M.db.query = query;
    M.db.change = change;
    M.db.list_users = list_users;
    M.db.get_user = get_user;
    M.db.change_users = change_users;
    M.db.list_branches = list_branches;
    M.db.get_branch = get_branch;
    M.db.change_branches = change_branches;
    M.db.get_schema = schema;
    M.db.listen = listen;
    M.db.unlisten = unlisten;
  });
})();
