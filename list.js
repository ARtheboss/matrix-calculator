class List{

	constructor(){
		this.data = [];
	}

	add(m){
		this.data.push(m);
	}

	multiply(){
		if(this.data.length <= 1) return this.data[0];
		if(!this.data[0] instanceof Matrix || !this.data[1] instanceof Matrix) throw "Cannot multiply";
		var m = this.data[0].mult(this.data[1]);
		for(var i = 2; i < this.data.length; i++){
			if(!this.data[i] instanceof Matrix) throw "Cannot multiply";
			m = m.mult(this.data[i]);
		}
		return m;
	}

	get(i){
		if(i >= this.data[i].length || i < 0) throw "List item does not exist";
		return this.data[i].toString();
	}

	size(){
		return this.data.length;
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
		s += this.data[i].toString() + ",";
	}
	return s.substr(0, s.length-1) + ">";
}