
class Basis{

	constructor(){
		this.data = [];
	}

	add(v){
		if(!(v instanceof Matrix) || v.m != 1) throw "Basis was not supplied a valid vector";
		this.data.push(v);
	}

	dim(){
		return this.data.length;
	}
	R(){
		if(this.data.length == 0) throw "No matrices in basis!";
		return this.data[0].n;
	}

	getMatrix(){
		var m = dimMatrix(this.R(), this.dim());
		for(var i = 0; i < this.R(); i++){
			for(var j = 0; j < this.dim(); j++){
				m.data[i][j] = this.data[j].data[i][0];
			}
		}
		return m;
	}

	independent(){
		return this.getMatrix().independent();
	}

	get(i){
		return this.data[i];
	}
	set(i, v){
		if(!(v instanceof Matrix) || v.m != 1) throw "Basis was not supplied a valid vector";
		this.data[i] = v;
	}

	normalize(){
		for(var i = 0; i < this.dim(); i++)
			this.set(i, this.get(i).normalize());
		return this;
	}

	graph(div){

		if(this.R() == 2){

			var as = [];

			var ymin = 0;
			var xmin = 0;
			var ymax = 0;
			var xmax = 0;
			for(var i = 0; i < this.data.length; i++){
				var p = this.data[i].getPointTo();
				ymin = Math.min(p[1], ymin);
				xmin = Math.min(p[0], xmin);
				ymax = Math.max(p[1], ymax);
				xmax = Math.max(p[0], xmax);
				as.push({x:p[0], y:p[1], ax:0, ay:0, xref:'x',yref:'y',axref:'x',ayref:'y',text:'',showarrow:true,arrowhead:3,arrowsize:1,arrowwidth:1,arrowcolor:'black'})
			}

			ymax = Math.round(Math.max(xmax, ymax)*1.2);
			ymin = Math.round(Math.min(xmin, ymin)*1.2);

			var data = [];
			var layout = {
			  showlegend: false,
			  annotations: as,
			  xaxis: {range: [ymin, ymax]},
			  yaxis: {range: [ymin, ymax]},
			  height: 200,
				margin:{
					l:0,
					r:0,
					t:0,
					b:0,
					pad:0
				},
			};

			Plotly.newPlot(div, data, layout);

		}else if(this.R()  == 3){

			var data = [];

			var z = [];
			for(var i = 0; i < this.data.length; i++){
				var x = this.data[i].getPointTo()[0];
				var y = this.data[i].getPointTo()[1];
				var z = this.data[i].getPointTo()[2];
				data.push({
				  type: 'scatter3d',
				  mode: 'lines',
				  x: [0,x],
				  y: [0,y],
				  z: [0,z],
				  opacity: 1,
				  line: {
				    width: 6,
				    color: "#000",
				    reversescale: false
				  }
				});
				var l = Math.sqrt(x*x + y*y + z*z);
				data.push({
				  type: "cone",
				  x: [x], y: [y], z: [z],
				  u: [x/l], v: [y/l], w: [z/l],
				  showscale: false,
				  color: "rgb(0,0,0)"
				});
			}

			data.push({

			})

			var layout = {
				showlegend: false,
				height: 200,
				margin:{
					l:0,
					r:0,
					t:0,
					b:0,
					pad:0
				},
			};

			Plotly.newPlot(div, data, layout); 

		}
	}


}

function bFromJson(j){
	j = "[" + j.substr(1, j.length-2) + "]";
	var b = new Basis();
	b.data = JSON.parse(j);
	for(var i = 0; i < b.data.length; i++){
		var m = new Matrix(b.data[i]);
		b.data[i] = m;
	}
	return b;
}


Basis.prototype.toString = function(){
	var s = "{";
	for (var i = 0; i < this.data.length; i++){
		s += this.data[i].json() + ",";
	}
	return s.substr(0, s.length-1) + "}";
}