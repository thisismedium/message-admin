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