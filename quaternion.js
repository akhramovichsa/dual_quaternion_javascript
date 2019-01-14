/**
 *
 * Author 2017, Akhramovich A. Sergey (akhramovichsa@gmail.com)
 * see https://github.com/infusion/Quaternion.js
 */

/**
 * Quaternion constructor
 *
 * @constructor
 * @returns {Quaternion}
 */
function Quaternion(q0, q1, q2, q3) {
	if (q0 === undefined) {
		this.q = [1, 0, 0, 0];
	} else {
		this.q = [q0, q1, q2, q3];
	}
	return this;
}

// Получение кватерниона по углам Эйлера
// Внимание! Порядок углов и последовательность поворотов строго определена OY -> OZ -> OX.
// Используется связанная система координат (ось OY - вверх, ось - OX - вперед, ось OZ - вправо)
// psi   - угол рысканья (вокруг оси OY)
// theta - угол тангажа  (вокруг оси OZ)
// gamma - угол крена    (вокруг оси OX)
Quaternion['fromEuler'] = function(psi, theta, gamma) {
	s_psi   = Math.sin(psi*0.5);   c_psi   = Math.cos(psi*0.5);
	s_theta = Math.sin(theta*0.5); c_theta = Math.cos(theta*0.5);
	s_gamma = Math.sin(gamma*0.5); c_gamma = Math.cos(gamma*0.5);

	return new Quaternion(  
		c_psi*c_theta*c_gamma - s_psi*s_theta*s_gamma,
		c_psi*c_theta*s_gamma + s_psi*s_theta*c_gamma,
		c_psi*s_theta*s_gamma + s_psi*c_theta*c_gamma,
		c_psi*s_theta*c_gamma - s_psi*c_theta*s_gamma);
};

/**
 * Получение кватерниона, определяемый как угол между двумя векторами
 */
Quaternion['fromBetweenVectors'] = function(u, v) {
	var a = u[0];
	var b = u[1];
	var c = u[2];

	var x = v[0];
	var y = v[1];
	var z = v[2];

	var dot = a * x + b * y + c * z;
	var w1  = b * z - c * y;
	var w2  = c * x - a * z;
	var w3  = a * y - b * x;

	return new Quaternion(
		dot + Math.sqrt(dot * dot + w1 * w1 + w2 * w2 + w3 * w3),
		w1,
		w2,
		w3
	).normalize();
};

Quaternion.prototype = {
	'q': [1, 0, 0, 0],


	/**
	 * Получение углов Элера (psi, theta, gamma) из кватерниона
	 */
	'getEuler': function() {
		sin_psi   = -2*(this.q[1]*this.q[3] - this.q[0]*this.q[2]);
		cos_psi   = Math.pow(this.q[0], 2) + Math.pow(this.q[1], 2) - Math.pow(this.q[2], 2) - Math.pow(this.q[3], 2);

		sin_theta =  2*(this.q[1]*this.q[2] + this.q[0]*this.q[3]);

		sin_gamma = -2*(this.q[2]*this.q[3] - this.q[0]*this.q[1]);
		cos_gamma = Math.pow(this.q[0], 2) - Math.pow(this.q[1], 2) + Math.pow(this.q[2], 2) - Math.pow(this.q[3], 2);

		psi   = Math.atan2(sin_psi, cos_psi);
		theta = Math.asin(sin_theta);
		gamma = Math.atan2(sin_gamma, cos_gamma);

		return [psi, theta, gamma];
	},

	/**
	 * Кватернионное умножение
	 * Q1 * Q2 = [w1 * w2 - dot(v1, v2), w1 * v2 + w2 * v1 + cross(v1, v2)]
	 */
	'mul': function(Q2) {
		var w1 = this.q[0];
		var x1 = this.q[1];
		var y1 = this.q[2];
		var z1 = this.q[3];

		var w2 = Q2.q[0];
		var x2 = Q2.q[1];
		var y2 = Q2.q[2];
		var z2 = Q2.q[3];

		return new Quaternion(
			w1*w2 - x1*x2 - y1*y2 - z1*z2,
			w1*x2 + x1*w2 + y1*z2 - z1*y2,
			w1*y2 + y1*w2 + z1*x2 - x1*z2,
			w1*z2 + z1*w2 + x1*y2 - y1*x2);
	},

	/**
	 * Сопряженный кватернион
	 * Q' := (q0, -q1, -q2, -q3)
	 */
	'conjugate': function() {
		return new Quaternion(this.q[0], -this.q[1], -this.q[2], -this.q[3]);
	},

	/**
	 * Норма кватерниона - сумма квадратов
	 * ||Q|| := |Q|^2
	 */
	'norm': function() {
		return Math.pow(this.q[0], 2) + Math.pow(this.q[1], 2) + Math.pow(this.q[2], 2) + Math.pow(this.q[3], 2);
	},

	/**
	 * Модуль кватерниона - квадратный корень из сумма квадратов (нормы)
	 * |Q| := sqrt(|Q|^2)
	 */
	'mod': function() {
		return Math.sqrt(this.norm());
	},
	
	/**
	 * Нормализация кватерниона |Q| = 1
	 */
	'normalize': function() {
		var q_mod = this.mod();
		return new Quaternion(this.q[0]/q_mod, this.q[1]/q_mod, this.q[2]/q_mod, this.q[3]/q_mod);
	},

	/**
	* Обратный кватернион
	* Q^-1 * Q = 1 and Q * Q^-1 = 1
	* Q^-1 := Q' / |Q|^2 = [w / (w^2 + |v|^2), -v / (w^2 + |v|^2)]
	*
	* @returns {Quaternion}
	*/
	'inverse': function() {
		var q_norm = this.norm();
		return new Quaternion(this.q[0]/q_norm, -this.q[1]/q_norm, -this.q[2]/q_norm, -this.q[3]/q_norm);
	},

	/**
	 * Вращение 3-х мерного вектора кватернионом
	 *  [0, v'] = Q * [0, v] * Q'
	 */
	'rotateVector': function(v) {
		return this.mul(new Quaternion(0, v[0], v[1], v[2])).mul(this.conjugate());
	},

	/**
	 * Преобразовать в строку, для отладки
	 */
	'toString': function() {
		return '[' + this.q[0].toString() + ', ' + this.q[1].toString() + ', ' + this.q[2].toString() + ', ' + this.q[3].toString() + ']';
	}
}

/*
// TEST:
q1 = new Quaternion.fromEuler(90 * Math.PI/180.0, 0 * Math.PI/180, 0 * Math.PI/180);
console.log(q1.toString());
console.log('euler[psi theta gamma] = ' + q1.getEuler());

q1_conj = q1.conjugate();

console.log('conjugate = ' + q1_conj.toString());
console.log('norm = ' + q1.norm());

console.log('q*q\' = ' + q1.mul(q1_conj).getEuler());

console.log('v rotate q = ' + q1.rotateVector([1, 0, 0]));

console.log('beetwen 2 verctors = ' + new Quaternion.fromBetweenVectors([1, 0, 0], [0, 0, -1]));
*/