jQuery(document).ready(function(){
    jQuery('a[href^="itpc://"]').click(function(e){
      e.preventDefault();
      console.log('checking...')
         var p = navigator.platform;
      if( p === 'iPad' || p === 'iPhone' || p === 'iPod' || (p.indexOf("Android") != -1) ){
        
document.location= e.currentTarget.href.replace('itpc://', 'feed://');
}else{
  console.log('not ios...')
 document.location = e.currentTarget.href;

//   setTimeout( function()
//   { 
       

// if( p === 'iPad' || p === 'iPhone' || p === 'iPod' ){
    
// }else{
//   console.log('not ios');
//    if( confirm( 'You do not seem to have iTunes installed, do you want to go download it now?'))
//       {
//         window.open('http://www.apple.com/itunes/affiliates/download/');
//       }
// }
     
//   }, 500);
}
  
});
  });