
var operators = {
    "^": {
        precedence: 4,
        associativity: "Right"
    },
    "/": {
        precedence: 3,
        associativity: "Left"
    },
    "*": {
        precedence: 3,
        associativity: "Left"
    },
    "+": {
        precedence: 2,
        associativity: "Left"
    },
    "-": {
        precedence: 2,
        associativity: "Left"
    }
}

var funcStr = "rref(det(I(trace(col(null(lu(list(eigval(eigvec(";

Array.prototype.clean = function(parser) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === "" || this[i] == undefined) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}

Array.prototype.combMatrix = function(p){
	var matrixStack = [];
	var cs = "";
	for(var i = 0; i < this.length; i++){
		if(matrixStack.length > 1){
			if(this[i] == ","){
				cs = postfixToVal(infixToPostFix(cs, p));
				this[matrixStack[0]] += cs + ",";
				cs = "";
			}else if(this[i] == "]"){
				cs = postfixToVal(infixToPostFix(cs, p));
				this[matrixStack[0]] += cs + "]";
				matrixStack.pop();
				cs = "";
			}else{
				cs += this[i];
			}
			this.splice(i,1);
			i--;
		}else if(matrixStack.length > 0){
			this[matrixStack[0]] += this[i];
			if(this[i] == "["){
				matrixStack.push(i);
			}else if(this[i] == "]"){
				matrixStack.pop();
			}
			this.splice(i, 1);
			i--;
		}else if(this[i] == "["){
			matrixStack.push(i);
		}
	}
	return this;
}

Array.prototype.impliedMultiplication = function(){
	for(var i = 0; i < this.length-1; i++){
    	if((this[i].isNum() || this[i].isMatrix() || this[i] == ")" || (this[i].match(/([a-z])/) && this[i].length == 1) || this[i] == "ans") && (funcStr.indexOf(this[i+1]) !== -1 || this[i+1].isMatrix() || this[i+1].match(/([a-z])/))){
    		console.log(this[i].isMatrix())
    		this.splice(i+1, 0, "*");
    	}
    }
    for(var i = 0; i < this.length-1; i++){
    	if(this[i] == "-" && this[i+1].isNum() && (i == 0 || "+-*/^(".indexOf(this[i-1]) !== -1)){
    		this[i+1] = "-" + this[i+1];
    		this.splice(i, 1);
    		i--;
    	}
    }
    return this;
}

Array.prototype.replaceVariables = function(parser, from) {
	for(var i = 0; i < this.length; i++){
		if(variables[this[i]] != null){
	    	var id = variables[this[i]];
	    	if(id == parser.id) throw "Circular reference error";
			if(!parsers[id].parse(from)) throw "Circular reference error";
			var s = $("#po-"+id.toString()).html();
			if(s == "Circular reference error") throw "Circular reference error";
	    	this[i] = s;
	    }else if(this[i] == "ans"){
	    	var id = parser.id-1;
			if(!parsers[id].parse(from)) throw "Circular reference error";
			var s = $("#po-"+(parser.id-1).toString()).html();
			if(s == "Circular reference error") throw "Circular reference error";
        	this[i] = s;
        }else if(this[i] == ","){
        	this.splice(i,1);
        	i--;
        }
	}
	return this;
}

String.prototype.isNum = function() {
    return !isNaN(parseFloat(this)) && isFinite(this) || this == "T";
}
String.prototype.isMatrix = function() {
    return this.substr(0,1) == "[";
}
String.prototype.isBasis = function() {
    return this.substr(0,1) == "{";
}
String.prototype.isList = function() {
    return this.substr(0,4) == "&lt;";
}

class Parser{

	constructor(div, my_id){
		this.id = my_id;
		this.bspace = true;
		this.graph = false;
		$(div).append(this.createObject());
		var self = this;
		$("#pi-"+self.id).on('input', function(){
			updateAll();
		});
		$("#pi-"+self.id).on('keyup', function (e) {
		    if (e.key === 'enter' || e.keyCode === 13) {
		    	if(self.id == id-1){
		    		var i = createParser();
			        $("#pi-"+i).focus();
		    	}else{
		    		$("#pi-"+(self.id+1)).focus();
			    }
		    }else if(e.key === 'backspace' || e.keyCode == 8){
		    	if(this.value === "" && self.id != 0 && self.bspace){
			    	$("#pi-"+(self.id-1)).focus();
			    	removeParser(self.id);
			    }else if(this.value === ""){
			    	self.bspace = true;
			    }
		    }else{
		    	self.bspace = false;
		    }
		});
		$("#v-"+self.id).on('click', function(){
		    var v = prompt("Variable name:");
		    $(this).html(setVariable(v, self.id));
		});
		$("#po-"+self.id).on('click', function(){
			self.parserGraph();
		});

	}

	eraseGraph(){
		$("#box-"+this.id).html("");
		this.graph = false;
	}

	parserGraph(override = false){
		if($("#po-"+this.id).html().isBasis()){
	    	if(!this.graph || override){
		    	var s = $("#po-"+this.id).html();
		    	var b = bFromJson(s);
		    	if(b.R() == 2 || b.R() == 3){
		    		b.graph("box-"+this.id);
		    		this.graph = true;
		    	}
		    }else{
		    	this.eraseGraph();
		    }
	    }else if($("#po-"+this.id).html().isMatrix()){
	    	if(!this.graph || override){
		    	var s = $("#po-"+this.id).html();
		    	var m = fromJson(s);
		    	if(m.n == 2 || m.n == 3){
		    		m.graph("box-"+this.id);
		    		this.graph = true;
		    	}
		    }else{
		    	this.eraseGraph();
		    }
	    }else{
	    	this.eraseGraph();
	    }
	}

	createObject(){
		return "<div class='parser' id='p-"+this.id+"'><input class='parse-in' id='pi-"+this.id+"'><div class='ans-container'><div class='parse-answer' id='pa-"+this.id+"'><span id='po-"+this.id+"' class='po'></span><span class='variable' id='v-"+this.id+"'></span></div><div class='box' id='box-"+this.id+"'></div></div></div>";
	}

	parse(from = null){
		if(from == null){
			from = this.id;
		}else if(from == this.id){
			console.log(this.id)
			$("#po-"+this.id).html("Circular reference error");
			updated.push(this.id);
			console.log($("#po-"+this.id).html())
			return false;
		}
		var s = $("#pi-"+this.id).val();
		if(s == ""){
			$("#po-"+this.id).html(0);
		}else{
			var change = false;
			try{
				var ans = postfixToVal(infixToPostFix(s, this, from));
				change = (ans != $("#po-"+this.id).html());
				$("#po-"+this.id).html(ans);
				if(ans.isMatrix() || ans.isBasis()) $("#po-"+this.id).css("cursor","pointer");
				else $("#po-"+this.id).css("cursor","auto");
			}catch(err){
				$("#po-"+this.id).html(err);
			}
			if(this.graph && change) this.parserGraph(true);
		}
		return true;
	}

}

function infixToPostFix(s, p, f = null){
	if(f == null) f = p.id;
	var outputQ = [];
	var operatorStack = [];
	s = s.replace(/\s+/g, "");
    s = s.split(/(ans|col\(|rref\(|det\(|I\(|trace\(|null\(|lu\(|list\(|eigval\(|eigvec\(|[\+\-\*\/\^\(\)\[\,\]]|[a-z]|T|!)/).clean(p);
    if(s.indexOf("[") != -1) s = s.combMatrix(p);
    s = s.impliedMultiplication();
    s = s.replaceVariables(p, f);
    for(var i = 0; i < s.length; i++){
    	var on = s[i];
    	if(on.isNum() || on.isMatrix() || on == "!" || on.isBasis() || on.isList()){
    		outputQ.push(on);
    	} else if("^*/+-".indexOf(on) !== -1) {
    		if(operatorStack.length == 0){
    			operatorStack.push(on);
    		}else{
    			var o2 = operatorStack[operatorStack.length - 1];
    			while("^*/+-".indexOf(o2) !== -1 && ((operators[on].associativity == "Left" && operators[on].precedence <= operators[o2].precedence) || (operators[on].associativity == "Right" && operators[on].precedence < operators[o2].precedence))){
    				outputQ.push(operatorStack.pop());
    				o2 = operatorStack[operatorStack.length - 1];
    			}
    			operatorStack.push(on);
    		}
    	} else if(on == "("){
    		operatorStack.push(on);
    	} else if(funcStr.indexOf(on) !== -1){
    		operatorStack.push(on);
    	} else if(on == ")"){
    		while(operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== "(" && funcStr.indexOf(operatorStack[operatorStack.length - 1]) == -1) {
                outputQ.push(operatorStack.pop());
            }
            if(operatorStack.length <= 0) throw "Unmatched close bracket";
            if(operatorStack[operatorStack.length - 1] == "("){
            	operatorStack.pop();
            }else{
            	outputQ.push(operatorStack.pop());
            }
    	} else {
    		throw "Invalid symbol";
    	}
    }
    while(operatorStack.length > 0) {
        outputQ.push(operatorStack.pop());
    }
    return outputQ;
}

var f = [];
function factorial (n) {
	if(n > 1e4) return "Infinity";
	if (n == 0 || n == 1)
		return 1;
	if (f[n] > 0)
		return f[n];
	return f[n] = factorial(n-1) * n;
}


function postfixToVal(q){
	var numStack = [];
	for(var i = 0; i < q.length; i++){
		if(q[i].isNum() || q[i].isMatrix() || q[i].isBasis() || q[i].isList()){
			numStack.push(q[i]);
		}else if("^*/+-!".indexOf(q[i]) !== -1){
			if(numStack.length > 0 && q[i] == "!"){
				var n1 = numStack.pop();
				if(n1.isNum()){
					n1 = parseFloat(n1);
					if(n1 % 1 != 0) throw "Invalid factorial";
					numStack.push(factorial(n1).toString());
				}else{
					throw "Invalid factorial"
				}
			}else if(numStack.length > 1){
				var n2 = numStack.pop();
				var n1 = numStack.pop();
				if(n1.isNum() && n2.isNum()){
					n2 = parseFloat(n2);
					n1 = parseFloat(n1);
					//console.log(n1 + " " + q[i] + " " + n2);
					if(q[i] == "^"){
						numStack.push(Math.pow(n1, n2));
					}else if(q[i] == "*"){
						numStack.push(n1 * n2);
					}else if(q[i] == "/"){
						numStack.push(n1 / n2);
					}else if(q[i] == "+"){
						numStack.push(n1 + n2);
					}else if(q[i] == "-"){
						numStack.push(n1 - n2);
					}
					//console.log(numStack[numStack.length - 1]);
				} else if(n1.isMatrix() && n2.isMatrix()){

					n2 = fromJson(n2);
					n1 = fromJson(n1);

					if(q[i] == "^"){
						numStack.push(n1.pow(n2).json());
					}else if(q[i] == "*"){
						numStack.push(n1.mult(n2).json());
					}else if(q[i] == "/"){
						throw "Cannot divide matrices";
					}else if(q[i] == "+"){
						numStack.push(n1.add(n2).json());
					}else if(q[i] == "-"){
						numStack.push(n1.subtract(n2).json());
					}
				} else if(n1.isMatrix()) {
					
					n1 = fromJson(n1);
					if(n2 == "T" && q[i] == "^"){
						numStack.push(n1.transpose().json());
					}else{
						n2 = parseFloat(n2);
						if(q[i] == "^"){
							numStack.push(n1.pow(n2).json());
						}else if(q[i] == "*"){
							numStack.push(n1.mult(n2).json());
						}else if(q[i] == "/"){
							numStack.push(n1.mult(1/n2).json());
						}else{
							throw "Invalid matrix operation";
						}
					}
				} else if(n2.isMatrix()){
					n1 = parseFloat(n1);
					n2 = fromJson(n2);
					if(q[i] == "*"){
						numStack.push(n2.mult(n1).json());
					}else{
						throw "Invalid matrix operation";
					}
				}
				numStack[numStack.length-1] = numStack[numStack.length-1].toString();
			}else{
				throw "Invalid syntax";
			}
		}else if(funcStr.indexOf(q[i]) !== -1){
			if(q[i] == "rref("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices can be row reduced";
					var n1 = fromJson(top);
					n1.rref();
					numStack.push(n1.json());
				}else{
					throw "Rref needs one argument";
				}
			}else if(q[i] == "det("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices have determinants";
					var n1 = fromJson(top);
					numStack.push(n1.det().toString());
				}else{
					throw "Determinant needs one argument";
				}
			}else if(q[i] == "I("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isNum()) throw "Input number into identity function";
					var n1 = new Identity(top);
					numStack.push(n1.json());
				}else{
					throw "Identity requires one argument";
				}
			}else if(q[i] == "trace("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Input matrix into trace function";
					var nm = fromJson(top);
					numStack.push(nm.trace().toString());
				}else{
					throw "Trace requires one argument";
				}
			}else if(q[i] == "col("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices have a column space";
					var nm = fromJson(top);
					numStack.push(nm.colSpace().toString());
				}else{
					throw "Column Space requires one argument";
				}
			}else if(q[i] == "null("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices have a null space";
					var nm = fromJson(top);
					numStack.push(nm.nullSpace().toString());
				}else{
					throw "Null Space requires one argument";
				}
			}else if(q[i] == "lu("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices have can be LU factorized";
					var nm = fromJson(top);
					numStack.push(nm.lufactor().toString());
				}else{
					throw "LU factorization requires one argument";
				}
			}else if(q[i] == "list("){
				if(numStack.length > 1){
					var top = numStack.pop();
					if(!top.isNum()) throw "Second arguemtn of list() must be number";
					var n = parseFloat(top);
					top = numStack.pop();
					if(!top.isList()) throw "First argument of list() must be list";
					var l = lFromJson(top);
					numStack.push(l.get(n-1));
				}else{
					throw "LU factorization requires one argument";
				}
			}else if(q[i] == "eigval("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices have eigenvalues";
					var nm = fromJson(top);
					numStack.push(nm.eigenValues().toString());
				}else{
					throw "Eigenvalue requires one argument";
				}
			}else if(q[i] == "eigvec("){
				if(numStack.length > 0){
					var top = numStack.pop();
					if(!top.isMatrix()) throw "Only matrices have eigenvectors";
					var nm = fromJson(top);
					numStack.push(nm.eigenVectors().toString());
				}else{
					throw "Eigenvector requires one argument";
				}
			}else{
				throw "Invalid symbol";
			}
		}else{
			throw "Invalid symbol";
		}
	}
	if(numStack.length != 1) throw "Invalid syntax";
	return numStack.pop();
}