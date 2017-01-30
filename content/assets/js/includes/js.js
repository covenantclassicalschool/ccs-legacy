// JavaScript Document

d=document;

function killAnnounce(){
  d.getElementById('fullscreen').style.display='none';
  d.getElementById('screen').style.display='none';
}


function showHide(elementid){ 
  if (d.getElementById(elementid).style.display == 'none'){ 
    d.getElementById(elementid).style.display = '';
  } else { 
    d.getElementById(elementid).style.display = 'none'; 
  } 
}


//getElementsByClassName() Written by Jonathan Snook, http://www.snook.ca/jonathan; Add-ons by Robert Nyman, http://www.robertnyman.com
function getElementsByClassName(oElm, strTagName, strClassName){
  var arrElements = (strTagName == "*" && document.all)? document.all : oElm.getElementsByTagName(strTagName);
  var arrReturnElements = new Array();
  strClassName = strClassName.replace(/\-/g, "\\-");
  var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
  var oElement;
  for(var i=0; i<arrElements.length; i++){
    oElement = arrElements[i];      
    if(oRegExp.test(oElement.className)){
      arrReturnElements.push(oElement);
    }   
  }
  return (arrReturnElements)
}


function launchPlayer(messageID){
  if(playerWin){
	  playerWin.close();
  }
  var playerWin=window.open('/media_player.asp?messageID=' + messageID,playerWin,'width=550,height=450,toolbar=false,resizable=false,menubar=false,scrollbars=false,status=false');
}	

function launchPlayerLarge(messageID,winWidth,winHeight){
  if(playerWin){
	playerWin.close();
  }
  var playerWin=window.open('/media_player.asp?type=large&messageID=' + messageID,playerWin,'width=' + winWidth + ',height=' + winHeight + ',toolbar=false,resizable=false,menubar=false,scrollbars=false,status=false');
}	


function popNewWindow(eventID, type) {
	window.open('/event_detail.asp?id=' + eventID + '&type=' + type, '_blank', 'width=450, height=450, scrollbars=yes, menubar=no');
}

function popEmailWindow(thisHREF,title) {
	window.open('/emailThisPage.asp?href=' + thisHREF + '&title=' + title, '_blank', 'width=450, height=450, scrollbars=no, menubar=no');
}

//sfHover couresty of http://www.htmldog.com (http://www.htmldog.com/articles/suckerfish/dropdowns/)
sfHover = function() {
	var sfEls = d.getElementById("nav").getElementsByTagName("li");
	for (var i=0; i<sfEls.length; i++) {
		sfEls[i].onmouseover=function() {
			this.className+=" sfhover";
		}
		sfEls[i].onmouseout=function() {
			this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
		}
	}
}



window.onload=startUp;

function startUp(){
  if(window.attachEvent){
    //replaceActiveX();
		sfHover();
  }
	if(d.getElementById("standard_login")){
	  bodyOnLoad();
  }
  if(d.getElementById("volunteer_form")){
	  fnInitializeFormElements();
  }
  if(d.getElementById("archives")){
	      hidePageName();
	      podcastButton();
  }  
  if(d.getElementById("features")){
  		$('#features').features({
  			name: 'express8',
  			autoplay: true,
  			delay: 5000,
  			fadeDelay: 500,
  			showPanel: true,
  			showControls: true,
  			showPlayBack: false,
  			thumbControl: true,
			thumbLimit: 7
  		});
  		$('#features.features ul li').css('display', 'block');
  }

  if(d.getElementById("marquee")){
  		$('#marquee').features({
  			name: 'express8',
  			autoplay: true,
  			delay: 5000,
  			fadeDelay: 500,
  			showPanel: true,
  			showControls: true,
  			showPlayBack: false,
  			thumbControl: true
  		});
  		$('#marquee.features ul li').css('display', 'block');
  }

if ($(window).width() < 1024) {
   navSelect();
 $('header li a.toplevel').each(function(){
 if($(this).next('ul').length>0)
 $(this).attr('href','javascript: void(0)');
 })
} 
   

}

function hidePageName(){
  d.getElementById('pageName').style.display = 'none'; 
}

function podcastButton(){
  $("a.podcast").parent('li').addClass("podcastLi");

  $(".podcastLi").mouseover(function() {
	  $("div.podcastList").removeClass("hidden");
  }).mouseout(function(){
	  $("div.podcastList").addClass("hidden");
});
}

function updateName(myName){
  if(myName){
    d.getElementById('staff_name').innerHTML=myName;
  }else{
	d.getElementById('staff_name').innerHTML="Click a photo below to view details";
  }
}


function showStaff(total, obj, source){  
  for(var i=1; i<=total; i++){
	  if(i==obj){
	    d.getElementById('staff' + obj).style.display='';
	    var image="<img src='" + source + "'>";
	    d.getElementById('staff_image' + obj).innerHTML=image;
	  }else{
	    d.getElementById('staff' + i).style.display='none';
	  }
  }
}


function URLencode(sStr) {
  return escape(sStr).replace(/\+/g, '%2C').replace(/\"/g,'%22').replace(/\'/g, '%27');
}

function fileDownload(filePath){
  filePath = URLencode(filePath);
  var fileDownloader=window.open('/file_download_launch.asp?filePath=' + filePath,'fileDialog','width=400,height=300,toolbar=false,resizable=false,menubar=false,scrollbars=false,status=false');
}

/**
 * jQuery.timers - Timer abstractions for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/02/08
 *
 * @author Blair Mitchelmore
 * @version 1.1.2
 *
 **/

jQuery.fn.extend({
	everyTime: function(interval, label, fn, times, belay) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, times, belay);
		});
	},
	oneTime: function(interval, label, fn) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, 1);
		});
	},
	stopTime: function(label, fn) {
		return this.each(function() {
			jQuery.timer.remove(this, label, fn);
		});
	}
});

jQuery.event.special

jQuery.extend({
	timer: {
		global: [],
		guid: 1,
		dataKey: "jQuery.timer",
		regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
		powers: {
			// Yeah this is major overkill...
			'ms': 1,
			'cs': 10,
			'ds': 100,
			's': 1000,
			'das': 10000,
			'hs': 100000,
			'ks': 1000000
		},
		timeParse: function(value) {
			if (value == undefined || value == null)
				return null;
			var result = this.regex.exec(jQuery.trim(value.toString()));
			if (result[2]) {
				var num = parseFloat(result[1]);
				var mult = this.powers[result[2]] || 1;
				return num * mult;
			} else {
				return value;
			}
		},
		add: function(element, interval, label, fn, times, belay) {
			var counter = 0;
			
			if (jQuery.isFunction(label)) {
				if (!times) 
					times = fn;
				fn = label;
				label = interval;
			}
			
			interval = jQuery.timer.timeParse(interval);

			if (typeof interval != 'number' || isNaN(interval) || interval <= 0)
				return;

			if (times && times.constructor != Number) {
				belay = !!times;
				times = 0;
			}
			
			times = times || 0;
			belay = belay || false;
			
			var timers = jQuery.data(element, this.dataKey) || jQuery.data(element, this.dataKey, {});
			
			if (!timers[label])
				timers[label] = {};
			
			fn.timerID = fn.timerID || this.guid++;
			
			var handler = function() {
				if (belay && this.inProgress) 
					return;
				this.inProgress = true;
				if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
					jQuery.timer.remove(element, label, fn);
				this.inProgress = false;
			};
			
			handler.timerID = fn.timerID;
			
			if (!timers[label][fn.timerID])
				timers[label][fn.timerID] = window.setInterval(handler,interval);
			
			this.global.push( element );
			
		},
		remove: function(element, label, fn) {
			var timers = jQuery.data(element, this.dataKey), ret;
			
			if ( timers ) {
				
				if (!label) {
					for ( label in timers )
						this.remove(element, label, fn);
				} else if ( timers[label] ) {
					if ( fn ) {
						if ( fn.timerID ) {
							window.clearInterval(timers[label][fn.timerID]);
							delete timers[label][fn.timerID];
						}
					} else {
						for ( var fn in timers[label] ) {
							window.clearInterval(timers[label][fn]);
							delete timers[label][fn];
						}
					}
					
					for ( ret in timers[label] ) break;
					if ( !ret ) {
						ret = null;
						delete timers[label];
					}
				}
				
				for ( ret in timers ) break;
				if ( !ret ) 
					jQuery.removeData(element, this.dataKey);
			}
		}
	}
});

jQuery(window).bind("unload", function() {
	jQuery.each(jQuery.timer.global, function(index, item) {
		jQuery.timer.remove(item);
	});
});