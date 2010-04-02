window.Noop = function(){};
/////////////////////////////////////
// Drag                            //
/////////////////////////////////////
(function( $ ){ 
  $.fn.drag = function( move, start, end ){
    this.each( function( n, item ){
      var el = $( this ),
          move_cbk = move || Noop,
          start_cbk = start || Noop,
          end_cbk = end || Noop;
      
      el.mousedown( function( e ){
        e.preventDefault();
        this.dragging = true;
        var o = el.offset();
        this.mouse_offset = { x: e.pageX - o.left, y: e.pageY - o.top };
        start_cbk.call( this, e );
      });
      
      $( document ).mousemove( function( e ){
        if( ! el[0].dragging ) return;
        move_cbk.call( el[0], e );
      });
      
      $( document ).mouseup( function( e ){
        if( ! el[0].dragging ) return;
        el[0].dragging = false;
        end_cbk.call( el[0], e );
      });
      
    });
  };
})( jQuery );



/////////////////////////////////////
// Context Menus                   //
/////////////////////////////////////
(function(){
  function absorb( e ){
    e.stopPropagation();
    e.preventDefault();
  }
  
  function click( e ){
    var text = $( this ).text(),
        kore = $( this );
    this.old_val = text;
    
    if( ! kore.closest( '.selected' ).size() ) return;
    
    setTimeout(function(){
      var field = $( kore[0].in_place_type ) 
        .val( text )
        .appendTo( kore.empty() )
        .bind( 'click dblclick mousedown', absorb )
        .keydown(function( e ){
          if( e.keyCode === 13 ) // Return
            this.blur();
          else if( e.keyCode === 27 ) // Esc
            cancel.call( this, e );
        })
        .blur( blur );
  
      field[0].focus();
      field[0].selectionStart = 0;
      field[0].selectionEnd = 32000;
    }, 0 );
  }
  
  function cancel( e ){
    this.nochange = true;
    this.blur.call( this, e, true );
  }
  
  function blur( e, nochange ){
    var val = $( this ).val(),
        parent = $( this ).parent();
    parent.empty().text( val || parent[0].old_val );
    
    if( ( val !== parent[0].old_val ) &&
        ( ! this.nochange ) )
      parent[0].change_cbk.call( this, val );
    
    delete this.nochange;
  }
  
  $.fn.in_place = function(){
    var opts = arguments[0];
    this.each( function( n, item ){
      var type = opts.type || ( item.tagName.toLowerCase() === 'span' ? 'short' : 'long' ),
          elem = ( type === 'short' ? '<input type="text" />' : '<textarea />' ),
          kore = this;
      this.in_place_type = elem;
      $( this ).mousedown( click );
      this.edit = function(){
        click.call( kore );
      };
      this.change_cbk = opts.change || Noop;
    });
  };
})(jQuery);


/////////////////////////////////////
// Scrollbar                       //
/////////////////////////////////////
(function($){
  $.fn.scrollbar = function scrollbar(opts) {
    return this.each(function(n, item) {
      var cbks, down, drag_off, draggin, handle, kore, max_pos, move, pos, trck_off, up, update, val;
      kore = $(item);
      handle = kore.find('.handle:first').css({
        position: 'absolute',
        top: 0
      });
      cbks = opts;
      draggin = false;
      drag_off = 0;
      val = 0;
      pos = 0;
      max_pos = kore.height() - handle.height();
      trck_off = 0;
      down = function down(e) {
        e.preventDefault();
        draggin = true;
        trck_off = kore.offset().top;
        drag_off = e.pageY - trck_off - pos;
        if (cbks.start && typeof cbks.start === 'function') {
          return cbks.start(e);
        }
      };
      move = function move(e) {
        max_pos = kore.height() - handle.height();
        var nu_val;
        if (!(draggin)) {
          return true;
        }
        e.preventDefault();
        pos = e.pageY - trck_off - drag_off;
        pos = (function() {
          if (pos < 0) {
            return 0;
          } else if (pos > max_pos) {
            return max_pos;
          } else {
            return pos;
          }
        })();
        nu_val = pos / max_pos;
        val = nu_val;
        return update(e);
      };
      up = function up(e) {
        if (!(draggin)) {
          return true;
        }
        e.preventDefault();
        draggin = false;
        if (cbks.end && typeof cbks.end === 'function') {
          return cbks.end(e);
        }
      };
      update = function update(e,evt) {
        handle.css({
          top: pos
        });
        if (!evt && cbks.move && typeof cbks.move === 'function') {
          return cbks.move(e, val);
        }
      };
      item.val = function(newval, evt) {
        val = newval;
        pos = val * max_pos;
        return update(null, evt);
      };
      item.scroll = function scroll(delta) {
        val += delta;
        val = (function() {
          if (val < 0) {
            return 0;
          } else if (val > 1) {
            return 1;
          } else {
            return val;
          }
        })();
        pos = val * max_pos;
        return update();
      };
      $(document).mousemove(move).mouseup(up);
      return handle.mousedown(down);
    });
  };
})(jQuery);