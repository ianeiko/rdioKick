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
				}, 1000);
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
	}
}
app.init();