function init() {

	// must be first
	loadSettings();			
	if (firstUse == 1) {
		$.get("firstusewelcome.html", function( result ) {                    
            $(".first-use-container").html(result);
            $("#firstUseModal").modal('show');
        }, 'html');   		
	}
	//starting beep
	//doubleBeep();	

	moment.locale(locale);	

	now = new Date();
	tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	yesterday = new Date();
	yesterday.setDate(tomorrow.getDate() - 1);
	tanggal = moment().format('D MMMM YYYY');
	tanggalHijri = moment().format('iD iMMMM iYYYY');
	hari = moment().format('dddd');	
	timedifference = now.getTimezoneOffset();
	diffsign = timedifference < 0 ? '+' : '-';

	setPrayerTimes(latlngdata);	
	setSecondBeforeAfter(); 
	setTimeDisplay();
	setNextPrayer();
	setHadist();	

	if (secBefore < 600) {
		// ten minutes before adhan, replace next to active
		$(".jamsholat").find(".active").removeClass("active");
		$(".jamsholat").find(".next").addClass("active");
		$(".jamsholat").find(".next").removeClass("next");
		$(".jamsholat").find(".active").css("color","red");
		$(".jamsholat").find(".active").find(".waktu").addClass("blinking");	
	}
}

function setPrayerTimes(latlngdata) {
	var latlng = latlngdata.split(",");
	var coordinates = new adhan.Coordinates(latlng[0].trim(), latlng[1].trim());		
	var params = adhan.CalculationMethod.Egyptian();

	switch(calculation) {
		case 0:
			params = adhan.CalculationMethod.Egyptian();
			break;
		case 1:
			params = adhan.CalculationMethod.MuslimWorldLeague();
			break;
		case 2:
			params = adhan.CalculationMethod.Karachi();
			break;
		case 3:
			params = adhan.CalculationMethod.UmmAlQura();
			break;
		case 4:
			params = adhan.CalculationMethod.Singapore();
			break;
		case 5:
			params = adhan.CalculationMethod.NorthAmerica();
			break;
		case 6:
			params = adhan.CalculationMethod.Dubai();
			break;
		case 7:
			params = adhan.CalculationMethod.Qatar();
			break;
		case 8:
			params = adhan.CalculationMethod.Kuwait();
			break;
		case 9:
			params = adhan.CalculationMethod.MoonsightingCommittee();
			break;
	}

	params.fajrAngle = fajrAngle;
	params.ishaAngle = ishaAngle;
	params.madhab = madhab=="safii"?adhan.Madhab.Shafi:adhan.Madhab.Hanafi;
	params.adjustments.fajr = minuteadjustment;
	params.adjustments.sunrise = minuteadjustment;
	params.adjustments.dhuhr = minuteadjustment;
	params.adjustments.asr = minuteadjustment;
	params.adjustments.maghrib = minuteadjustment;
	params.adjustments.isha = minuteadjustment;
	prayerTimes = new adhan.PrayerTimes(coordinates, now, params);

	fajrTime = moment(prayerTimes.fajr).format('HH:mm');
	sunriseTime = moment(prayerTimes.sunrise).format('HH:mm');
	dhuhrTime = moment(prayerTimes.dhuhr).format('HH:mm');
	asrTime = moment(prayerTimes.asr).format('HH:mm');
	maghribTime = moment(prayerTimes.maghrib).format('HH:mm');
	ishaTime = moment(prayerTimes.isha).format('HH:mm');
	current = prayerTimes.currentPrayer();		
	next = prayerTimes.nextPrayer();

	if (current == "none") {
		// current is yesterday isha
		var yeterdayPrayerTimes = new adhan.PrayerTimes(coordinates, yesterday, params);	
		current = yeterdayPrayerTimes.nextPrayer();
		currentPrayerTime = yeterdayPrayerTimes.timeForPrayer(next);	
		//current = "isha";
	} else {
		currentPrayerTime = prayerTimes.timeForPrayer(current);
	}

	if (next == "none") {
		// next is tomorrow fajr
		var tomorrowPrayerTimes = new adhan.PrayerTimes(coordinates, tomorrow, params);	
		next = tomorrowPrayerTimes.nextPrayer();
		nextPrayerTime = tomorrowPrayerTimes.timeForPrayer(next);	
		//next = "fajr";	
	} else {			
		nextPrayerTime = prayerTimes.timeForPrayer(next);			
	}	
	
	$("#timezone-gmt").text('GMT' + diffsign + (Math.abs(timedifference)/60));
	$(".subuh").text(fajrTime);
	$(".terbit").text(sunriseTime);
	$(".dzuhur").text(dhuhrTime);
	$(".ashar").text(asrTime);
	$(".maghrib").text(maghribTime);
	$(".isya").text(ishaTime);
	if (locationAddress != null) {
		$("#locationAddress").text("Untuk daerah " + locationAddress.locality + " dan sekitarnya");	
	}
	
	//setTimeDisplay();
	//setNextPrayer();
}

function setSecondBeforeAfter() {
	if (nextPrayerTime != null) {	
		duration = moment(nextPrayerTime).diff(now);	
		secBefore = Math.round(moment.duration(duration)/1000);		
	} else {
		// next prayer is null, is fajr
		secBefore = 3600; // not used anymore
	}

	if (currentPrayerTime != null) {		
		duration = moment(now).diff(currentPrayerTime);	
		secAfter = Math.round(moment.duration(duration)/1000);
	} else {
		// current prayer is null, is isha
		secAfter = 3600; // not used anymore
	}
}

function setTimeDisplay() {
	var jam = moment().format('HH');
	var menit = moment().format('mm');
	var detik = moment().format('ss');
	$("#time-display").text(jam + ":" + menit);
	$("#second-display").text(detik);		
	$("#day-display").text(hari);
	if (detik < 30) {	
		$("#date-display").html(tanggalHijri);	
	} else {
		$("#date-display").html(tanggal);	
	}
}

function setNextPrayer() {	
	$(".waktu-sholat").removeClass("active");
	$(".waktu-sholat").removeClass("next");
	$(".waktu-sholat").removeClass("text-success");
	switch(current) {
	  case "fajr":
	    $(".subuh").parent().addClass("active");
	    $(".terbit").parent().addClass("next");
	    break;
	  case "sunrise":
	    $(".subuh").parent().addClass("text-success");
	    $(".terbit").parent().addClass("active");
	    $(".dzuhur").parent().addClass("next");
	    break;
	  case "dhuhr":
	  	$(".subuh").parent().addClass("text-success");
	  	$(".terbit").parent().addClass("text-success");
	    $(".dzuhur").parent().addClass("active");
	    $(".ashar").parent().addClass("next");
	    break;
	  case "asr":
	  	$(".subuh").parent().addClass("text-success");
	  	$(".terbit").parent().addClass("text-success");
	  	$(".dzuhur").parent().addClass("text-success");
	    $(".ashar").parent().addClass("active");
	    $(".maghrib").parent().addClass("next");
	    break;
	  case "maghrib":
	  	$(".subuh").parent().addClass("text-success");
	  	$(".terbit").parent().addClass("text-success");
	  	$(".dzuhur").parent().addClass("text-success");
	  	$(".ashar").parent().addClass("text-success");
	    $(".maghrib").parent().addClass("active");
	    $(".isya").parent().addClass("next");
	    break;
	  case "isha":
	  	$(".subuh").parent().addClass("next");
	  	$(".terbit").parent().addClass("text-success");
	  	$(".dzuhur").parent().addClass("text-success");
	  	$(".ashar").parent().addClass("text-success");
	  	$(".maghrib").parent().addClass("text-success");
	    $(".isya").parent().addClass("active");
	    break;  
	}
}

function setHadist() {
	var hadist = '<span class="arabic-hadith">';
	hadist += 'مَنْ سَلَكَ طَرِيْقًايَلْتَمِسُ فِيْهِ عِلْمًا,سَهَّلَ اللهُ لَهُ طَرِيْقًا إِلَى الجَنَّةِ . رَوَاهُ مُسْلِم';
	hadist += '</span><br>"Barang siapa menempuh satu jalan (cara) untuk mendapatkan ilmu, maka Allah pasti mudahkan baginya jalan menuju surga." (HR. Muslim)';
	$("#hadist-content").html(hadist);		
}

function setIqomah() {		
	if (iqomahTime > 60) {
		var iqomah = moment(currentPrayerTime).add(iqomahTime, 'seconds')
		var duration = moment(iqomah).diff(now);	
		$("#hadist-content").html('<div class="iqomah-timer">Iqomah ' + moment.utc(duration).format("mm:ss") + '</div>');	
	}	
}

function setAlertMsg(strMsg) {		
	$("#hadist-content").html('<div class="iqomah-timer">' + strMsg + '</div>');
}

function setCountDownToNextPrayer() {		
	var duration = moment(nextPrayerTime).diff(now);
	var d = moment.duration(duration);
	var format = "HH:mm:ss";
	if (d.hours() == 0) {
		format = "mm:ss";
	}		

	$("#hadist-content").html('<div class="nextprayer-timer">&gt;' + prayerNameId(next) + ' ' + moment.utc(duration).format(format) + '</div>');
}

function setPraying() {	
	var hadist = '<div class="next"><span class="arabic-hadith">';
	hadist += 'سَوُّوا صُفُوفَكُمْ , فَإِنَّ تَسْوِيَةَ الصَّفِّ مِنْ تَمَامِ الصَّلاةِ';
	hadist += '</span><br>"Luruskanlah shaf-shaf kalian, karena lurusnya shaf adalah kesempurnaan shalat”<br>(HR. Bukhari no.690, Muslim no.433)</div>';

	$("#hadist-content").html(hadist);	
}

function setTimeEvent(before, after) {		
	// running every seconds
	var detik = moment().format('ss');
//before -= 3410;	
//after = 0 - before;
//console.log(before + ":" + after);
	// anti burn screen shifting every 10 seconds
	if (detik%10 == 0) {
		var random = Math.floor((Math.random() * 5) + 1);
		$("body").css("padding-left", 18 + random + "px");
		$("body").css("padding-right", 18 + random + "px");
		$("#settings-icon").css("left", random + "px");
		$(".jamsholat").css("left", random + "px");
	}

	// switch info every 30 secs
	if (detik < 30) {					
		setCountDownToNextPrayer();	
	} else {		
		setHadist();			
	}

	if (before == 600) {
		// exactly ten minutes before adhan, replace next to active
		$(".jamsholat").find(".active").removeClass("active");
		$(".jamsholat").find(".next").addClass("active");
		$(".jamsholat").find(".next").removeClass("next");
		$(".jamsholat").find(".active").css("color","red");
		$(".jamsholat").find(".active").find(".waktu").addClass("blinking");			
		doubleBeep();

		if (next == "fajr") {
			setAlertMsg("Imsak");
			$(".waktu-sholat").removeClass("text-muted");
			notifyUser("Waktu Imsak telah masuk");
		} 
	} else if (before > 0 && before < 600) {
		if (next == "fajr") {
			// ten minutes before fajr
			setAlertMsg("Imsak");
		} else {
			setCountDownToNextPrayer();	
		}
	} else if (before == 0) {
		// adhan time, play adhan alarm
		$(".jamsholat").find(".active").find(".waktu").removeClass("blinking");	
		longBeep();
		notifyUser("Waktu " + prayerNameId(current) + " telah masuk");
	} else if (iqomahTime >= 60 && after > 0 && after < (iqomahTime - 5)) {
		// after adhan until iqomah time, display iqomah countdown				
		if (current == "sunrise") {
			// override info terbit
			setAlertMsg("Terbit");
		} else {
			// override info praying
			setIqomah();					
		}		
	} else if (iqomahTime >= 60 &&  after == (iqomahTime - 5)) {
		// play iqomah alarm
		multipleBeep();	
	} else if (after > iqomahTime && after < 1200) {
		// override info praying
		setPraying();
	} else if (after == 1200) {
		// twenty minutes after adhan				
		setNextPrayer();
	}	
}

function oscilatorType(type) {
	switch(type){
	    case 0:
		    return 'sine';
		    break;
	    case 1:
	    	return 'square';	    
	    	break;
	    case 2:
	    	return 'sawtooth';	    
	    	break;
	    case 3:
	    	return 'triangle';
	    	break;
	    case 4:
	    	return 'custom';
	    	break;
	}
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function beep(v, f, t, d) {		
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = v;
    oscillator.frequency.value = f;
    oscillator.type = 'square';//oscilatorType(t);

    oscillator.start();
  
    setTimeout(
      function(){
        oscillator.stop();
      }, 
      d
    );  
};

function doubleBeep() {
	beep(beepVolume, beepFrequency, beepType, 120);
	setTimeout(function() {
		beep(beepVolume, beepFrequency, beepType, 120);
	}, 200);
}

function longBeep() {
	beep(beepVolume, beepFrequency, beepType, 1000);		
}

var beepCtr = 0;
var beepHandler;
function multipleBeep() {
	beepHandler = setInterval(function(){ 
		beep(beepVolume, beepFrequency, beepType, beepDuration); 
		//doubleBeep();
		beepCtr++;			
		if (beepCtr == beepTimes) {
			clearInterval(beepHandler);
			beepCtr = 0;
		}
	}, 1000);
}

function playBeep(type) {
	switch (type) {
		case "l" :
			longBeep();
			break;
		case "m" :
			multipleBeep();
			break;
		case "s" :
			beep(beepVolume, beepFrequency, beepType, beepDuration); 
			break;
		case "d" :
			doubleBeep();
			break;
	}
}


function saveSettings() {
  if (typeof(Storage) !== "undefined") {	
	localStorage.coordinates = $("#inputLocation").val();
	localStorage.locationAddress = JSON.stringify(tmpLocationAddress);
	localStorage.locale	= 'id';
	localStorage.calculation = $("#inputCalculation").val();
	localStorage.fajr = parseInt($("#inputFajrAngle").val());
	localStorage.isha = parseInt($("#inputIshaAngle").val());
	localStorage.madhab	= $("#inputSafii:checked").val()=="safii"?"safii":"hanafi";
	localStorage.adjusment = parseInt($("#inputAdjustment").val());
	localStorage.iqomah = parseInt($("#inputIqomahTime").val()) * 60;
	localStorage.alarmAdhan = $("#inputAdzhanAlarm").val();
	localStorage.alarmIqomah = $("#inputIqomahAlarm").val(); 
	localStorage.alwaysOn = $("#inputAlwaysOn").val();

	$(".configuration-menu").scrollTop("0px");

	loadSettings();
	setPrayerTimes(latlngdata);	
  } else {
    alert("Sorry, your browser does not support web storage...");
  }
}

function loadSettings() {
  if (typeof(Storage) !== "undefined") {
    if (!localStorage.coordinates) {		
    	// no settings, create default    	
      	localStorage.coordinates = '-6.21462, 106.84513';
      	localStorage.locationAddress = '{"adminDistrict":"DKI Jakarta","countryRegion":"Indonesia","formattedAddress":"Jakarta Selatan 12850, Indonesia","intersection":{},"locality":"Jakarta Selatan","postalCode":"12850"}';
		localStorage.locale	= 'id';
		localStorage.calculation = 0;
		localStorage.fajr = 20;
		localStorage.isha = 18;
		localStorage.madhab	= "safii";
		localStorage.adjusment = 2;
		localStorage.iqomah = 600;
		localStorage.alarmAdhan = "l";
		localStorage.alarmIqomah = "m";
		localStorage.alwaysOn = "1";

		// beep settings
		localStorage.beepTimes = 5;
		localStorage.beepVolume = 0.5;
		localStorage.beepFrequency = 4000;
		localStorage.beepType = 'square';
		localStorage.beepDuration = 150;
		tmpLocationAddress = JSON.parse(localStorage.locationAddress);		
    } else {
    	firstUse = 0;  
    } 

    locale = localStorage.locale;
    calculation = localStorage.calculation;
	latlngdata = localStorage.coordinates; 	
	locationAddress = localStorage.locationAddress=== 'undefined' || localStorage.locationAddress===null?"":JSON.parse(localStorage.locationAddress);
	fajrAngle = parseInt(localStorage.fajr); 
	ishaAngle = parseInt(localStorage.isha); 
	madhab = localStorage.madhab; 
	minuteadjustment = parseInt(localStorage.adjusment); 
	iqomahTime = parseInt(localStorage.iqomah); 
	alarmAdhan = localStorage.alarmAdhan;
	alarmIqomah = localStorage.alarmIqomah;

	beepTimes = localStorage.beepTimes; 
	beepVolume = localStorage.beepVolume; 
	beepFrequency = localStorage.beepFrequency; 
	beepType = localStorage.beepType; 
	beepDuration = localStorage.beepDuration; 
	alwaysOn = localStorage.alwaysOn;
	

	$("#inputLocation").val(latlngdata);
	$("#inputCalculation").val(calculation);		
	$("#inputFajrAngle").val(fajrAngle);
	$("#inputIshaAngle").val(ishaAngle);
	$("#inputAdjustment").val(minuteadjustment);
	$("#inputIqomahTime").val(iqomahTime<60?0:iqomahTime/60);
	$("#inputAdzhanAlarm").val(alarmAdhan);
	$("#inputIqomahAlarm").val(alarmIqomah);
	$("#inputAlwaysOn").val(alwaysOn);

	var $radios = $('input:radio[name=inputMadhab]');
    if(madhab == "hanafi") {
        $radios.filter('[value=hanafi]').prop('checked', true);
    } else {
    	$radios.filter('[value=safii]').prop('checked', true);
    }

    // always on or not
	if (alwaysOn == 1) {
		noSleep.enable();
	} else {
		noSleep.disable();
	}

  } else {
    alert("Sorry, your browser does not support web storage...");
  }
}

function notifyUser(msg) {
  if (!("Notification" in window)) {
    //alert("This browser does not support desktop notification");
    console.log("This browser does not support desktop notification");
  }
  else if (Notification.permission === "granted") {
        var options = {
                body: msg,
                icon: "media/appicon.jpg",
                dir : "ltr"
             };
          var notification = new Notification("Jam Sholat",options);
  }  
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
   
      if (permission === "granted") {
        var options = {
              body: msg,
              icon: "media/appicon.jpg",
              dir : "ltr"
          };
        var notification = new Notification("Jam Sholat",options);
      }
    });
  }
}

var successHandler = function(position) { 		
	console.log("succes");
	$("#inputLocation").val(position.coords.latitude + ", " + position.coords.longitude);
	var dev = "http://localhost/alamat/?location=" + position.coords.latitude + "," + position.coords.longitude;
	var url = "https://piapiastudio.web.id/api/alamat/?location=" + position.coords.latitude + "," + position.coords.longitude;
	$.get( url, function( data ) {		  
	  tmpLocationAddress = data;		  
	});
}; 

var errorHandler = function (errorObj) { 
	alert(errorObj.code + ": " + errorObj.message); 
}; 

function getLocation() {		
  if (navigator && navigator.geolocation) {	
    navigator.geolocation.getCurrentPosition(successHandler,errorHandler);	    
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function prayerNameId(prayername) {
	switch (prayername) {
		case "fajr" :
			return "Subuh";
			break;
		case "sunrise" :
			return "Terbit";
			break;
		case "dhuhr" :
			return "Dzuhur";
			break;
		case "asr" :
			return "Ashar";
			break;
		case "maghrib" :
			return "Magrib";
			break;
		case "isha" :
			return "Isya";
			break;
	}
}