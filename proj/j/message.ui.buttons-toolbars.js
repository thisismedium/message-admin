/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI Buttons & Toolbars:
  
  Set of standard buttons & toolbars for use in Panels.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  
  var button = M.ui.button,
      control = M.ui.button,
      toolbar = M.ui.toolbar;
      
  // ----- Buttons ----- //  
  button( 'save', {
    markup: '<button>Save</button>',
    position: 'right',
    click: function(){
      this.panel.save();
    }
  });
  
  button( 'save-close', {
    markup: '<button>Save & Close</button>',
    position: 'right',
    click: function(){
      var kore = this.panel;
      this.panel.save(function(){
        kore.panel.close.call( kore );
      });
    }
  });
  
  button( 'close', {
    markup: '<button>Close</button>',
    position: 'left',
    click: function(){
      this.panel.close();
    }
  });
  
  button( 'new-item', function(){
    var options = [],
        btn,
        dropdown,
        timer,
        change = function(){};
    
    function adjust(){
      dropdown.empty();
      dropdown.css({ top: 24 , width: 'auto' });
      _( options ).each(function( option ){
        $( '<li>' + option + '</li>' )
          .appendTo( dropdown )
          .mousedown( function( e ){
            e.preventDefault();
          })
          .mouseup( select )
          [ 0 ].val = option;
      });
    }
    
    function select( e ){
      really_hide();
      change( e.target.val );
    }
    
    function hide(){
      timer = setTimeout( really_hide, 300 );
    }
    
    function really_hide(){
      dropdown.stop( true ).hide();
      btn.removeClass( 'active' );
    }
    
    function cancel(){
      clearTimeout( timer );
    }
    
    function show( e ){
      cancel();
      e.preventDefault();
      btn.addClass( 'active' );
      dropdown.fadeIn( 96 );
    }
    
    return {
      markup: '<div class="menu"><button class="light">New <span class="down-arrow">&darr;</span></button></div>',
      position: 'left',
      click: function(){},
      setup: function( cbks, initial ){
        this.elem = $( this.markup ).appendTo( this.container );
        btn = this.elem.find( 'button' );
        dropdown = $( '<ul class="dropdown"></ul>' ).appendTo( this.elem ).hide();
        btn.mousedown( show );
        btn.hover( cancel, hide );
        dropdown.hover( cancel, hide );
        adjust();
        return this;
      },
      change: function( fn ){
        change = fn;
        return this;
      },
      options: function(){
        var opts = Array.prototype.slice.call( arguments );
        options.push.apply( options, opts );
        adjust();
        return this;
      }
    };
  });
  
  M.ready( function(){
    $('ul.dropdown li').live( 'mouseover', function(){
      $( this ).addClass( 'hover' );
    });
    
    $('ul.dropdown li').live( 'mouseout', function(){
      $( this ).removeClass( 'hover' );
    });
  });
  
  
  control( 'slider', function(){
    var kore,
        opts = {
          start: function(){},
          move: function(){},
          end: function(){}
        },
        dragging = false,
        offset,
        val = 0, pos = 0, max = 100,
        handle, elem;
        
    function start( e ){
      if( e ) e.preventDefault();
      dragging = true;
      offset = elem.offset().left;
      max = elem.width();
      opts.start( val, pos, max, e );
    }
    
    function move( e ){
      if( e ){
        if( ! dragging ) return;
        e.preventDefault();
        pos = e.pageX - offset;
        pos = pos > max ? max : pos < 0 ? 0 : pos;
        val = pos / max;
      }
      else
        pos = val * max;
      handle.css({ left: pos - 4 });
      opts.move( val, pos, max, e );
    }
    
    function end( e ){
      dragging = false;
      opts.end( val, pos, max, e );
    }
    
    return {
      markup: '<div class="slider"><div class="handle">&bull;</div></div>',
      position: 'right',
      setup: function( cbks, initial ){
        this.callbacks = $.extend( opts, cbks );
        kore = this;
        elem = this.elem = $( this.markup ).appendTo( this.container );
        handle = this.elem.find( '.handle' );
        handle.mousedown( start );
        $( document ).mousemove( move );
        $( document ).mouseup( end );
        val = initial || val;
      },
      val: function( v ){
        val = v;
        move();
      }
    };
  });
  
  
  
  // ----- Toolbars ----- //
  toolbar( 'editor', {
    buttons: [ 'save', 'save-close', 'close' ],
  });

  toolbar( 'browser-main', {
    buttons: [ 'slider', 'new-item' ],
  });
  
})();
