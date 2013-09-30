
function getWinNm() {
var now = new Date();
var hr = new String(now.getHours());
var mn = new String(now.getMinutes());
var sc = new String(now.getSeconds());
var winNm = hr + mn + sc;
return winNm;
}

function desplegable(identificador,total,msnPendent,tipus){


	if(identificador!=null){

		if(($('llista_' + identificador + '_detalls').style.display=='none') || ($('llista_' + identificador + '_detalls').style.display=='')){

			var totalLi = "llista_" + total;

			$('grupsFiltre').select('li.desplegar').each(function(elm){
				$(elm.id + '_detalls').style.display='none';

				if(tipus=='assignatura'){
					$('div_' + elm.id).removeClassName('actiu');
					$('div_' + elm.id).addClassName('link');
					$(elm.id).removeClassName('ultim');
				}else{
					$(elm.id + '_enlace').removeClassName('actiu');
					$(elm.id + '_enlace').addClassName('link');
				}


				$(elm.id).removeClassName('desplegar');

				if(totalLi == elm.id){
					$(elm.id).className='ultim';
				}
			})

			 _IG_AdjustIFrameHeight();

			if(msnPendent != false){


				$('llista_'+ identificador + '_detalls').style.display='block';
				$('llista_'+ identificador).className='desplegar';


				if(tipus=='assignatura'){
					$('div_llista_'+ identificador).addClassName('actiu');
					$('div_llista_'+ identificador).removeClassName('link');
					$('llista_'+ identificador).addClassName('ultim');
				}else{
					$('llista_'+ identificador + '_enlace').addClassName('actiu');
					$('llista_'+ identificador + '_enlace').removeClassName('link');
				}

				if(identificador == total){
					$('llista_'+ identificador).addClassName('ultim');
				}
			}
		}else{

			$('llista_'+ identificador + '_detalls').style.display='none';

			$('img_llista_' + identificador + '_detalls').alt= DESPLEGA_OBRE;
			$('img_llista_' + identificador + '_detalls').title= DESPLEGA_OBRE;


			$('llista_'+ identificador).removeClassName('desplegar');

			if(tipus=='assignatura'){
				$('div_llista_' + identificador).addClassName('link');
				$('div_llista_' + identificador).removeClassName('actiu');
				$('llista_' + identificador).removeClassName('ultim');
			}else{
				$('llista_'+ identificador + '_enlace').addClassName('link');
				$('llista_'+ identificador + '_enlace').removeClassName('actiu');
			}

			$('img_llista_'+identificador+'_detalls').src= this.url + '/UOC/mc-icons/general/baixa-ico2.png';

			if(identificador == total){
				$('llista_'+ identificador).className='ultim';
			}
		}
	}
	_IG_AdjustIFrameHeight();
}


var opt = 1;
var aImages = null;


function PreloadImages() {

  aImages = new Array(this.url + '/UOC/mc-icons/general/puja-ico2.png',this.url + '/UOC/mc-icons/general/baixa.png',this.url + '/UOC/mc-icons/general/baixa-ico2.png');

  for(var i=0; i < aImages.length; i++) {
  	var img = new Image();
    img.src = aImages[i];
  }
}



function imatgeContent(identificadorID,recargarImagenDesplegable,msnPendent,openDiv,assignatura){


	$('grupsFiltre').select('li.desplegar').each(function(elm){
		if($('img_' + elm.id + '_detalls')!=null && elm.id!='llista_' +identificadorID){
			$('img_' + elm.id + '_detalls').src= this.url + '/UOC/mc-icons/general/baixa.png';
			$('img_' + elm.id + '_detalls').alt= DESPLEGA_OBRE;
			$('img_' + elm.id + '_detalls').title= DESPLEGA_OBRE;
		}
	})

	if(this.opt == 1){
		if(msnPendent){
			document.getElementById('img_llista_' + identificadorID + '_detalls').src= this.aImages[0];
			document.getElementById('img_llista_' + identificadorID + '_detalls').alt=DESPLEGA_TANCA;
			document.getElementById('img_llista_' + identificadorID + '_detalls').title=DESPLEGA_TANCA;
		}

	}else{

		if(msnPendent){

			document.getElementById('img_llista_' + identificadorID + '_detalls').src= this.aImages[1];
			document.getElementById('img_llista_' + identificadorID + '_detalls').alt= DESPLEGA_OBRE;
			document.getElementById('img_llista_' + identificadorID + '_detalls').title= DESPLEGA_OBRE;
			opt = 1;
		}
	}
}




var  stardardHeight =null;

function initRadio(){
	this.stardardHeight = $('grupsFiltre').getHeight() + 28;
}

function imatgeContentRadio(identificador){
  	var closed  = false;
  	var heightTotal = 0;
   	PreloadImages();
  	if(document.getElementById('img_llista_' + identificador + '_detalls').src ==  this.aImages[2]){
  		closed = true;
  	}

  	$('grupsFiltre').select('li.desp').each(function(elm){
		document.getElementById('img_'+ elm.id  + '_detalls').src= this.aImages[1];
		$(elm.id + '_detalls').style.display='none';
		$('div_' + elm.id + '_enlace').removeClassName('actiu');
		$('div_' + elm.id + '_enlace').addClassName('link');
		$(elm.id).removeClassName('desplegar');
	})

	$('grupsFiltre1').select('li.desp').each(function(elm){
		document.getElementById('img_'+ elm.id  + '_detalls').src= this.aImages[1];
		$(elm.id + '_detalls').style.display='none';
		$('div_' + elm.id + '_enlace').removeClassName('actiu');
		$('div_' + elm.id + '_enlace').addClassName('link');
		$(elm.id).removeClassName('desplegar');
	})

  	if(closed){
  		heightTotal = this.stardardHeight +  $('llista_' + identificador + '_detalls').getHeight();
  		document.getElementById('img_llista_' + identificador + '_detalls').src =  this.aImages[0];
		$('llista_'+ identificador + '_detalls').style.display='block';
		$('llista_'+ identificador).addClassName('desplegar');
		$('div_llista_' + identificador + '_enlace').removeClassName('link');
		$('div_llista_' + identificador + '_enlace').addClassName('actiu');
  	}else{

  		document.getElementById('img_llista_' + identificador + '_detalls').src =  this.aImages[2];
  		heightTotal = this.stardardHeight;
  	}


 	/*$('grupsFiltre').setStyle({
 		height: heightTotal + 'px'
	});*/


	/*$('grupsFiltre1').setStyle({
 			height: heightTotal + 'px'
	});
  	*/
	_IG_AdjustIFrameHeight();
}







function desplegableAula(tipo){
  	if(document.getElementById('llista_0_detalls').style.display == 'block'){
  		document.getElementById('llista_0_detalls').style.display = 'none';
  		if(tipo!=null){
  			document.getElementById('img_llista_0_detalls').src = this.url + '/UOC/mc-icons/general/baixa-ico2.png';
  		}else{
  			document.getElementById('img_llista_0_detalls').src = this.aImages[1];
  		}
  		$('img_llista_0_detalls').alt=DESPLEGA_OBRE;
  		$('img_llista_0_detalls').title=DESPLEGA_OBRE;
  		$('img_llista_0').addClassName('semilink');
  	}else{
  		document.getElementById('llista_0_detalls').style.display = 'block';
  		document.getElementById('img_llista_0_detalls').src = this.aImages[0];
  		$('img_llista_0_detalls').alt=DESPLEGA_TANCA;
  		$('img_llista_0_detalls').title=DESPLEGA_TANCA;
  		$('img_llista_0').removeClassName('semilink');
  	}
  	_IG_AdjustIFrameHeight();
}



function desplegableFolders(posicion,identificador){

  	if(posicion=='block'){
		$('llista_'+identificador+'_detalls').style.display='none';
  		$('img_llista_'+identificador+'_detalls').src= this.url + '/UOC/mc-icons/general/baixa.png';
  		$('div_llista_enlace_' + identificador).removeClassName('actiu');
  		$('div_llista_enlace_' + identificador).addClassName('link');
  		$('img_llista_' + identificador + '_detalls').alt=DESPLEGA_OBRE;
		$('img_llista_' + identificador + '_detalls').title=DESPLEGA_OBRE;
  	}else if(posicion=='none'){
  		$('llista_'+identificador+'_detalls').style.display='block';
  	  	$('img_llista_'+identificador+'_detalls').src = this.url + '/UOC/mc-icons/general/puja-ico2.png';
  		$('div_llista_enlace_' + identificador).addClassName('actiu');
  		$('div_llista_enlace_' + identificador).removeClassName('link');
	  	$('llista_'+identificador).addClassName('desplegar');
	  	$('img_llista_' + identificador + '_detalls').alt=DESPLEGA_TANCA;
		$('img_llista_' + identificador + '_detalls').title=DESPLEGA_TANCA;
	}
}





