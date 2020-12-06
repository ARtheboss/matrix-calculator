
class Matrix{

	constructor(arr){
		for(var i = 1; i < arr.length; i++){
			if(arr[i].length != arr[i-1].length) throw "Invalid input array";
		}
		var arr = JSON.parse(JSON.stringify(arr));
		this.n = arr.length;
		this.m = arr[0].length;
		this.data = arr;
	}

	extendCol(n, val = 0){
		this.m += n;
		for(var i = 0; i < this.n; i++)
			for(var j = 0; j < n; j++)
				this.data[i].push(val);
	}
	extendRow(n, val = 0){
		this.n += n;
		var arr = [];
		for(var j = 0; j < this.m; j++)
			arr.push(val);
		for(var i = 0; i < n; i++)
			this.data.push(arr);
	}

	getCol(n){
		var v = dimMatrix(this.n, 1);
		for(var i = 0; i < this.n; i++){
			v.data[i][0] = this.data[i][n];
		}
		return v;
	}
	setCol(i, v){
		for(var j = 0; j < this.n; j++){
			this.data[i][j] = v.data[0][j];
		}
	}

	transpose(){
		var nm = dimMatrix(this.m, this.n); // m x n output matrix
		for(var i = 0; i < this.m; i++)
			for(var j = 0; j < this.n; j++)
				nm.data[i][j] = this.data[j][i]; // reverse columns and rows
		return nm;
	}

	getPointTo(col = 0){
		var r = [];
		for(var i = 0; i < this.n; i++){
			r.push(this.data[i][col]);
		}
		return r;
	}

	mult(val){
		if(val == parseFloat(val)){ // multiply by scalar
			var nm = new Matrix(this.data); // new output matrix
			for(var i = 0; i < this.n; i++){
				for(var j = 0; j < this.m; j++){
					nm.data[i][j] = this.data[i][j] * val; // multiplies each item by scalar
				}
			}
			return nm;
		}else if(val instanceof Matrix){ // multiply by matrix
			if(this.m != val.n) throw "Cannot multiply a " + this.dim() + " matrix by " + val.dim() + " matrix"; // Dimension mismatch
			var r = dimMatrix(this.n, val.m, 0); // new output matrix
			for(var i = 0; i < this.n; i++){
				for(var j = 0; j < val.m; j++){
					var s = 0;
					for(var a = 0; a < this.m; a++) 
						s += this.data[i][a] * val.data[a][j]; // * all items in ith row and jth column
					r.data[i][j] = s;
				}
			}
			return r;
		}
	}

	det(){
		if(this.n != this.m) throw "Matrix is not square";
		if(this.n == 2){ // base case, 2x2 matrix
			return this.data[0][0]*this.data[1][1] - this.data[0][1]*this.data[1][0]; // ad-bc
		}else{
			var ans = 0;
			for(var i = 0; i < this.n; i++){ // cofactor expansion (+ on even #d columns, - on odd)
				if(i % 2) ans -= this.data[0][i] * this.removeColRow(0, i).det(); 
				else ans += this.data[0][i] * this.removeColRow(0, i).det();
			}
			return ans;
		}
	}

	independent(){
		return this.det() != 0;
	}

	removeColRow(row, col){
		var nm = dimMatrix(this.n - 1, this.m - 1);
		for(var i = 0; i < this.n; i++){
			if(i == row) continue;
			for(var j = 0; j < this.m; j++){
				if(j == col) continue;
				var ic = i;
				if(i >= row) ic--;
				var jc = j;
				if(j >= col) jc--;
				nm.data[ic][jc] = this.data[i][j];
			}
		}
		return nm;
	}

	rref(){
		this.moveZeroRows();
		var col = 0; // column of current pivot position
		var row = 0; // row of current pivot position
		while(col < this.m && row < this.n){
			if(fpef(this.data[row][col]) == 0){ // find leftmost non-zero value (pivot position)
				col++; 
				continue;
			}
			var div = this.data[row][col]; // pivot
			for(var i = col; i < this.m; i++){
				this.data[row][i] /= div; // scale current pivot's row to 1
			}
			for(var i = 0; i < this.n; i++){ // row operations on other rows
				if(i == row) continue; // pivot's row already evaluated
				for(var j = 0; j < this.m; j++){
					if(j == col) continue; // need data for later
					this.data[i][j] += this.data[i][col] * -this.data[row][j]; // Scale pivot's row and -
				}
				this.data[i][col] = 0; // other values on pivot column will equal 0
			}
			col++; // next pivot position
			row++;
			this.moveZeroRows();
		}
		this.data = this.fpef().data;
	}
	moveZeroRows(){
		var d = [];
		for(var i = 0; i < this.n; i++){
			var c = 0;
			while(this.data[i][c] == 0) c++; // number of 0s to the left of pivot
			d.push([i, c]);
		}
		d.sort(function(a, b) {
		    return a[1] - b[1]; 
		});
		var nm = new Matrix(this.data);
		for(var i = 0; i < this.n; i++){
			this.data[i] = nm.data[d[i][0]]; // move to corresponding sorted position
		}
	}
	ef(){
		var nm = dimMatrix(this.n, this.m);
		var col = 0;
		var row = 0;
		while(col < this.n && col < this.m && row < this.n && row < this.m){
			var div = this.data[row][col];
			if(div == 0){
				row++;
				continue;
			}
			for(var i = col; i < this.m; i++){
				this.data[row][i] /= div;
			}
			for(var i = row+1; i < this.n; i++){
				for(var j = 0; j < this.m; j++){
					if(j == col) continue;
					this.data[i][j] += this.data[i][col] * -this.data[row][j];
				}
				this.data[i][col] = 0;
			}
			col++;
			row++;
		}
		this.moveZeroRows();
	}

	pivotColumns(){ // takes in rrefed matrix
		var ans = [];
		for(var i = 0; i < this.n; i++){
			for(var j = 0; j < this.m; j++){
				if(this.data[i][j] != 0){ // column has nonzero value
					ans.push(j);
					break;
				}
			}
		}
		return ans;
	}
	freeColumns(){ // takes in rrefed matrix
		var pc = this.pivotColumns();
		var ans = [];
		for(var i = 0; i < this.n; i++){
			if(!pc.includes(i)) ans.push(i);
		}
		return ans;
	}

	add(matrix){
		if(!matrix instanceof Matrix) throw "Not a matrix";
		if(this.n != matrix.n || this.m != matrix.m) throw "Dimensions do not match";
		var nm = dimMatrix(this.n, this.m, 0);
		for(var i = 0; i < this.n; i++)
			for(var j = 0; j < this.m; j++)
				nm.data[i][j] = this.data[i][j] + matrix.data[i][j]; // add value at each pos
		return nm;
	}
	subtract(matrix){
		if(!matrix instanceof Matrix) throw "Not a matrix";
		if(this.n != matrix.n || this.m != matrix.m) throw "Dimensions do not match";
		var nm = dimMatrix(this.n, this.m, 0);
		for(var i = 0; i < this.n; i++)
			for(var j = 0; j < this.m; j++)
				nm.data[i][j] = this.data[i][j] - matrix.data[i][j]; // add value at each pos
		return nm;
	}

	pow(n){
		if(!Number.isInteger(n)) throw "Power is not integer";
		if(this.n != this.m) throw "Matrix is not a square";
		var nm = new Matrix(this.data); // output matrix
		var mult = this; // initial matrix
		if(n < 0){
			nm = nm.inverse();
			mult = nm; // starting matrix is inverted
			n = -n; // regular power after this
		}
		while(n > 1){ // starts off at first power
			nm = nm.mult(mult); // multiply with itself
			n--;
		}
		return nm;
	}

	submatrix(ai,bi,aj,bj){
		if(ai >= bi || aj >= bj) throw "Submatrix constraints are not in form ai < bi, aj < bj";
		if(ai < 0 || bi >= this.n || aj < 0 || bj >= this.m) throw "Submatrix constraints out of bounds";
		var nm = dimMatrix(bi-ai+1,bj-aj+1,0);
		for(var i = ai; i <= bi; i++)
			for(var j = aj; j <= bj; j++)
				nm.data[i-ai][j-aj] = this.data[i][j];
		return nm;
	}

	conjoin(matrix, horizontal = true){
		if(horizontal){
			if(this.n != matrix.n) throw "Dimensions are incorrect";
			var nm = new Matrix(this.data);
			nm.extendCol(matrix.n);
			for(var i = 0; i < matrix.n; i++)
				for(var j = this.m; j < matrix.m + this.m; j++)
					nm.data[i][j] = matrix.data[i][j-this.m];
			return nm;
		}else{
			if(this.m != matrix.m) throw "Dimensions are incorrect";
			var nm = new Matrix(this.data);
			nm.extendRow(matrix.m);
			for(var i = this.n; i < matrix.n + this.n; i++)
				for(var j = 0; j < matrix.m; j++)
					nm.data[i][j] = matrix.data[i-this.n][j];
			return nm;
		}
	}

	inverse(){
		if(this.n != this.m) throw "Matrix is not square, cannot take inverse";
		if(!this.independent()) throw "Not invertible";
		var id = new Identity(this.n);
		var nm = this.conjoin(id); // add identity to side 
		nm.rref(); // row reduce matrix which has identity attached
		return nm.submatrix(0,this.n-1,this.m,this.m*2-1); // get right half of rrefed matrix
	}

	parametricVector(col){ // rrefed matrix
		var v = dimMatrix(this.m, 1, 0); // new vector (size m)
		for(var i = 0; i < this.n; i++){ // iterate rows
			if(this.data[i][col] == 0) continue; 
			var c = 0;
			while(this.data[i][c] == 0) c++; // find pivot in row
			v.data[c][0] = -this.data[i][col]; // fixed variable value for corresponding free var 
		}
		v.data[col][0] = 1; // free variable value will be one
		return v;
	}

	parametricSolutions(){ // rrefed matrix
		var fv = this.freeColumns();
		var b = new Basis();
		if(fv.length == 0){
			b.add(dimMatrix(this.m,1,0));
		}else{
			for(var i = 0; i < fv.length; i++){
				b.add(this.parametricVector(fv[i]));
			}
		}
		return b;
	}

	nullSpace(){
		var rrefed = new Matrix(this.data);
		rrefed.rref();
		return rrefed.parametricSolutions();
	}

	colSpace(){
		var rrefed = new Matrix(this.data);
		rrefed.rref();
		var pivot = rrefed.pivotColumns();
		var r = new Basis();
		for(var i = 0; i < pivot.length; i++){
			r.add(this.getCol(pivot[i]));
		}
		return r;
	}

	lufactor(){
		if(this.n != this.m) throw "Matrix is not a square,cannot factorize";
		var l = new Identity(this.n); // l matrix
		var u = new Matrix(this.data); // u matrix
		for(var i = 0; i < this.m; i++){
			for(var j = i+1; j < this.n; j++){
				var r = u.data[j][i]/u.data[i][i]; // factor to go into l matrix
				l.data[j][i] = r;
				for(var k = 0; k < this.m; k++){
					u.data[j][k] -= u.data[i][k] * r; // fix values in upper matrix
				}
			}
		}
		var li = new List();
		li.add(l);
		li.add(u);
		return li;
	}

	fpef(){
		var nm = new Matrix(this.data);
		for(var i = 0; i < this.n; i++){
			for(var j = 0; j < this.m; j++){
				nm.data[i][j] = fpef(this.data[i][j]);
			}
		}
		return nm;
	}

	json(){
		return JSON.stringify(this.fpef().data);
	}

	trace(){
		if(this.n != this.m) throw "Only square matrices have a trace";
		var ans = 0;
		for(var i = 0; i < this.n; i++)
			ans += this.data[i][i];
		return ans;
	}

	rank(){
		return this.colSpace().dim();
	}

	dot(v2){
		if(this.m != 1 || v2.m != 1) throw "Only vectors have a dot product";
		var s = 0;
		for(var i = 0; i < this.n; i++)
			s += this.data[i][0] * v2.data[i][0];
		return s;
	}
	mag2(){
		if(this.m != 1) throw "Only vectors have a magnitude";
		var div = 0;
		for(var i = 0; i < this.n; i++)
			div += this.data[i][0] * this.data[i][0];
		return div;
	}
	normalize(){
		if(this.m != 1) throw "Only vectors can be normalized";
		return this.mult(1/Math.sqrt(this.mag2()));
	}

	proj(v2){
		if(this.m != 1 || v2.m != 1) throw "Only vectors can be projected";
		var s = this.dot(v2);
		var div = this.mag2();
		return this.mult(s/div);
	}

	orthonormalset(){
		if(!this.independent()) throw "Matrix is not independent";
		var b = this.toBasis();
		for(var i = 0; i < this.m; i++){
			var ui = b.get(i);
			for(var j = 0; j < i; j++){
				ui = ui.subtract(b.get(j).proj(b.get(i)));
			}
			b.set(i, ui);
		}
		return b.normalize();
	}

	qrfactor(){
		var q = this.orthonormalset().getMatrix();
		var r = q.transpose().mult(this);
		for(var i = 0; i < r.n; i++)
			for(var j = 0; j < i; j++)
				r.data[i][j] = 0;
		var l = new List();
		l.add(q);
		l.add(r);
		return l;
	}

	eigenValues(){
		if(this.n != this.m) throw "Only square matrices have eigenvalues";
		var d = new Matrix(this.data);
		var qrl;
		for(var i = 0; i < 100; i++){ // 100 times, > is more accurate
			qrl = d.qrfactor(); // repeatedly qr factor
			d = qrl.data[1].mult(qrl.data[0]); // reverse multiply
		}
		var ev = new List();
		for(var i = 0; i < d.n; i++)
			ev.add(Math.round(d.data[i][i]*10000)/10000); // set values that should be zero to zero
		return ev;
	}
	eigenVectors(){
		var ev = this.eigenValues();
		var id = new Identity(this.n);
		var b = new Basis();
		for(var i = 0; i < ev.size(); i++)
			b.add(this.subtract(id.mult(ev.data[i])).fpef().nullSpace()); // (A - lambdaI)x = 0
		if(b.trivial()) throw "Cannot find eigenvectors"; // b contains 0 vector
		return b;
	}

	graph(div){

		if(this.n == 2){

			var as = [];

			var ymin = -1;
			var xmin = -1;
			var ymax = 1;
			var xmax = 1;
			for(var i = 0; i < this.m; i++){
				var p = this.getPointTo(i);
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
			  //showlegend: false,
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

		}else if(this.n == 3){

			var data = [];

			for(var i = 0; i < this.m; i++){
				var x = this.getPointTo(i)[0];
				var y = this.getPointTo(i)[1];
				var z = this.getPointTo(i)[2];
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

	toBasis(){
		var b = new Basis();
		for(var i = 0; i < this.m; i++)
			b.add(this.getCol(i));
		return b;
	}


}

class Identity extends Matrix{

	constructor(n){
		var arr = [];
		for(var i = 0; i < n; i++){
			arr.push([]);
			for(var j = 0; j < n; j++)
				arr[i].push((i == j) ? 1 : 0);
		}
		super(arr);
	}

}

Matrix.prototype.toString = function(){
	return this.json();
}

Matrix.prototype.dim = function() {
	return this.n + " X " + this.m;
}

function dimMatrix(n, m, val){
	var arr = [];
	for(var i = 0; i < n; i++){
		arr.push([]);
		for(var j = 0; j < m; j++)
			arr[i].push(val);
	}
	return new Matrix(arr);
}

function fromJson(s){
	try{
		return new Matrix(JSON.parse(s));
	}catch(err){
		throw "Invalid format";
	}
}