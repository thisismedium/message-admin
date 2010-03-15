

handle (
  a( Folder, function(koto){
    views.browse( koto );
  }),
  
  a( Item, Content, function( item ){
    // views.edit( item );
    
    Edit( item );
    
  }),
  
  a( Response, function( item ){
    
  })
);


view( 'edit', function(){
  template('edit');
  
  vivify( function(){
    
  });
  
});


view( 'browse', function(){
  
  init( function(){
    
  });
  
  build( function(){
    
  });
  
  destroy( function(){
  
  });
  
});


// template( 'edit' )

widget( 'MultiSelect', function(){
  use_for( 'MultiValueField' );
  template( '%input{type: "text", name: "kek"}' );

  
  
  vivify( function(){
    
  });
});


widgets.bind( 'MultiSelet', 'MyWeirdMultiSelect' );


widget: 'MultiValueField'

widget: widget( 'KEK', function(){
  
})







    var about = db( 'about-page' ),      // A page
        help_pages = db( 'HelpPage' ),        // Some pages
        stores = db( '/good-stores' ).children( 'Store' ),    // Some stores
        everything = db.query( '//.' );       // A bunch of items
        
    about.properties;
    //-> { name: 'About Us', kind: 'AboutPage', body: 'Lololololol desu' }
    about.properties.name
    about.properites[ 'name' ]
    
    about.set( 'name', 'Su Tuoba' );
    about.properties.name = 'Su Tuoba';
    
    about.set({ name: 'FACK', body: 'SACK' });
    
    about.has_changed( 'name' )  // true
    about.changes()  // { name: { before: 'About Us', after: 'FACK' } }
    about.original.name // About Us  ??????????????????????
  
    
    about.set( 'name', 'About' ).save();
    
    about.siblings();
    about.siblings( 'AboutPage, HelpPage, contact-page' );
    about.parent();
    about.ancestor( 'about-us' ); // Takes a slug, and walks up tree looking for Folders (or Sites)
    about.ancestors(); // Walks up tree looking for Folders (or Sites)
    
    about_folder.find( 'Page' );
    
    about.save();
    about.update(); // Micro-save for autosavin'
    about.delete();
    
    about.move( '/about-us/' );
    about.move( db('about-us') );
    about.copy( '/not-about-us/' );
    about.copy( db('not-about-us') );
    
    var page = new db[ kind ]( '/about-us/', { name: 'Om Wir', body: 'lololol' } );
    var page = new db[ kind ]( '/about-us/', { title: 'Blah', slug: 'blah' } );
    var folder = new db.Folder( '/' );
    var page = new db.Page(); // Defaults to root
    var page = new db.Page( db( 'about-us' ) );
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    for( i = 0; i < arr.length; i++ )
    
    for( a in array )
      array[ a ]
      
      
    _([1,2,3]).each( function(item){....
    
    _.each( [1,2,3], function(item){....
      
    
    about.each = function( fn ){
      return _(this).each( fn );
    }
    
    
    var db = {
      init: function(){},
      blah: function(){}
    }
    var db2 = new db(); // don't work
    
    var db = function(){};
    db.prototype = {
      init: function(){},
      blah: function(){}
    };
    var db2 = new db(); // do work
    
    
    var db = function(){
      this.init = function(){};
      this.blah = function(){};
    };
    var db2 = new db(); // works too
    
    var db3 = function(){};
    db3.prototype = db;
    db3.prototype.blah = function(){} // only on db3
    
    db3.prototype = db.prototype;
    db3.prototype.blah = function(){} // anything that inherits from db
    
    























