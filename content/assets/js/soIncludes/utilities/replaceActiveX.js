/*
Replaces ActiveX object tags in response to MS06-014
*/

function replaceActiveX(){
  if (navigator.appName == "Microsoft Internet Explorer"){
    var arrElements = new Array(1);
	arrElements[0] = "object";
	//arrElements[1] = "embed";
	//arrElements[2] = "applet";
    for (n=0; n<arrElements.length; n++){
	  objects = document.getElementsByTagName(arrElements[n]);
	  for (i = 0; i < objects.length; i++ ){
		var oldObject=objects[i];
		
		var newObject="<object style='visibility: visible';"
		
		
		
		if (oldObject.parentNode.childNodes[0].classid != '') {
			newObject = newObject + " classid='" + oldObject.parentNode.childNodes[0].classid + "'";
		}
		
		if (oldObject.parentNode.childNodes[0].codeBase != '') {
			newObject = newObject + " codebase='" + oldObject.parentNode.childNodes[0].codeBase + "'";
		}
		
		if (oldObject.parentNode.childNodes[0].width != '') {
			newObject = newObject + " width='" + oldObject.parentNode.childNodes[0].width + "'";
		}
		
		if (oldObject.parentNode.childNodes[0].height != '') {
			newObject = newObject + " height='" + oldObject.parentNode.childNodes[0].height + "'";
		}
		
		if (oldObject.parentNode.childNodes[0].id != '') {
			newObject = newObject + " id='" + oldObject.parentNode.childNodes[0].id + "'";
		}

		newObject = newObject + ">";
	    
		
		var params=oldObject.childNodes;
		for (var e=0; e<params.length; e++){
		  var new_param=document.createElement('param');
		  new_param.name=params[e].name;
		  new_param.value=params[e].value;
		  newObject+="<param name='" + new_param.name + "' value='" + new_param.value + "'>";
		} //end for params
		
		newObject+="</object>";
		
		oldObject.parentNode.innerHTML=newObject;
		
		
	  } //end for objects
	} //end for arrElements
  } //end if navigator.appName
} //end function
				