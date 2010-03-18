/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  Key Commands:
  
  Handles the registering of key commands, and watching
  for events relevant to them.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var mac = /Mac/i.test( navigator.platform ),
      Ctrl = mac ? 'metaKey' : 'ctrlKey',
      Alt = 'altKey',
      Shift = 'shiftKey';
  
  var registry = {};
  
  function clean_command( raw ){
    var order = _([ 'ctrl', 'alt', 'shift' ]);
    
    return raw.split('+')
      .sort(function( a, b ){
        a = order.indexOf( a ) || 3;
        b = order.indexOf( b ) || 3;
        return b - a;
      })
      .join('+')
      .replace(/[a-z]+$/, function( s ){
        return s.toUpperCase();
      });
  }

  function register( raw, fn ){
    var cmd = clean_command( raw );
    
    ( registry[ cmd ] || ( registry[cmd] = [] ) )
      .push( fn );
  }
  
  function unregister( cmd, fn ){
    if (!registry[ cmd ])
      return true;
    
    for (var n = 0, len = registry[ cmd ].length; n < len; n++)
      if (registry[ cmd ][ n ] === fn)
        registry[ cmd ].splice( n, 1 );
  }
  
  function down( e ){
    meta( e );
    
    var character = String.fromCharCode( e.keyCode ),
        cmd = ( e[ Ctrl ] ? 'ctrl+' : '') +
              ( e[ Alt ] ? 'alt+' : '') +
              ( e[ Shift ] ? 'shift+' : '') +
              character;
    
    if ( registry[ cmd ] )
      for (var n = 0, len = registry[ cmd ].length; n < len; n++)
        registry[cmd][n]( e );
  }
  
  function up( e ){
    meta( e );
  }
  
  function meta( evt, val ){
    ctrl = evt[ Ctrl ];
    alt = evt[ Alt ];
    shift = evt[ Shift ];
  }
  
  $(document).keydown( down );
  $(document).keyup( up );
  $(window).blur(function(){ ctrl = shift = alt = false; });
  
  M.bind_key_command = register;
  M.unbind_key_command = unregister;
  
})();