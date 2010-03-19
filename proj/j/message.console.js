/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___

  MessageAdmin 2

  -----------------------------
  Console:

  Provides all interactivity for the drop-down console. It
  also contains a basic set of commands, and provides a
  command registry for adding new ones.


////////////////////////////////////////////////////////////*/
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
      history_prev( e );
    else if (e.keyCode === 38 )
      history_next( e );
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

  function history_go( direction, e ){
    history_n += direction;
    if( history_n < 0 )
      history_n = 0;
    if( history_n > history_list.length )
      history_n = history_list.length;

    var cmd = ( history_n === 0 ) ? "" : history_list[ history_n - 1 ];

    if( e ) e.preventDefault();
    receptacle.val( cmd );
    receptacle[0].selectionStart = receptacle[0].selectionEnd = 1024;
  }

  function history_prev( e ){
    history_go( -1, e );
  }

  function history_next( e ){
    history_go( +1, e );
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

  add_command( 'schema', 'Queries the MessageDB for a schema by name.',
    function( name ){
      M.db.schema( name, function( expr, version, reply ){
        output( 'schema ' + name,
                '(version: ' + version + ')\n' + prettify_result( reply ) );
      });
    });

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
  
  add_command( 'open', 'Open a path query in main browser.',
    function(){
      var path = Array.prototype.join.call(arguments, ' ');
      M.ui.browse.open( path );
    });

  // ----- DOM Init, &c. ----- //
  M.bind_key_command('ctrl+À', toggle_drawer);

  $(function(){
    drawer = $( M.templates['console']() ).appendTo('#container');
    receptacle = drawer.find('.input input:text');
    history = drawer.find('ul.history');

    $( '#console-resize, #topbar' )
      .mousedown( dragstart );
    $( document )
      .mousemove( move )
      .mouseup( dragend );

    receptacle.keydown( input );

    scrollbar = $('#console-scrollbar')
      .scrollbar({ move: scroll });

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