(function( $ ){
  var main = opener;
  if( ! opener ){ 
    alert( 'Cannot contact the Mothership!\n\nAbort!' );
    window.close();
    return false;
  }
  
  var resize_timer,
      move_timer;
  window.RERERE = function( w, h, duration, easing ){
    window.focus();
    if( ! duration )
      return window.resizeTo( w, h );
    else {
      var duration = duration,
          time = new Date().getTime(),
          w_wd = $( window ).width(),
          w_ht = $( window ).height(),
          n_wd = w,  n_ht = h,
          easing = easing || 'swing';
          
      $.easing.easeInExpo( false, time > 0 ? time : 0, 0, 500, 1900 );
      
      clearInterval( resize_timer );
      resize_timer = setInterval( function(){
        var elapsed = new Date().getTime() - time;
        
        window.moveTo( 0, 0 );
        window.resizeTo(
          $.easing[ easing ]( false, elapsed, w_wd, n_wd - w_wd, duration ),
          $.easing[ easing ]( false, elapsed, w_ht, n_ht - w_ht, duration )
        );
        
        if( elapsed > duration )
          clearInterval( resize_timer );
        
      }, 30 );
    }
  };
  
  window.retitle = function( name ){
    document.title = 'Message &mdash; ' + name;
  };
  
  $( function(){
    $( document ).click( function(){
      RERERE( 800, 500, 3000, 'easeInOutExpo' );
    })
  });
  
})( jQuery );