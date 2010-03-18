/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI.History:
  
  Mechanism for manipulating & monitoring the location hash.
  Used for browser back & forward functionality, &c.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var DELAY = 50,
      $window = $(window),
      teardown = null;

  // ========== Polling Loops ==========

  // Choose the best way to poll the browser.
  function setup() {
      // Native support: FF 3.6+, IE 8+, Webkit 528+
      if ('onhashchange' in window) {
          teardown = function() {};
          $window.bind( 'haschange', changed );
      }
      // Fall back to polling.  Older versions of IE and Safari 2.0
      // do not support this.
      else {
          var interval = setInterval(poll(), DELAY);
          teardown = function() {
              clearInterval(interval);
          };
      }
  }

  // Simple polling loop: FF, Safari > 2.0
  function poll() {
      var current = location(),
          probe;

      return function loop() {
          probe = location();
          if( ! _.isEqual( probe, current ) ){
              current = probe;
              changed();
          }
      };
  }

  function start() {
      !teardown && setup();
  }

  function stop() {
      teardown && teardown();
  }
  
  
  
  var history = [],
      registry = {};
    
  function add_location( loc ){
    var location = {
      path: loc,
      time: new Date()
    };
    
    history.push( location );
    return location;
  }
  
  function changed( loc ){
    _( loc || location() ).each(function( l ){
      fire( l.name, l.content );
    });
  }
  
  function fire( evt ){
    if( !registry[ evt ] ) return;
    
    var args = Array.prototype.slice.call( arguments, 1 );
    
    _( registry[ evt ] ).each(function( fn ){
      fn.apply( null, args );
    });
  }
  
  function location(){
    var parts = window.location.hash
      .split( '#' )
      .slice( 1 );
    
    return _( parts ).map(function( item ){
      var named = /^[a-z0-9-]:/.test( item );
      
      return {
        name: named ? item.split(':')[0] : 'b',
        content: named ? item.split(':').slice(1).join(':') : item
      };
    });
  }
  
  function register( prefix, fn ){
    ( registry[ prefix ] || ( registry[ prefix ] = [] ) )
      .push( fn );
    
    return registry;
  }
  
  function handler( a ){
    if( a ){
      window.location.hash = a;
      add_location( a );
    }
    return history;
  }
  
  M.history = handler;
  M.history.listen = register;
  
  $(function(){
    start();
  });

})();
