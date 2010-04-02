/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  UI.Modal:
  
  Deals with matters of the heart, and of the modal.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  M.load_template( 'modal' );
  
  var mac = /Mac/i.test( navigator.platform ),
      modals = [],
      genie_out, genie_in;
  
  function modal( options ){
    var opts = $.extend( {
      os: mac ? 'mac' : 'pc',
      headless: ( (typeof options === 'undefined') || ! ('title' in options) ),
      resizable: true,
      content: '',
    }, options );
    
    var elem = $( M.templates.modal( opts ) ),
        position = {x:0, y:0};
    
    $( opts.content ).appendTo( elem.find( '.inner' ));
    
    elem.find( '.modal-close' ).click( function( e ){
      e.preventDefault();
      genie( elem );
    });
    
    elem.drag(
      function move( e ){
        elem.css({
          left: e.pageX - this.mouse_offset.x,
          top: e.pageY - this.mouse_offset.y
        });
      }
    );
    
    elem.find( '.modal-resize' ).drag(
      function move( e ){
        var w = e.pageX - position.left + this.mouse_offset.x,
            h = e.pageY - position.top + this.mouse_offset.y;
        elem.css({
          width: w < 200 ? 200 : w,
          height: h < 60 ? 60 : h 
        });
      },
      function start( e ){
        e.stopPropagation();
        position = elem.offset();
      }
    );

    return elem.appendTo( 'body' );
  }
  
  M.ui.modal = modal;
  
  
  
  
  
  
  function genie( el ){
    var box = el,
        box_size = 360,
        w = box.width(),
        h = box.height();
    box.children().fadeOut( 140 );
    
    var bg_con =
      $('<div class="genie_container" />')
        .hide()
        .css({ width: w, height: h })
        .appendTo( box );

    var paper = Raphael( bg_con[0], w, h ),
        shape = paper.path( genie_out ).attr({
                fill: 'rgb(17,17,17)',
                opacity: 0.9,
                stroke: null,
                'stroke-width': 0
              });
    shape.scale( w / box_size, h / box_size, 0, 0 );
    
    box.css({ background:'transparent', boxShadow:'none', MozBoxShadow:'none', WebkitBoxShadow:'none' });
    bg_con.show();
    
    shape.animate({ path: genie_in }, 260, '>' );
    setTimeout( function(){
      bg_con.fadeOut( 120, function(){
        box.remove();
      });
    }, 90 );
  }
  
  genie_out = "M0,357c0,1.656,1.343,3,3,3h353.917c1.656,0,3-1.344,3-3L360,3c0-1.657-1.344-3-3-3H3 C1.343,0,0,1.343,0,3V357z";
  
  genie_in = "M10.269,33.276c0,0,6.093-3.084,6.231-9.609S8.181,10.119,7.07,8.916	C5.196,6.694,5.265,5.861,8.458,7.712c2.036,0.74,13.543,11.731,17.708,9.788c4.165-1.943,5.661-4.35,5.661-4.35 C29.653,8.522,6.827,5.989,6.283,6s-0.81,0.417-1.087,0.879C4.918,7.342,4.097,29.826,10.269,33.276z";

})();
