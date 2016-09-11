var FIELDSTASTUS = (function(){
	var private = {
		'opened': 0,
		'closed': 1,
		'flagged': 2
	};

	return {
		'get': function(name) { return private[name]; } 
	};	
})();

$(document).ready(initialize());

var fields;
var x, y, n, fieldsLeft, minesLeft;

function initialize() {
	x = parseInt($('#size').find(":selected").text());
	y = x;
	n = x;
	minesLeft = n;
	fieldsLeft = x*y;
	fillField();
	$('#mines-left').text(n);
	addListeners();
	//showMines();
}

function addListeners(){
	var $field = $("#sapper-field");

	$('#new-game').unbind('click').bind('click', () => {
		$field.html('');
		$field.removeClass('success');
		$field.removeClass('fail');
		initialize();
	});

	$('table tr').each((i, tr) => {
		$('td', tr).each((j, td) => {
			$(td).attr('data-i', i);
			$(td).attr('data-j', j);
		});
	});

	$field.unbind('click').bind("click", (e) => {
		if (e.target !== e.currentTarget) {
        	target = $(e.target);
        	var i = target.data('i');
        	var j = target.data('j');
        	var field = fields[i][j];
        	if (field.status == FIELDSTASTUS.get('opened'))
        		return;

        	field.open(i, j);

        	if (field.mined){
        		$field.addClass('fail');
        		for (var i = 0; i < y; i++) {
					for (var j = 0; j < x; j++) {
						if (fields[i][j].mined)
							field.open(i, j);
					}
				}
        		return;
        	}

        	if (fieldsLeft == n)
        		$field.addClass('success');

    	}

    	e.stopPropagation();
	});

	$field.unbind("contextmenu").bind("contextmenu", (e) => {
		if (e.target !== e.currentTarget) {
			e.preventDefault();
			target = $(e.target);
	    	var i = target.data('i');
	    	var j = target.data('j');
	    	var field = fields[i][j];
			if(field.status == FIELDSTASTUS.get('closed')){
				target.text('F');
				$('#mines-left').text(--minesLeft);
				field.status = FIELDSTASTUS.get('flagged');
				e.stopPropagation();
				return;
			}
			if(field.status == FIELDSTASTUS.get('flagged')){
				target.text('');
				$('#mines-left').text(++minesLeft);
				field.status = FIELDSTASTUS.get('closed');
				e.stopPropagation();
			}
		}
	});
}

function showMines(){
	var value;
	$('table tr').each((i, tr) => {
		$('td', tr).each((j, td) => {
			if (fields[i][j].mined){
				value = '@';
			}
			else{
				value = fields[i][j].mines;
			}
			$(td).text(value);
		});
	});
}

function fillField(){
	var $field = $("#sapper-field");
	for (var i = 0; i < y; i++) {
		var tr = '<tr' + i + ' ">';
		for (var j = 0; j < x; j++) {
			tr += '<td data-i="' + i + ' " data-j="' + j + '"></td>'
		}
		tr += '</tr>';
		$field.html($field.html() + tr);
	}

	fields = new Array();
	for (var i = 0; i < y; i++) {
		fields[i] = new Array();
		for (var j = 0; j < x; j++) {
			fields[i][j] = new Field();
		}
	}

	var mx, my;
	for (var i = 0; i < n; i++) {
		mx = Math.floor(Math.random() * n);
		my = Math.floor(Math.random() * n);

		if (fields[mx][my].mined == true){
			i--;
		}
		else{
			fields[mx][my].mined = true;
		}
	}

	for (var i = 0; i < y; i++) {
		for (var j = 0; j < x; j++) {
			calculateMines(i, j);
		}
	}
}

function calculateMines(i, j){
	if (fields[i][j].mined){
		incrementMines(i-1, j-1);
		incrementMines(i-1, j);
		incrementMines(i-1, j+1);
		incrementMines(i, j-1);
		incrementMines(i, j+1);
		incrementMines(i+1, j-1);
		incrementMines(i+1, j);
		incrementMines(i+1, j+1);
	}	
}

function incrementMines(i, j){
	if (i >= 0 && j >= 0 && i < x && j < y)
		fields[i][j].mines++;
}

function Field(){
	this.status = FIELDSTASTUS.get('closed');
	this.mined = false;
	this.mines = 0;
}

Field.prototype.open = function(i, j){
	if (i < 0 || j < 0 || i >= x || j >= y || fields[i][j].status == FIELDSTASTUS.get('opened'))
		return;
	var result;
	if (fields[i][j].mined)
		result = "@";
	else
		result = fields[i][j].mines;
	$('td[data-i="' + i + '"][data-j="' + j + '"]').text(result);
	fields[i][j].status = FIELDSTASTUS.get('opened');
	fieldsLeft--;
	if (result == 0){
		this.open(i-1, j-1);
		this.open(i-1, j);
		this.open(i-1, j+1);
		this.open(i, j-1);
		this.open(i, j+1);
		this.open(i+1, j-1);
		this.open(i+1, j);
		this.open(i+1, j+1);
	}
}
