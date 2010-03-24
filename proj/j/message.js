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
  - message.connection:  Wrapper around Strophe, DB connection
  - message.db:  Database API, global `db` function
  - message.db.schema:  DB item schema caching/storage
  - message.ui:  UI base; Registries for UI components, `M.ui` namespace
  - message.ui.widgets: Standard UI widgets, used for editor mostly
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
  
  Message.templates = {};
  function load_templates() {
    $('script[type=haml]').each(function(n){
      var kore = $(this),
          name = kore.attr('id') || 'template-'+n;    
      Message.templates[name] = Haml.compile( kore.html() );
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
  
  $(function(){
    load_templates();
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