
var id = 0;

var parsers = [];

var variables = {};

function createParser(){
	parsers.push(new Parser("#calculator", id));
	id++;
	return id-1;
}

function removeParser(i){
	$("#p-"+i).remove();
	$("#pi-"+(i-1)).focus();
	for(var n = i+1; n < id; n++){
		setId(n, n-1);
	}
	parsers.splice(i,1);
	id--;
}

function setId(i, j){
	console.log(parsers);
	parsers[i].id = j;
	$("#p-"+i).attr("id", "#p-"+j);
	$("#pi-"+i).attr("id", "#pi-"+j);
	$("#po-"+i).attr("id", "#po-"+j);
}

var updated = [];

function updateAll(){
	updated = [];
	for(var i = 0; i < parsers.length; i++){
		if(!updated.includes(parsers[i].id)){
			parsers[i].parse();
		}
	}
}

function setVariable(v, i){
	if(variables[v] != null) throw "Variable already defined";
	variables[v] = i;
	updateAll();
	return v;
}

function fpef(n){
	return Math.round(n * 1e7)/1e7;
}

createParser();



