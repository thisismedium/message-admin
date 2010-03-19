/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI.Edit:
  
  This is the content editor UI component. It handles rendering
  an interactive form for editing a content, and common
  widgets for the standard set of types.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var edit = function( opts ){
    return new ep.init( Array.prototype.slice.call( arguments ) );
  };
  
  var ep = edit.prototype = {
    defaults: {
    },
    
    init: function( args ){
      this.guid = M.guid();
      
      var el = $( args[0] ),
          loc = args[1],
          opts = args[2];
      
      if( typeof loc !== 'string' ){
        opts = loc;
        loc = '';  }
      
      this.opts = $.extend( {}, this.defaults, opts );
      
      M.ui.show_panel( this.opts.panel );
      return this;
    }
  };
  ep.init.prototype = ep;
  
  var editors = [];
  function new_edit( item ){
    
  }
  
  function editing( item ){
    var editor = false;
    for( var n = 0, len = editors.length; n < len; n++ )
      if( _.isEqual( editors[ n ].item, item ) )
        editor = editors[ n ];

    return editor;
  }
  
  function dispatch( item ){
    if( typeof item === 'string' )
      db( item ).get(function(){
        dispatch( this );
      });
    
    else if( typeof item === 'object' ){
      var current = editing( item );
      if( current )
        M.ui.show_panel( current.panel );
      else
        edit({
          panel: M.ui.panel({ title: item.title, kind: 'Editor' }),
          item: item
        });
    }
  }
  
  $(function(){
    M.ui.edit = dispatch;
    
    M.history.listen( 'e', function( path ){
      dispatch( path );
    });
  });
  
})();
