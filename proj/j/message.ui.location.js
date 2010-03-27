/*////////////////////////////////////////////////////////////

  ///////   /``\
  // // //   _-`
  // // //  /___
 
  MessageAdmin 2
 
  -----------------------------
  Location Bar:
  
  All UI stuff for the location bar.
 
 
////////////////////////////////////////////////////////////*/
(function(){
  M.ui.location = {};
  
  var path = '/',
      input;
  
  M.ui.location.path = function( p ){
    path = p || '/';
    input.val( path );
  };

  M.ready(function(){
    input = $('#location input[type=text]')
      .val( path );
  });
  
})();