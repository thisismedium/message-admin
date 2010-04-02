/*///////////////////////////////////////////////////////////////////////////
  
  
  ////////   ///////       ///////
  ////////////////////   //       //
   ///     ///     ///   //       //
   ///     ///     ///          //
   ///     ///     ///       ///
  ////    ////    ////     //
  ////    ////    ////   ////////////
  
  MessageAdmin 2
  
  
  -----------------------------------
  System Map:
  
  - message:  Main; global `M` namespace, GUID, Load in templates
  - message.keys:  Key command registry, Key events
  - message.db.connection:  Wrapper around Strophe, DB connection
  - message.db:  Database API, global `db` function
  - message.db.schema:  DB item schema caching/storage
  - message.ui:  UI base; Registries for UI components, `M.ui` namespace
  - message.ui.context:  Context (right-click) Menu
  - message.ui.widgets:  Standard UI widgets, used for editor mostly
  - message.ui.buttons-toolbars:  Set of Buttons & Toolbars for use in Panels
  - message.ui.modal:  Modal-window-related stuff
  - message.ui.location:  Location bar stuff
  - message.ui.browse:  Content browsing UI
  - message.ui.edit:  Content editing UI
  - message.ui.history:  Monitor/Manipulate URL Hash, back/forward buttons
  - message.console:  Drop-down console UI, console commands
  

///////////////////////////////////////////////////////////////////////////*/







/******* ------------------------------------------------------------
  Main Message object, Templates
 ***/
(function(){
  var Message = window.M = {};
  
  var ready_fns = [];
  M.ready = function( fn ){
    if( fn )
      ready_fns.push( fn );
    else
      _.each( ready_fns, function( fn ){
        fn();
      });
  };
  
  var to_load = [];
  M.load_template = function(){
    to_load.push.apply( to_load, Array.prototype.slice.call( arguments ) );
  };
  
  function add_template( name, raw ){
    Message.templates[ name ] = Haml.compile( raw );
    to_load = _( to_load ).without( name );
    if( to_load.length === 0 )
      M.ready();
  }
  
  Message.templates = {};  
  function load_templates() {    
    $('script[type=haml]').each(function(n){
      var kore = $(this),
          name = kore.attr('id') || 'template-'+n;
      Message.templates[ name ] = Haml.compile( kore.html() );
    });
    
    _.each( to_load, function( name ){
      var name = name;
      $.get( '/j/haml/' + name + '.haml', function( data ){
        add_template( name, data );
      }, 'html' );
    });
  }
  
  var guid_counter = new Date().getTime();
  function guid(){
    return ++guid_counter;
  }
  M.guid = guid;
  
  $.fn.guid = function(){
    this.each(function( i, item ){
      item.guid = item.guid || guid();
    });
    return this.length ? this[0].guid : null;
  };
  
  var to_collapse = new RegExp("[^\\w\u0128-\uFFFF-]+", 'gm');
  M.slugify = function( str ){
    return str
      .toLowerCase()
      .replace( to_collapse, '-' )
      .replace( /-$/, '' );
  };
  
  M.load_template( 'main' );
  
  $(function(){
    load_templates();
  });
  
  M.ready(function(){
    $('body').html( Message.templates['main']() );
    
    $('#location input:text').focus(function(){
      this.selectionStart = this.selectionEnd = 320000;
      $('#location').addClass('focused');
    });
    
    $('#location input:text').blur(function(){
      $('#location').removeClass('focused');
    });
  });

})();