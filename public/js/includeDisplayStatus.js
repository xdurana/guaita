//alert('maximizedObtenidodelObjetoPrefs:'+maximized);
  var prefs = new _IG_Prefs();
  var maximized=prefs.getBool("maximized");

function applyDisplayStatus()
{
  //alert('maximized en apply:'+maximized);

  if (maximized)
  {
    _gel("styleDisplayMsg").innerHTML=MAXIM_MSG;
    //_gel("imgDesplega").style.display='none';
    //_gel("imgPlega").style.display='block';
    _gel("styleDisplayMsg").className='minim';
    
    //hacer visible todos los divs
    _gel('divMaximizedPart').style.display='block';
    
    try
    {
     _gel('divMaximizedPartMov').style.display='none';
    
    }
    catch(ex) {}
    try
    {
    _gel('divMaximizedPartNoticia').style.display='none';
    }
    catch(ex) {}
    
  } 
  else
  {

    _gel("styleDisplayMsg").innerHTML=MINIM_MSG;
    //_gel("imgDesplega").style.display='block';
    //_gel("imgPlega").style.display='none';    
    _gel("styleDisplayMsg").className='maxim';
    //ocultar todos los divs menos el primero
    _gel('divMaximizedPart').style.display='none';
     
    try {
    _gel('divMaximizedPartMov').style.display='inline';
  	}
    catch(ex) {}
    
    try {
    
      _gel('divMaximizedPartNoticia').style.display='block';
  	}
    catch(ex) {}
    
    
  }  
  _IG_AdjustIFrameHeight();
}

function toggleDisplayStatus()
{
  //maximized=(maximized=='true')?'false':'true';
  //dump();
  
  maximized=!maximized;
  
  //try
  //{
   prefs.set('maximized',maximized);
  //}
  //catch (ex) {} 
  applyDisplayStatus();
}

