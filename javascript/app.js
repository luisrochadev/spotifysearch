// Self envoking function! once the document is ready, bootstrap our application.
// We do this to make sure that all the HTML is rendered before we do things 
// like attach event listeners and any dom manipulation.  
(function(){
  $(document).ready(function(){
    bootstrapSpotifySearch();
  })
})();

/**
  This function bootstraps the spotify request functionality.
*/
function bootstrapSpotifySearch(){

  var userInput, searchUrl, results;
  var outputArea = $(".spospo");

  $('#spotify-q-button').on("click", function(){
      var spotifyQueryRequest;
      spotifyQueryString = $('#spotify-q').val();
      searchUrl = "https://api.spotify.com/v1/search?type=artist&q=" + spotifyQueryString;

      // Generate the request object
      spotifyQueryRequest = $.ajax({
          type: "GET",
          dataType: 'json',
          url: searchUrl
      });

      // Attach the callback for success 
      // (We could have used the success callback directly)
      spotifyQueryRequest.done(function (data) {
        var artists = data.artists;

        // Clear the output area
        outputArea.html('');

        // The spotify API sends back an arrat 'items' 
        // Which contains the first 20 matching elements.
        // In our case they are artists.
        artists.items.forEach(function(artist){
          var artistLi = $("<div class=\"collapsible-header scroller\">" +  artist.name + "</div>" + "<div class=\"collapsible-body\">" + "</div>" );
          artistLi.attr('data-spotify-id', artist.id);
          outputArea.append(artistLi);

          artistLi.click(displayAlbumsAndTracks);
        });
        $('.scroller').click(function (event) {
          event.preventDefault();
          $('.spospo').scrollView();
        });
      });

      // Attach the callback for failure 
      // (Again, we could have used the error callback direcetly)
      spotifyQueryRequest.fail(function (error) {
        console.log("Something Failed During Spotify Q Request:")
        console.log(error);
      });
  });
}


/* YOU MAY WANT TO CREATE HELPER FUNCTIONS OF YOUR OWN */
/* THEN CALL THEM OR REFERENCE THEM FROM displayAlbumsAndTracks */
/* THATS PERFECTLY FINE, CREATE AS MANY AS YOU'D LIKE */
function albumGet(artistId) {
  var searchUrl = 'https://api.spotify.com/v1/artists/' + artistId + '/albums';
  var albumPromise = $.ajax({
          type: "GET",
          dataType: 'json',
          url: searchUrl
    });

  return albumPromise;
}

function albumStats(albumId) {
  var searchUrl = 'https://api.spotify.com/v1/albums/' + albumId;
  var albumPromise = $.ajax({
          type: "GET",
          dataType: 'json',
          url: searchUrl
    });

  return albumPromise;
}

function albumProc(allAlbums) {
  var albumObject = {};  
  var albumPromises = [];

  for(var counter = 0; counter < allAlbums.items.length; counter++) {
    
    var albumId = allAlbums.items[counter].id;
    var albumTitle = allAlbums.items[counter].name;


    var albumPromise = albumStats(albumId);
    albumPromises.push(albumPromise);
  }

  return $.when.apply($, albumPromises);
}




/* COMPLETE THIS FUNCTION! */
function displayAlbumsAndTracks(event) {

  albumGet($(event.target).attr('data-spotify-id'))
  .then(albumProc)
  .done(function() {

    var albumObject = {};
    for(var counter = 0; counter < arguments.length; counter ++) {
      var data = arguments[counter][0];
      albumObject[data.name] = {};
      albumObject[data.name].releaseDate = data.release_date;
      albumObject[data.name].tracks = data.tracks.items.map(function(track){
        return track.name;
      });
    }

    console.log(albumObject);

    var appenderizer = $('.spospo');
    appenderizer.html('');
    
    for(albumTitle in albumObject) {
      var albumDiv = appenderizer.append('<div class=\'scroll\'>');
      
      albumDiv.append('<h5>' + albumTitle + '</h5>' +    ' Released on:  ' + albumObject[albumTitle].releaseDate)
        .append('<ol type=\"1\">');

        for(var counter = 0; counter < albumObject[albumTitle].tracks.length; counter++) {
          var track = albumObject[albumTitle].tracks[counter];
          albumDiv.append('<li>' + track + '</li>');
        }
    }
  });
}


$.fn.scrollView = function () {

  return this.each(function () {
    $('html, body').animate({
      scrollTop: $(this).offset().top
    }, 500);
  });
};


