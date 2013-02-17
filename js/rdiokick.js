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
      if(!e.target.querySelectorAll || document.location.pathname.indexOf('artist') == -1){
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
    newLink.innerText = 'Shows';
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
    var contentRoot = tabContainer.parentNode.parentNode.parentNode,
        contentParts = contentRoot.childNodes,
        newContent = document.createElement('div'),
        currentContentContainer;

    if(contentParts.length > 0){
      for (var i = contentParts.length - 1; i >= 0; i--) {
        if(contentParts[i] && contentParts[i].classList && contentParts[i].classList.contains('centered_content')){
          currentContentContainer = contentParts[i];
        }
      };
    }

    if(currentContentContainer){
      currentContentContainer.style.display = 'none';
      newContent.className = 'rdiokick-content';
      currentContentContainer.parentNode.appendChild(newContent);
      app.fetchConcertData(newContent);
    }
  },
  restoreTabContent: function(tabContainer){
    var rdioKickContent = document.querySelectorAll('.rdiokick-content')[0];
    if(rdioKickContent){
      rdioKickContent.previousElementSibling.style.display = 'block';
      rdioKickContent.parentNode.removeChild(rdioKickContent);

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
    }

  },
  fetchConcertData: function(el) {
    var artistName = document.location.pathname.match(/\/artist\/([\w-]*)\//)[1].replace('_', ' '),
        encodedArtistName = encodeURIComponent(artistName),
        eventsUrl = 'http://api.jambase.com/search?band='+encodedArtistName+'&apikey=jmnknzgsn9xu3t9upcjrut23',
        req = new XMLHttpRequest(),
        getTabContent = function(callback) {
          var req = new XMLHttpRequest(),
              el;

          req.open("GET", chrome.extension.getURL('templates.html'), true);
          req.onload = function(e) {
            var template;
            el = document.createElement('div');
            el.innerHTML = e.target.response;
            callback(el.querySelectorAll('#tab_template')[0].innerHTML);
          }
          req.send(null);
        };

    req.open("GET", eventsUrl, true);
    req.onload = function (e) {
      var events = e.target.responseXML.querySelectorAll('event'),
          result = { events: [] },
          monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (var i = 0; i < events.length; i++) {
        var eventDate;
        if(events[i].querySelector('event_date')){
          eventDate = new Date(events[i].querySelector('event_date').textContent);
          eventDate = monthNames[eventDate.getMonth()] + ' ' + eventDate.getDate() + ', ' + eventDate.getFullYear();
        }
        
        result.events.push({
          event_date  : eventDate,
          // event_id    : (events[i].querySelector('event_id') || {})['textContent'],
          event_url   : (events[i].querySelector('event_url') || {})['textContent'],
          // artist_name : (events[i].querySelector('artist_name') || {})['textContent'],
          ticket_url  : (events[i].querySelector('ticket_url') || {})['textContent'],
          // venue_id    : (events[i].querySelector('venue_id') || {})['textContent'],
          // venue_zip   : (events[i].querySelector('venue_zip') || {})['textContent'],
          venue_name  : (events[i].querySelector('venue_name') || {})['textContent'],
          venue_city  : (events[i].querySelector('venue_city') || {})['textContent'],
          venue_state : (events[i].querySelector('venue_state') || {})['textContent']
        });
      }
      getTabContent(function(template){
        el.innerHTML = Mustache.render(template, result);
      });
    }
    req.send(null);
  }
}
app.init();
