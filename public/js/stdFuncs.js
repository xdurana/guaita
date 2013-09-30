// STANDARD FUNCTIONS
// by Bernat Comerma

with (navigator)
{
  navigNS = (appName.indexOf("Netscape") > -1 &&  parseFloat(appVersion) >= 4);
  navigIE = (appName.indexOf("Explorer") > -1 &&  parseFloat(appVersion) >= 4);
  navigIE5 = (navigIE && appVersion.indexOf("MSIE 5") > -1);
  navigIE4 = (navigIE && ! navigIE5);
}

//if (navigNS) document.captureEvents(Event.MOUSEDOWN);
//document.onmousedown=checkMouse;

// Evita click derecho del ratón
function checkMouse(oEv){
  if (parent.DEBUG_MODE) return true;
  if (navigNS) {
     if (3 == oEv.which) {
        return false
     }
  } else {
       if (2 == event.button) {
          alert("A g e n d a")
          return false
       }
  }
}

// Returns a random integer within specified bounds   <<<<<<<<<<< ESTA FUNCION NO VA !!!!!!!!
function randomInt(pFrom, pTo)
{
  return randomWinName(); // TEMPORAL
  //
  if (! pFrom) pFrom = 0;
  if (! pTo) pTo = Number.MAX_VALUE;
  return (parseInt(pFrom + ((pTo - pFrom) * Math.random())),10)
}

// Returns a string with a random number that may be used to name a window.
function randomWinName()
{
  var winName = new String(Math.random());
  winName = winName.substr(2);
  return winName;
}

function windowLTWH(pWidth, pHeight, pXchange, pYchange)
{
  var x = (screen.width/2) - (pWidth/2);
  if (pXchange) x += pXchange;
  var y = (screen.height/2) - (pHeight/2);
  if (pYchange) y += pYchange;
  return ("left="+x+",top="+y+",width="+pWidth+",height="+pHeight);
}

// Returns an array with the location search params with option labels as indexes.
function getParams(pStr)
{
  var dls = pStr || document.location.search;
  var idx = dls.indexOf('?');
  var params = [];
  if (idx != -1)
  {
    var pairs = dls.substring(idx+1, dls.length).split('&');
    for (var i=0; i<pairs.length; i++)
    {
      nameVal = pairs[i].split('=');
      params[unescape(nameVal[0])] = unescape(nameVal[1]);
    }
  }
  return params;
}

function getParamsString(maximizado, pStr)
{
  var dls = pStr || document.location.search;
  var idx = dls.indexOf('?');
  var params = "";
  if (idx != -1)
  {
    var pairs = dls.substring(idx+1, dls.length).split('&');
    var primero = true;
    for (var i=0; i<pairs.length; i++)
    {
      nameVal = pairs[i].split('=');
      k = unescape(nameVal[0]);
      valor = unescape(nameVal[1]);
      if (maximizado == true) {
        if (k == "up_maximized") valor = "true";
      }
      if (primero) {
					params += '?';
					primero = false;
				}else {
					params += '&';
 }
 params+= escape(k) +'='+escape(valor);
    }
  }
  return params;
}


// Eliminates leading & trailing blanks
function trim(pStr)
{
  var ini, fin, len = pStr.length;

  if (0 == len) return pStr;

  for (ini = 0; ini < len; ini++)
  {
    if (pStr.charAt(ini) != ' ') break;
  }
  for (fin = len - 1; fin > ini; fin--)
  {
    if (pStr.charAt(fin) != ' ') break;
  }
  return pStr.substring(ini, fin+1)
}

// Receives a Date object returns dd/mm/aaaa
function getStrDate(pDate)
{
  if ("object" != typeof(pDate)) return "";
  return(pDate.getDate() + "/" + (pDate.getMonth()+1) + "/" + pDate.getFullYear());
}

// Receives a Date object returns aaaammdd
function getStrDate_aaaammdd(pDate)
{
  if ("object" != typeof(pDate)) return "";
  var mm = 1 + pDate.getMonth();
  if (mm < 10) mm = "0" + mm;
  var dd = pDate.getDate();
  if (dd < 10) dd = "0" + dd;
  var any = pDate.getFullYear();
  any -= (any>3900) ? 1900 : 0;
  return(any +""+ mm +""+ dd);
}

// Receives "aaaammdd" (optionally hh & mm) returns a Date object
function splitDate(pDate)
{
  var strDate = new String(pDate);
  var hh = parseInt(strDate.substring(8,10), 10);
  if (isNaN(hh)) hh = 0;
  var mm = parseInt(strDate.substr(10), 10);
  if (isNaN(mm)) mm = 0;
  return new Date(parseInt(strDate.substring(0,4),10),(parseInt(strDate.substring(4,6), 10)-1),parseInt(strDate.substring(6,8), 10),hh,mm,0);
}


// Receives a date Object returns "weekDayName , day monthName year"
function strWeekDate(pDate, paFullWeekDays, paFullMonths)
{
  var aFullWeekDays = paFullWeekDays || ["dilluns","dimarts","dimecres","dijous","divendres","dissabte","diumenge"];
  var aFullMonths = paFullMonths || ["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","decembre"];
  return (aFullWeekDays[(pDate.getDay()+6)%7] + ", " + pDate.getDate() + " " + aFullMonths[pDate.getMonth()] + " " + pDate.getFullYear());
}

// Receives a date object returns a Date Object with the first day of that week (MONDAY)
function getFirstDayOfWeek(pDate)
{
  var theDate = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate());
  var weekDay = theDate.getDay();
  if (1 != weekDay)  // Si no es lunes cambia la fecha actual al lunes
  {
    var subtract =  (! weekDay) ? 6 : --weekDay;
    theDate.setDate(theDate.getDate() - subtract);
  }
  return theDate;
}

// Receives dd/mm/aaaa returns "aaaammdd"
function get_YMD_fromFormatedDate(pDate)
{
   var theDate = pDate.split("/");
   var mm = parseInt(theDate[1],10);
   if (mm < 10) mm = "0"+mm;
   var dd = parseInt(theDate[0],10);
   if (dd < 10) dd = "0"+dd;
   return (theDate[2] + "" + mm + "" + dd);
}


// Receives a date object, returns hh:mm
function getHHMM(poDate)
{
  var hh = poDate.getHours();
  if (hh < 10) hh = "0" + hh;
  var mm = poDate.getMinutes();
  if (mm < 10) mm = "0" + mm;
  return hh + ":" + mm;
}

// controls a maximum textarea input amount and updates a small counter with how many characters are left with each keystroke
function textCounter(field, countfield, maxlimit)
{
if (field.value.length > maxlimit) // if too long...trim it!
    field.value = field.value.substring(0, maxlimit);
else // otherwise, update 'characters left' counter
  countfield.value = maxlimit - field.value.length;
}

//Gets 2 dates and returns true when they are equal
function equalDates(pDate1, pDate2)
{
  var b= false;

  b=((pDate1.getFullYear() == pDate2.getFullYear())
       && (pDate1.getMonth()    == pDate2.getMonth())
       && (pDate1.getDate()     == pDate2.getDate()));
  return b;
}

// Returns a Date object with the monday of the first week of the current month
function getMonday(pYear, pMonth)
{
  var wDate   = new Date(pYear, pMonth, 1);
  var tDWeek  = wDate.getDay();                       // Localiza el dia de la semana del primer dia del més actual
  tDWeek  = (! tDWeek) ? 5 : (tDWeek-2);
  tDWeek *= -1;

  if (navigator.appName.indexOf("Explorer")>-1)
    wDate = new Date(pYear, pMonth, tDWeek);  // Primer lunes de la primera semana del mes.
  else
  {
    var aMonth=[31,28,31,30,31,30,31,31,30,31,30,31];
    if (leapYear(pYear))
      aMonth[1] = 29;
    if (! pMonth)
    {
      pMonth = 11;
      pYear--;
    }
    else --pMonth;
    wDate = new Date(pYear, pMonth, aMonth[pMonth] + tDWeek);
  }
  return wDate;
}

function leapYear(any)
{ // anyo bisiesto
	return ((((any % 4) == 0) && !((any % 100) == 0)) || ((any % 400) == 0))
}



function getWinNm() {
var now = new Date();
var hr = new String(now.getHours());
var mn = new String(now.getMinutes());
var sc = new String(now.getSeconds());
var winNm = hr + mn + sc;
return winNm;
}