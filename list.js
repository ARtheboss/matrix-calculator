class List{

	constructor(){
		this.data = [];
	}

	add(m){
		if(!(m instanceof Matrix)) throw "List was not supplied a valid matrix";
		this.data.push(m);
	}

	multiply(){
		if(this.data.length <= 1) return this.data[0];
		var m = this.data[0].mult(this.data[1]);
		for(var i = 2; i < this.data.length; i++){
			m = m.mult(this.data[i]);
		}
		return m;
	}

	get(i){
		if(i >= this.data[i].length || i < 0) throw "List item does not exist";
		return this.data[i].json();
	}

}

function lFromJson(j){
	j = "[" + j.substr(4, j.length-8) + "]";
	var l = new List();
	l.data = JSON.parse(j);
	for(var i = 0; i < l.data.length; i++){
		var m = new Matrix(l.data[i]);
		l.data[i] = m;
	}
	return l;
}

List.prototype.toString = function(){
	var s = "<";
	for (var i = 0; i < this.data.length; i++){
		s += this.data[i].json() + ",";
	}
	return s.substr(0, s.length-1) + ">";
}