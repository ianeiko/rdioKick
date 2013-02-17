goog = {};
goog.dom = {};
goog.dom.getAncestor = function(
    element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  // Reached the root of the DOM without a match
  return null;
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return goog.dom.getAncestor(element,
      function(node) {
        return (!tagName || node.nodeName == tagName) &&
               (!opt_class || (node.classList && node.classList.contains(opt_class)));
      }, true);
};

app = {
  init: function(){
    document.addEventListener('DOMNodeInserted', function(e){
      if(!e.target.querySelectorAll){
        return;
      }
      var newTabContainers = e.target.querySelectorAll('.tabs');
      if(newTabContainers && newTabContainers.length > 0){
        var rdioTab = newTabContainers[0].querySelectorAll('.rdiokick-tab');
          if(rdioTab.length < 1){
            app.createTabs(newTabContainers[0]);
          }
      }
    });
  },
  createTabs: function(tabContainer){
    var lastTab = tabContainer.querySelectorAll('.tab.last')[0],
      newTab = document.createElement('div'),
      newLink = document.createElement('a');

    // modify last tab
    if(lastTab){
      lastTab.classList.remove('last');
    }

    // create and append new tab
    newLink.innerText = 'Concerts';
    newLink.href = '#';
    newTab.className = 'tab rdiokick-tab last';
    newTab.appendChild(newLink);
    tabContainer.appendChild(newTab);

    // listen for tab clicks
    tabContainer.addEventListener('click', function(e){
      var tab = goog.dom.getAncestorByTagNameAndClass(e.target, null, 'tab');

      if(tab && tab == newTab){
        app.setTabAsActive(newTab, tabContainer);
      }else if(tab){
        app.restoreTabContent(tabContainer);
      }
      return false;
    });
  },
  setTabAsActive: function(tab, tabContainer){
    // update nav item
    var activeTabs = tabContainer.querySelectorAll('.tab.selected');
    if(activeTabs.length > 0){
      for (var i = activeTabs.length - 1; i >= 0; i--) {
        if(activeTabs[i].classList.contains('selected')){
          activeTabs[i].classList.remove('selected');
          activeTabs[i].classList.add('not-selected');
        }
      };
    }

    tab.classList.add('selected');

    // hide current tab content
    var contentRoot = tabContainer.parentNode.parentNode.parentNode;
      sectionHeader = contentRoot.querySelectorAll('.section_header')[0],
      currentTabContent = sectionHeader.parentNode,
      newContent = document.createElement('div'),
      newSectionHeader =  document.createElement('div');

    currentTabContent.style.display = 'none';
    newContent.className = 'rdiokick-content';
    newSectionHeader.className = 'section_header clearfix';
    newSectionHeader.innerText = 'RdioKick';
    newContent.appendChild(newSectionHeader);
    currentTabContent.parentNode.appendChild(newContent);
    app.fetchConcertData(newContent);
  },
  restoreTabContent: function(tabContainer){
    var rdioKickContent = document.querySelectorAll('.rdiokick-content')[0];
    if(rdioKickContent){
      rdioKickContent.previousElementSibling.style.display = 'block';
      rdioKickContent.parentNode.removeChild(rdioKickContent);
    }

    var activeTabs = tabContainer.querySelectorAll('.tab.selected');
    if(activeTabs.length > 0){
      for (var i = activeTabs.length - 1; i >= 0; i--) {
        activeTabs[i].classList.remove('selected');
      };
    }

    var tabsToRestore = tabContainer.querySelectorAll('.tab.not-selected');
    if(tabsToRestore.length > 0){
      for (var i = tabsToRestore.length - 1; i >= 0; i--) {
        tabsToRestore[i].classList.remove('not-selected');
        tabsToRestore[i].classList.add('selected');
      };
    }

  },
  fetchConcertData: function(el){
    var artistName = document.location.pathname.match(/\/artist\/(\w*)\//)[1].replace('_', ' '),
        encodedArtistName = encodeURIComponent(artistName),
        eventsUrl = 'http://api.jambase.com/search?band='+encodedArtistName+'&apikey=jmnknzgsn9xu3t9upcjrut23',
        req = new XMLHttpRequest();

    req.open("GET", eventsUrl, true);
    req.onload = function (e) {
      var events = e.target.responseXML.querySelectorAll('event');
      for (var i = 0; i < events.length; i++) {
        _event = {
          event_date  : (events[i].querySelector('event_date') || {})['event_date'],
          event_id    : (events[i].querySelector('event_url') || {})['event_url'],
          event_url   : (events[i].querySelector('event_id') || {})['event_id'],
          artist_name : (events[i].querySelector('artist_name') || {})['textContent'],
          ticket_url  : (events[i].querySelector('ticket_url') || {})['ticket_url'],
          venue_id  : (events[i].querySelector('venue_id') || {})['venue_id'],
          venue_name  : (events[i].querySelector('venue_name') || {})['venue_name'],
          venue_city  : (events[i].querySelector('venue_city') || {})['venue_city'],
          venue_state  : (events[i].querySelector('venue_state') || {})['venue_state'],
          venue_zip  : (events[i].querySelector('venue_zip') || {})['venue_zip']
        }
        el.innerText += JSON.stringify(_event)
      }
    }
    req.send(null);
  }
}
app.init();
