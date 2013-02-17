app = {
  init: function(){
    var poll = function(){
      try{
        var tabContainer = document.querySelectorAll('.tabs')[0]

        if(tabContainer.innerHTML){ // poll until DOM is ready
          app.createTabs(tabContainer);
        }
      }catch(e){
        setTimeout(function(){
          poll();
        }, 200);
      }
    }
    poll();
  },
  createTabs: function(tabContainer){
    var lastTab = document.querySelectorAll('.tabs .tab.last')[0],
      newTab = document.createElement('div'),
      newLink = document.createElement('a');

    // modify last tab
    if(lastTab){
      lastTab.classList.remove('last');
    }

    // create and append new tab
    newLink.innerText = 'Concerts';
    newLink.href = '#';
    newTab.className = 'tab last';
    newTab.appendChild(newLink);
    tabContainer.appendChild(newTab);

    // listen for clicks
    newLink.addEventListener('click', function(e){
      app.fetchConcertData();
      return false;
    });
  },
  fetchConcertData: function(){
    // use document.location.pathname to get artist's name
    //var artistName = "Patrick Krief",
    var artistName = document.location.pathname.match(/\/artist\/(.*)\//)[1].replace('_', ' '),
        encodedArtistName = encodeURIComponent(artistName);
    jQuery.ajax('http://api.jambase.com/search?band='+encodedArtistName+'&apikey=jmnknzgsn9xu3t9upcjrut23', {
      success: function(data) {
        events = $.xml2json(data)['event'];
        events.each(function(ev){
          console.log({
            'event_date' : ev.event_date,
            'event_id'   : ev.event_id,
            'event_url'  : ev.event_url,
            'ticket_url' : ev.ticket_url,
            'venue_name' : ev.venue.venue_name,
            'venue_city' : ev.venue.venue_city,
          });
        });

        console.log(events);

      }
    });
  }
}
app.init();
