

$(function() {
	
	testCanvas();
	
});

function testCanvas() {
	
	var theCanvas = document.getElementById("my-canvas");
	
	if (theCanvas && theCanvas.getContext) {

        var ctx = theCanvas.getContext("2d");
        ctx.translate(0.5, 0.5);

        if (ctx) {
        	ctx.beginPath();
        	ctx.lineWidth="6";
        	ctx.strokeStyle="white";
        	ctx.rect(0,0, 100,100);
        	ctx.stroke();

            }//end if
        }//end if

}//end testCanvas





function main(level) {

	LEVEL = level;
	numButtons = null;

	switch (LEVEL) {
		case "EASY" :
			numButtons = 12;
			break;
		case "MED" :
			numButtons = 24;
			break;
		case "HARD" :
			numButtons = 36;
			break;
	}

	START = new Date().getTime();

	$('#success').popup('close');

	// global variables
	secs = null;
	mins = null;
	counter = null;
	tick = null;
	cross = null;
	id = null;

	selected_ids = new Array(null, null, null);

	// initialise sounds
	tap = null;
	wrong = null;
	coin = null;
	applause = null;

	// create the list
	$('#btnList').empty();
	createButtons();
	$('#btnList').show();
	$("#numHead").show();
	activateBtns();

	fadeInBtns();
	initSounds();
	initPics();

	startTimer();

	// $("#test").show();

	$("#reset").show();
	$("#back").show();
	$("#timeHead").show();
	$('#tickOrCross').hide();
	$('#playerTips').hide();
	$('#playerFooter').hide();

	$("#numHead").show();

	var listHt = $("#btnList").height();
	var wHt = $(window).height();
	var hdHt = $("#numHead").height();

	var margin = (wHt - listHt) / 2;
	$("#btnList").css("margin-top", margin);
	$("#btnList").css("margin-bottom", 0);
}

/*
 * Function to create a list of numbers @parameter - the length of the list
 * @returns - the list
 */

function createList(len) {
	var list = new Array();
	for (var i = 0; i < len; i++) {
		list[i] = i + 1;
	}
	return list;
}

/*
 * Function to shuffle a given list @parameter - the list @returns - the
 * shuffled list
 */
function shuffle(list) {
	var i, j, t;
	for (i = 1; i < list.length; i++) {
		j = Math.floor(Math.random() * (1 + i));
		// choose j in [0..i]
		if (j != i) {
			t = list[i];
			// swap list[i] and list[j]
			list[i] = list[j];
			list[j] = t;
		}
	}
	return list;
}

/*
 * Function to join two lists lists created by calls to createList() and
 * shuffle() @returns the joinedList
 */
function createMainList() {

	var list1 = new Array();
	var list2 = new Array();
	var joinedList = new Array();

	list1 = createList(numButtons / 2);
	list2 = createList(numButtons / 2);

	list1 = shuffle(list1);
	list2 = shuffle(list2);

	joinedList = list1.concat(list2);

	return joinedList;
}

/*
 * Function to create the button markup calls createMainList() to get the
 * numbers
 */
function createButtons() {

	var btnList = new Array();
	btnList = createMainList();
	var dataTheme = "b";
	var btnClass;

	for (var i = 0; i < numButtons; i++) {
		var num = btnList[i];

		if (i % 2 != 0) {
			btnClass = "btnO";
		} else {
			btnClass = "btnE";
		}

		var btn = $("<a data-role=\"button\" id=" + i + " class=\"" + btnClass
				+ "\" data-theme=\"b\" data-inline=\"true\">" + num
				+ "</button>")
		$('#btnList').append(btn);
		btn.button();
	}

	var testBtn = $("<a onclick=\"showSuccess()\" data-role=\"button\" id=\"test\" data-theme=\"b\" data-inline=\"true\">testWin</button>")
	$('#btnList').append(testBtn);
	testBtn.button();
}

/*
 * Function to set up the event handler for each of the buttons (class .btn)
 * calls storeBtnValues() as each button is selected
 */
function activateBtns() {

	$('.btnE,.btnO').bind('vmousedown', function() {
				var btn = this;

				// what happens when the button is selected?
				// - get the buttonID and store the values,
				// - allow for reset for 1st and 2nd buttons
				// - check for the correct result
				// - animate the buttons depending on the results
				// - update and show the scoreboard
				selectBtns(btn);
			});

}

/*
 * Function to get the id of a button passes the button as the argument @returns
 * the id
 */
function getBtnID(btn) {
	var id = $(btn).attr("id");
	return id;
}

/*
 * Function to select three buttons in order places each button in an array if
 * button selected twice (button 1 and 2 only), then removes ID from the array
 * when third button selected - evt handling cancelled(remove class) @returns
 * and array of the IDs of the selected buttons
 */

function selectBtns(btn) {

	var id = getBtnID(btn);

	// if no 1st value - store value & change background
	if (selected_ids[0] == null) {
		playSound(tap);
		selected_ids[0] = id;
		$(btn).css('background', 'green');

	} else // if 1st value again - remove value
	if (selected_ids[0] == id) {
		playSound(tap);
		$(btn).css('background', '#4B88B6');
		selected_ids[0] = null;

	} else // if 1st value and no 2nd value - store value
	if ((selected_ids[0] != null) && (selected_ids[1] == null)) {
		playSound(tap);
		selected_ids[1] = id;
		$(btn).css('background', 'green');

	} else // if 2nd value again - remove value
	if (selected_ids[1] == id) {
		playSound(tap);
		$(btn).css('background', '#4B88B6');
		selected_ids[1] = null;

	} else {// store as 3rd value & turn off event handler
		playSound(tap);
		$(btn).css('background', 'green');
		selected_ids[2] = id;
		checkForEquation();
	}
}

/*
 * Function to check if the selected numbers add up. updates the scoreboard
 * calls animateBtns() to remove btns calls showScoreboard()
 */
function checkForEquation() {

	var selectedVals = new Array(null, null, null);
	var id;
	var correct = false;
	// format the button ids
	var id0 = "#" + selected_ids[0];
	var id1 = "#" + selected_ids[1];
	var id2 = "#" + selected_ids[2];

	// get scoreboard values i.e. convert to integers
	for (var i = 0; i < 3; i++) {
		id = '#' + selected_ids[i];
		selectedVals[i] = parseInt($(id).text());
	}
	// check if they add up
	if (selectedVals[0] + selectedVals[1] == selectedVals[2]) {
		correct = true;
		playSound(coin);
		counter++;
		// turn off event handlers
		$(id0).off();
		$(id1).off();
		$(id2).off();

		showTickOrCross(correct);
		animateBtns(correct);
		reInitSelectedIds();
		if (finalSuccess()) {
			showSuccess();
		}
	} else {
		correct = false;
		showTickOrCross(correct);
		playSound(wrong);
		// revert the button formats back to original and remove from array
		for (var i = 0; i < 3; i++) {
			id = '#' + selected_ids[i];
			$(id).css('background', '#4B88B6');
			selected_ids[i] = null;
		}
		reInitSelectedIds();
	}
}

function reInitSelectedIds() {
	// re-initialise IDs selected
	for (var i = 0; i < 3; i++) {
		selected_ids[i] = null;
	}
}

function animateBtns(correct) {

	for (var i = 0; i < 3; i++) {
		id = '#' + selected_ids[i];

		$(id).animate({
					// send the buttons away
					opacity : '0.0'
				}, 1000, function() {

					// disappear

				});
	}
}

function initPics() {

	try {
		tick = "url('img/tick.png')"
		cross = "url('img/cross.png')";
	} catch (e) {
		console.log(e);
	}
}

function showTickOrCross(correct) {

	if (correct) {
		var image = tick;
	} else {
		var image = cross;
	}

	$('#tickOrCross').css('background-image', image)

	$('#tickOrCross').show().animate({
				top : '10em'
			}, 1000, function() {
				$(this).hide()
			});
}

function startTimer() {

	var now = new Date().getTime();
	var secsGone = Math.floor((now - START) / 1000);
	var minsGone = Math.floor(secsGone / 60);

	secs = secsGone % 60;
	mins = minsGone;

	displayTime(secs, mins);

	t = setTimeout(function() {
				startTimer()
			}, 1000);
}

function displayTime(secs, mins) {

	// add a zero in front of numbers<10
	var s = formatTimeZeros(secs, "secs");
	var m = formatTimeZeros(mins, "mins");
	var time = m + ":" + s;
	$('#timeHead').html(time);
}

function formatTimeZeros(i, type) {
	if (type == "secs") {
		if (i < 10) {
			i = "0" + i;
		}
	}
	if (type == "mins") {
		if (i == 0) {
			i = " ";
		}
	}
	return i;
}

function playSound(sound) {

	try {
		sound.play();
	} catch (e) {
	}

}

function finalSuccess() {
	if (counter == numButtons / 3) {
		return true;
	}
	return false;
}

function showSuccess() {
	// do something to celebrate

	var msg;
	var next;
	var time = formatTimeSuccess();

	if (LEVEL == "EASY") {
		msg = "<strong>Congratulations</strong></br>You have completed the Easy level in a time of "
				+ time + ". Why not try the Medium level....";
	} else if (LEVEL == "MED") {
		msg = "<strong>Congratulations</strong></br>You have completed the Medium level in a time of "
				+ time + ". Why not try the Hard level....";
	} else {
		msg = "<strong>Congratulations</strong></br>You have completed the Hard level in a time of "
				+ time + ". Thanks for playing.";
	}

	$("#numHead").hide();
	playSound(applause);
	$('#btnList').empty().hide();
	$('#success').html(msg);
	$('#success').popup('open');

	if (LEVEL == "EASY") {
		selectRadio("MED");
		$("#easy").prop('checked', false).checkboxradio("refresh");
		$("#medium").prop('checked', true).checkboxradio("refresh");
		$('#playerTips').show();
		$('#playerFooter').show();
	} else if (LEVEL == "MED") {
		selectRadio("HARD");
		$("#medium").prop('checked', false).checkboxradio("refresh");
		$("#hard").prop('checked', true).checkboxradio("refresh");
		$('#playerTips').show();
		$('#playerFooter').show();
	} else if (LEVEL == "HARD") {
		selectRadio("HARD");
		$("#medium").prop('checked', false).checkboxradio("refresh");
		$("#hard").prop('checked', true).checkboxradio("refresh");
		$('#playerTips').show();
		$('#playerFooter').show();
	}

}

function initSounds(sounds) {
	try {
		tap = new Media("file:///android_asset/www/sounds/tap.mp3");
		wrong = new Media("file:///android_asset/www/sounds/wrong.mp3");
		coin = new Media("file:///android_asset/www/sounds/coin.wav");
		applause = new Media("file:///android_asset/www/sounds/applause.mp3");
	} catch (e) {
		console.log(e);
	}
}

function formatTimeSuccess() {
	if (mins == 0) {
		return secs + " secs";
	} else {
		return mins + " mins  " + secs + " secs";
	}

}

function goBack() {

	$('#btnList').empty().hide();
	$("#numHead").hide();
	$('#playerTips').show();
	$('#playerFooter').show();
	$("#btnList").css("margin-top", 0);
}

function selectRadio(value) {

	var id;

	// set id
	if (value == "EASY") {
		id = "#easy";
	} else if (value == "MED") {
		id = "#medium";
	} else {
		id = "#hard";
	}

	// set player level
	playerLevel = value;

	// set checked selection shown
	$(id).prop('checked', true);

	// bind event if radio button selected
	$("input[type='radio']").bind("change", function(event, ui) {
				playerLevel = $(this).val();
			});
}

function initNumbersPage() {

	selectRadio("EASY");

	$.mobile.changePage("#numbers", {
				transition : "flip"
			});
	animateSprite()

}

function simulateWin() {
	// as if won
	showSuccess();
}

function fadeInBtns() {

	$(".btnE").animate({
				opacity : 1.0
			}, 1000);
	$(".btnO").animate({
				opacity : 1.0
			}, 1000);
}

function animateSprite() {

//	 $(".logo").delay(1000).queue(function() {
//		
//	 $(this).css("background-position", "-200px").dequeue();
//						
//	 });
//	 $(".logo")
//		
//	 $(this).css("background-position", "0px");
//	 });

	 $(".logo").sprite({
	 fps : 1,
	 no_of_frames : 10
	 });

//	var pos = 0;
//
//	for (var i = 0; i < 30; i++) {
//
//		$(".logo").delay(3000).queue(function() {
//
//					$(this).css("background-position", "'" + pos + "px'")
//							.dequeue();
//
//				});// end queue
//
//		pos -= 200;
//
//		console.log("'" + pos + "px'");
//
//	}// end for

}
