/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI.Context:
  
  Handles aspects of context menus: binding events, updating
  display, calling callbacks
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var button_map = { 0:0, 1:1, 2:2, 'left':0, 'middle':1, 'right':2 };
  
  
  function Menu( opts, elem, change_cbk, position ){
    var options = opts,
        fns = {},
        timer,
        elem = $( elem ),
        change = change_cbk,
        absolute = ( position === 'absolute' );
    
    var dropdown =
      $( '<ul class="dropdown ' + ( absolute ? 'absolute' : 'relative' ) + '"></ul>' )
        .css({ position: 'absolute', zIndex: 32000 })
        .appendTo( 'body' )
        .hide();

    adjust();
    dropdown.hover( cancel, hide );
    if( ! absolute )
      elem.hover( cancel, hide );
    
    function set_options( o ){
      if( ! o ) return options;
      
      dropdown.empty();
      options = o;
      
      function add_items( options, ul, prefix ){
        prefix = prefix || '';
        
        _( options ).each(function( o ){
          if( typeof o === 'string' )
            $('<li class="break" />').appendTo( ul );
          else {
            var label = o[0],
                fn = o[1],
                li = $( '<li>' + label + '</li>' ).appendTo( ul );
            if( typeof fn === 'function' ){
              li
                .mousedown( function( e ){
                  e.preventDefault();
                })
                .mouseup( select );
              li[ 0 ].val = prefix + label;
              fns[ prefix + label ] = fn;
            }
            else {
              li.addClass( 'header' );
              add_items( fn, $('<ul />').appendTo( li ), prefix + label + ' > ' );
            }
          }
        });
      }
      
      add_items( options, dropdown );
    };
    this.options = set_options;
    
    function adjust( e ){
      set_options( options );
      var off = elem.offset(),
          x = e ? e.pageX - 3 : 0,
          y = e ? e.pageY - 3 : 0;
      
      dropdown.css({
        top: absolute ? y : off.top + elem.height() + 3,
        left: absolute ? x : off.left,
        width: 'auto'
      });
    }
    this.adjust = adjust;
    
    function select( e ){
      really_hide();
      fns[ e.target.val ].call( e.target );
      change( e.target.val );
    }
    
    function really_hide(){
      dropdown.stop( true ).hide();
      elem.removeClass( 'active' );
    }
    
    function hide(){
      timer = setTimeout( really_hide, 300 );
    }
    this.hide = hide;
    
    function cancel(){
      clearTimeout( timer );
    }
    this.cancel = cancel;
    
    function show( e, adjust ){
      this.cancel();
      if( e ) e.preventDefault();
      if( adjust ) this.adjust( e );
      elem.addClass( 'active' );
      dropdown.fadeIn( 96 );
    }
    this.show = show;
    
    return this;
  }
  
  
  
  $.fn.menu = function(){
    var args = Array.prototype.slice.call( arguments ),
        opts = {},
        position,
        change = Noop,
        type;
        
    _( args ).each( function( item ){
      if( typeof item === 'object' )
        opts = item;
      else if( typeof item === 'string' ){
        if( typeof type === 'undefined' )
          type = item;
        else
          position = item;
      }
      else if( typeof item === 'function' )
        change = item;
    });
    
    type = type || 'left';
    position = position || 'absolute';

    this.each( function( e ){
      var this_menu = this.menu = new Menu( opts, this, change, position );
      
      function display( e ){
        if( e.button !== button_map[ type ] ) return;
        e.preventDefault();
        e.stopPropagation();
        this_menu.show.call( this_menu, e, true );
      }
      
      if( button_map[ type ] === 2 )
        $( this ).bind( 'contextmenu', display );
      else
        $( this ).mousedown( display );
    });
    
    return this;
  };
  
  M.ready( function(){
    $('ul.dropdown li:not(.header, .break)').live( 'mouseover', function(){
      $( this ).addClass( 'hover' );
    });
    
    $('ul.dropdown li:not(.header, .break)').live( 'mouseout', function(){
      $( this ).removeClass( 'hover' );
    });    
  });
  
})();
