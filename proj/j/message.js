/******* ------------------------------------------------------------
  Main Message object, Templates
 ***/
(function(){
  var Message = window.M = {};
  
  Message.templates = {};
  function load_templates() {
    $('script[type=haml]').each(function(n){
      var kore = $(this),
          name = kore.attr('id') || 'template-'+n;    
      Message.templates[name] = Haml.compile( kore.html() );
    });
  }
  
  $(function(){
    load_templates();
    $('body').html( Message.templates['main']() );
    
    $('#location input:text').focus(function(){
      this.selectionStart = this.selectionEnd = 22;
      $('#location').addClass('focused');
    });
    
    $('#location input:text').blur(function(){
      $('#location').removeClass('focused');
    });
  });

})();


/******* ------------------------------------------------------------
  Key Command Processing
 ***/
(function(){
  
  var mac = /Mac/i.test( navigator.platform ),
      Ctrl = mac ? 'metaKey' : 'ctrlKey',
      Alt = 'altKey',
      Shift = 'shiftKey';
  
  var ctrl = false,
      alt = false,
      shift = false,
      registry = {};
   
  function register( cmd, fn ){
    var cmd = registry[ cmd ] || ( registry[cmd] = [] );
    cmd.push( fn );
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
        cmd = ( ctrl ? 'ctrl+' : '') +
              ( alt ? 'alt+' : '') +
              ( shift ? 'shift+' : '') +
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



/******* ------------------------------------------------------------
  Growlesque Notifications
 ***/
(function(){
  
  function log( msg, p ){
    var priority = ( p === undefined ) ? 2 : p;
    
    if( priority === 3 )
      sticky_bubble( msg );
    else if( priority === 2 )
      bubble( msg );
    else if( priority === 1 )
      console_log( msg );
    else if( priority === 0 )
      return;
  }
  
  function bubble( msg ){
    var bubble = show_bubble( msg );
    
    setTimeout( function(){
      close_bubble( bubble );
    }, 3000 );
    
    return bubble;
  }
  
  function sticky_bubble( msg ){
    return show_bubble( msg );
  }
  
  function show_bubble( msg ){
    var html = M.templates.bubble({ text:msg });
    return $(M.templates.bubble({ text:msg })).appendTo('#bubbles');
  }
  
  function close_bubble( bubble ){
    $( bubble ).fadeOut(100, function(){
      $( this ).remove();
    });
  }
  
  function console_log( msg ){
    if( (typeof console !== undefined) && (typeof console.log !== undefined) )
      console.log( msg );
  }
  
  $(function(){
    $('#bubbles .bubble').live( 'click', function( e ){
      e.preventDefault();
      close_bubble( this );
    });
  });
  
  M.log = log;
})();



/******* ------------------------------------------------------------
  DB Connection
 ***/
(function(){
  var BOSH = 'http://' + window.location.hostname + ':5280/bosh/http-bind',
      connection;

  function raw_input( data ){
    M.log('RECV: ' + data, 0);
  }

  function raw_output( data ){
    M.log('SENT: ' + data, 0);
  }

  function connect( jid, pass ){
    connection.connect(jid, pass, connecting);
  }

  function connecting( status ){
    if (status === Strophe.Status.CONNECTING) {
      M.log('Connecting to Database…');
    } else if (status === Strophe.Status.CONNFAIL) {
      M.log('Failed to connect to Database.');
      failed();
    } else if (status === Strophe.Status.DISCONNECTING) {
      M.log('Disconnecting from Database…');
    } else if (status === Strophe.Status.DISCONNECTED) {
      M.log('Disconnected.');
      disconnected();
    } else if (status === Strophe.Status.CONNECTED) {
      M.log('Connected.');
      connected();
    }
  }
  
  function disconnected(){
    
  }
  
  function connected(){
    
  }
  
  function failed(){
    
  }
  
  function query( expr, success, error ){
    success = success || function(){};
    error = error || function(){};
    
    evaluate({
      query: expr,
      success: function( reply ) { success( expr, reply ); },
      error: function( message ) { error( expr, message ); }
    });
  }


  // ----- Queries ----- //
  function evaluate( opt ){
    send_iq({
      iq: query_iq(opt.query),
      success: function(iq) { query_response(iq, opt.success); },
      error: function(iq) { query_error(iq, opt.error); }
    });
  }

  function query_iq( query ){
    return $iq({ type: 'get' })
        .c('query', { xmlns: 'urn:message' })
        .t(Base64.encode(query));
  }

  function query_response( iq, k ){
    k(Base64.decode(iq.childNodes[0].textContent));
  }

  function query_error( iq, k ){
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
  
  $(function(){
    connection = strophe({
      url: BOSH,
      rawInput: raw_input,
      rawOutput: raw_output
    });
    
    connect('user@localhost', 'secret');
    M.db.connection = connection;
    M.db.query = query;
  });
})();


/******* ------------------------------------------------------------
 db API
 ***/
(function(){
  
  var db = window.db = M.db = function(){
    return new db.fn.init( arguments );
  };
  
  db.fn = db.prototype = (function(){
    
    // Helpers &c.
    
    return {
      init: function( args ){
        this.loaded = false;
        
        var q = this.base_query = args[0];
        if( /^[^\/]/.test( q ) )
          q = '//' + q;
        
        this.query = q;
        this.intial_query = q;
        return this;
      },
      
      
      // ----- JS Object methods ----- //
      properties: {},
      original: {},
      original_data: {},
    
      set: function(){
        
      },
    
      changes: function(){
      
      },
    
      has_changed: function( key ){
      
      },
    

      // ----- Query-building methods ----- //
      parent: function( selector ){
        this.query += '/parent::' + ( selector || '*' );
        return this;
      },
      
      ancestor: function( selector ){
        this.query += '/ancestors::' + ( selector || '*' ) + '[0]';
        return this;
      },
      
      ancestors: function(){
        this.query += '/ancestors::*';
        return this;
      },
      
      siblings: function( selector ){
        this.query += '/parent::' + ( selector || '*' );
        return this;
      },
      
      find: function( selector ){
        this.query += '/descendent::' + ( selector || '*' );
        return this;
      },
      
      
      // ----- Remote methods ----- //
      get: function( cbk ){
        var kore = this,
            callback = cbk;
        
        M.db.query( this.query, function( expr, results ){
          var data = kore.parse_response.call( kore, results );
          if( callback )
            callback.call( kore, data );
        });
        
        return this;
      },
      
      each: function( cbk ){
        var kore = this,
            callback = cbk;
        
        M.db.query( this.query, function( expr, results ){
          var data = kore.parse_response.call( kore, results );
          
          if( callback )
            for( var n = 0, len = data.length; n < len; n++ )
              callback.call( data[ n ], n, data[ n ], kore );
        });

        return this;
      },
      
      parse_response: function( resp ){
        var data;
        try {
          data = eval( resp );
          
          Array.prototype.splice.call( this, 0, this.length );
          Array.prototype.push.apply( this, data );
          
          this.data = data.slice();
          this.original_data = data.slice();
        }
        catch( e ) {
          data = 'Error parsing database response.';
          M.log( data, 1 );
          M.log( e.message, 1 );
        }
        finally {
          this.query = this.original_query;
          return data;
        }
      },
      
      save: function(){
        
      },
      
      update: function(){
        
      },
      
      remove: function(){
        
      },
      
      move: function(){
        
      },
      
      copy: function(){
        
      }
    };
  })();
  
  db.fn.init.prototype = db.fn;
  
})();



/******* ------------------------------------------------------------
 Base UI
 ***/
(function(){
  
  M.ui = {
    widgets: {},
    toolbars: {},
    buttons: {}
  };
  
  function widget( kind, build, destroy ){
    widgets[ kind ] = { build: build, destroy: destroy };
  }
  
  function toolbar( name, opts ){
    var bar = {};
    
    M.ui.toolbars[ name ] = bar;
  }
  
  function button( name, fook ){
    
  }
  
  M.ui.widget = widget;
  M.ui.toolbar = toolbar;
  M.ui.button = button;
})();


/******* ------------------------------------------------------------
 UI - Browse
 ***/
(function(){
  // 
  // var browse = function browse( opts ){
  //   return new browse.init( opts, arguments );
  // };
  // 
  // var bp = browse.prototype = {
  //   init: function( opts ){
  //     return this;
  //   }
  // };
  // bp.init.prototype = bp;
  // 
  // M.ui.browse = new browse.init()
})();


/******* ------------------------------------------------------------
 UI - Edit
 ***/
(function(){
  
  
})();



/******* ------------------------------------------------------------
 Console
 ***/
(function(){
  var open = false,
      drawer,
      drawer_size = 200,
      receptacle,
      history,
      cmds = {};
  
  function toggle_drawer( e ){
    if( e ) e.preventDefault();
    open = !open;
    
    if( open ){
      $('#container').stop(true).animate({ top: drawer_size }, function(){
        $('#console-resize').show();
        $('#topbar').css({ cursor: 'row-resize' });
      });
      receptacle.focus();
    }
    else {
      $('#container').stop(true).animate({ top:0 });
      $('#console-resize').hide();
        $('#topbar').css({ cursor: 'default' });
    }
  }
  
  
  // ----- Console UI ----- //
  var tab_base = '',
      completing = false,
      tab_suggestions = [],
      tab_n = 0;
  
  var history_list = [],
      history_n = 0;
      
  function input( e ){
    if( e.keyCode === 9 )
      receptacle.val( tabcomplete( e ) );
    else if( e.keyCode === 40 )
      history_prev();
    else if (e.keyCode === 38 )
      history_next();
    else
      completing = false;
    
    if( e.keyCode !== 13 )
      return;
    
    e.preventDefault();
    command( receptacle.val() );
    receptacle.val('');
  }
  
  function tabcomplete( e ){
    if( e ) e.preventDefault();
    
    if( !completing ){
      tab_base = receptacle.val();
      tab_n = 0;
      var regex = new RegExp( '^' + tab_base );
      
      tab_suggestions = _( cmds ).chain()
        .keys()
        .select( function( name ){
          return regex.test( name );
        })
        .value()
        .sort();
    }
    
    else if( ++tab_n >= tab_suggestions.length )
        tab_n = 0;
    
    completing = true;
    return ( tab_suggestions[ tab_n ] || tab_base ) + ' ';
  }
  
  function output( cmd, result ){
    var out = htmlify( result );
    history.append($(
      M.templates.command({ command:cmd, result: out })
    ));
    
    autoscroll();
  }
  
  
  function htmlify( plain ){
    return plain
      .replace( /</gm, '&lt;' )
      .replace( />/gm, '&gt;' )
      .replace( /\n/gm, '<br />\n' )
      .replace( /^\s*/gm, function(s){ 
        return s
          .replace(/\t/gm, '&nbsp;&nbsp;&nbsp;&nbsp;')
          .replace(/ /gm, '&nbsp;')
      });
  }

  
  var scrollbar;
  function autoscroll(){
    var total_h = history[ 0 ].scrollHeight,
        last_h = history.find( 'li.command:last' )[ 0 ].scrollHeight,
        diff = total_h - last_h;
    
    history.animate({ scrollTop: diff }, 96, update_scrollbar );
  }
  
  var dragging = false,
      drag_origin,
      drag_offset,
      max;
  
  function dragstart( e ){
    if( !open ) return;
    
    e.preventDefault();
    dragging = true;
    drag_offset = e.pageY - $('#topbar').offset().top;
    max = $(window).height() - 200;
  }
  
  function move( e ){
    if( !dragging ) return;
    e.preventDefault();
    
    drawer_size = e.pageY - drag_offset;
    if( drawer_size < 60 ) drawer_size = 60;
    if( drawer_size > max ) drawer_size = max;
    
    $( '#console' ).css({ height: drawer_size, top: -drawer_size });
    $( '#container' ).css({ top: drawer_size });
  }
  
  function dragend( e ){
    dragging = false;
  }
  
  function scroll( e, value ){
    var val = Math.round( (history[0].scrollHeight - drawer_size) * value ); 
    history.scrollTop( val + 5 );
  }
  
  function update_scrollbar(){
    var val = history.scrollTop() / ( history[0].scrollHeight - drawer_size + 20)
    scrollbar[0].val( val, true );
  }
  
  function remember( input ){
    history_list.unshift( input );
    history_n = 0;
  }
  
  function history_go( direction ){
    history_n += direction;
    if( history_n < 0 )
      history_n = 0;
    if( history_n > history_list.length )
      history_n = history_list.length;
    
    var cmd = ( history_n === 0 ) ? "" : history_list[ history_n - 1 ];
    receptacle.val( cmd );
  }
  
  function history_prev(){
    history_go( -1 );
  }
  
  function history_next(){
    history_go( +1 );
  }
  
  M.console_output = output;
  
  function command( input ){
    var args = input.split(' '),
        cmd = args.shift();
    
    if( /^\//.test( cmd ) ){
      args.unshift( cmd );
      cmd = 'query';
    }
    
    if( !cmds[ cmd ] )
      output( cmd, 'Command doesn\'t exist.' );
    else
      try {
        cmds[ cmd ][ 0 ].apply( null, args );
      }
      catch( e ){
        M.log( 'Error while executing command `'+input+'`', 1 );
      }
    
    remember( input );
  }
  
  
  // ----- Command Registry ----- //
  function add_command( name, help, fn ){
    cmds[ name.toLowerCase() ] = [ fn, help ];
  }
  
  function alias_command( from, to, help ){
    add_command( to, help, cmds[ from ][ 0 ] );
  }
  
  M.add_command = add_command;
  M.alias_command = alias_command;
  
  
  // ----- Commands ----- //
  function prettify_result( results ){
    var out = [];
    try {
      var data = eval( results );
      out.push( data.length + ' results.\n');
      
      for( var n = 0, t = data.length; n < t; n++ ){
        out.push( '\n' );
        out.push( data[n].title + '\n');
        for( var k in data[n] )
          if( k != 'title' )
            out.push( '  ' + k + ': ' + data[n][k] + '\n');
      }
    }
    catch( e ){
      out = [results];
    }
    return out.join('');
  }
  
  add_command( 'query', 'Queries the MessageDB using the XPath-esque syntax.',
    function( q ){
      M.db.query( q, function( expr, reply ){
        output( 'query ' + q, prettify_result( reply ) );
      });
    });
  
  alias_command( 'query', 'q', 'Alias for `query`.' );
  
  add_command( 'help', 'List all available commands.',
    function(){
      output( 'help', 
        _( cmds ).map( function( etc, name ){
          return name + ':   ' + etc[ 1 ];
        }).join('\n')
      );
    });
  
  add_command( 'new', 'Create a new Item or Folder.',
    function(){
    
    });
  
  add_command( 'js', 'Evaluate some javascript.',
    function(){
      var js = Array.prototype.join.call(arguments, ' ');

      try {
        var result = ( new Function(
          'with( window ){' +
            ( /;$|}$/.test(js) ? js : 'return (' + js + ');' ) +
          '}'
        ))();
        output( 'js '+js, ( result || '' ).toString() );
      }
      catch( e ){
        output( 'js '+js, e.message );
      }
    });
  
  
  // ----- DOM Init, &c. ----- //
  M.bind_key_command('ctrl+À', toggle_drawer);
  
  $(function(){
    drawer = $( M.templates['console']() ).appendTo('#container');
    receptacle = drawer.find('.input input:text');
    history = drawer.find('ul.history');
    
    $( '#console-resize, #topbar' ).mousedown( dragstart );
    $( document )
      .mousemove( move )
      .mouseup( dragend );
    
    receptacle.keydown( input );
    
    scrollbar = $('#console-scrollbar').scrollbar({ move: scroll });
    
    history.hover(
      function(){
        scrollbar.find( '.handle' )
          .stop( true )
          .animate({ opacity:1 }, 120 );
      },
      function(){
        scrollbar.find( '.handle' )
          .stop( true )
          .animate({ opacity:0 }, 260 );      
      });

    drawer.mousewheel( function( e, d ){
      scrollbar[0].scroll( -d / 10 );
    });
  });
  
})();





