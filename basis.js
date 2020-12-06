
class Basis{

	constructor(){
		this.data = [];
	}

	add(v){
		if((!(v instanceof Matrix) || v.m != 1) && !(v instanceof Basis) ) throw "Basis was not supplied a valid vector";
		if(v instanceof Basis){
			for(var i = 0; i < v.dim(); i++)
				this.data.push(v.get(i));
		}else{
			this.data.push(v);
		}
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
	getSquareMatrix(){
		var d = Math.min(this.R(), this.dim());
		var a = new Identity(d);
		for(var i = 0; i < d; i++){
			for(var j = 0; j < d; j++){
				a.data[j][i] = this.data[i].data[j][0];
			}
		}
		return a;
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

	trivial(){
		for(var i = 0; i < this.dim(); i++){
			var zeros = true;
			for(var j = 0; j < this.R(); j++){
				if(this.data[i].data[j][0] != 0) zeros = false;
			}
			if(zeros) return true;
		}
		return false;
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
				if(p[0] == 0 && p[1] == 0) continue;
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
			var minx = 0, maxx = 0, miny = 0, maxy = 0;
			for(var i = 0; i < this.data.length; i++){
				var x = this.data[i].getPointTo()[0];
				var y = this.data[i].getPointTo()[1];
				var z = this.data[i].getPointTo()[2];
				minx = Math.min(minx, x);
				maxx = Math.max(maxx, x);
				miny = Math.min(miny, y);
				maxy = Math.max(maxy, y);
				if(x == 0 && y == 0 && z == 0) continue;
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
				  }
				});
				var l = Math.sqrt(x*x + y*y + z*z);
				data.push({
				  type: "cone",
				  x: [x], y: [y], z: [z],
				  u: [x/l], v: [y/l], w: [z/l],
				  showscale: false,
				});
			}
			minx -= (minx != 0) ? 1 : 0;
			maxx += (maxx != 0) ? 1 : 0;
			miny -= (miny != 0) ? 1 : 0;
			maxy += (maxy != 0) ? 1 : 0;
			if(this.dim() == 2){
				var xs = [], ys = [], zs = [];
				var sm = this.getSquareMatrix();
				var smi = sm.pow(-1);
				var tm = this.getMatrix();
				for(var y = miny; y <= maxy; y++){
					var rowx = [], rowy = [], rowz = [];
					for(var x = minx; x <= maxx; x++){
						rowx.push(x);
						rowy.push(y);
						if(x == 0 && y == 0){
							rowz.push(0);
							continue;
						}
						var b = dimMatrix(2,1,0);
						b.data[0][0] = x;
						b.data[1][0] = y;
						var xm = smi.mult(b);
						var vf = tm.mult(xm);
						rowz.push(vf.data[2][0]);
					}
					xs.push(rowx);
					ys.push(rowy);
					zs.push(rowz);
				}


				data.push({
					type: 'surface',
					x: xs,
					y: ys,
					z: zs,
					showscale: false,
					opacity: 0.5,
				})
			}

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