/**
 *
 * Author 2017, Akhramovich A. Sergey (akhramovichsa@gmail.com)
 * see https://github.com/infusion/Quaternion.js
 */

// 'use strict';

/**
 * Dual Quaternion constructor
 *
 * @constructor
 * @returns {DualQuaternion}
 */
function DualQuaternion(dq0, dq1, dq2, dq3,  dq4, dq5, dq6, dq7) {
	if (dq0 === undefined) {
		this.dq = [1, 0, 0, 0,  0, 0, 0, 0];
	} else {
		this.dq = [dq0, dq1, dq2, dq3,  dq4, dq5, dq6, dq7];
	}
	return this;
};

// Получение кватерниона по углам Эйлера и вектору положения
DualQuaternion['fromEulerVector'] = function(psi, theta, gamma, v) {
	var q_real = new Quaternion.fromEuler(psi, theta, gamma);
	var q_v    = new Quaternion(0, v[0], v[1], v[2]);
	var q_dual = q_v.mul(q_real);

	return new DualQuaternion(
		q_real.q[0],     q_real.q[1],     q_real.q[2],     q_real.q[3],
		q_dual.q[0]*0.5, q_dual.q[1]*0.5, q_dual.q[2]*0.5, q_dual.q[3]*0.5);
};

DualQuaternion.prototype = {
	'dq': [1, 0, 0, 0,  0, 0, 0, 0],
	
	/**
	 * Получение углов Эйлера (psi, theta, gamma) и вектора положения из бикватерниона
	 */
	'getEulerVector': function() {
		var euler_angles = this.getReal().getEuler();

		var q_dual = this.getDual();
		var q_dual_2 = new Quaternion(2.0*q_dual.q[0], 2.0*q_dual.q[1], 2.0*q_dual.q[2], 2.0*q_dual.q[3]);
		var q_vector = q_dual_2.mul(this.getReal().conjugate());

		return [euler_angles[0], euler_angles[1], euler_angles[2],
			q_vector.q[1], q_vector.q[2], q_vector.q[3]];
	},

	/**
	 * Получение только вектора положения из бикватерниона
	 */
	'getVector': function() {
		var euler_vector = this.getEulerVector();
		return [euler_vector[3], euler_vector[4], euler_vector[5]];
	},

	/**
	 * Получить действительную часть бикватерниона
	 * @returns {Quaternion}
	 */
	'getReal': function() {
		return new Quaternion(this.dq[0], this.dq[1], this.dq[2], this.dq[3]);
	},

	/**
	 * Получить дуальную часть бикватерниона
	 * @returns {Quaternion}
	 */
	'getDual': function() {
		return new Quaternion(this.dq[4], this.dq[5], this.dq[6], this.dq[7]);
	},

	/**
	 * Норма бикватерниона
	 * Внимание! Возвращает дуальное число!
	 */
	'norm': function() {
		return [Math.pow(this.dq[0], 2) + Math.pow(this.dq[1], 2) + Math.pow(this.dq[2], 2) + Math.pow(this.dq[3], 2),
			this.dq[0]*this.dq[4] + this.dq[1]*this.dq[5] + this.dq[2]*this.dq[6] + this.dq[3]*this.dq[7]];
	},

	/**
	 * Модуль бикватерниона
	 * Внимание! Возвращает дуальное число!
	 */
	'mod': function() {
		var q_real_mod = Math.sqrt(Math.pow(this.dq[0], 2) + Math.pow(this.dq[1], 2) + Math.pow(this.dq[2], 2) + Math.pow(this.dq[3], 2));
		return [q_real_mod,
			(this.dq[0]*this.dq[4] + this.dq[1]*this.dq[5] + this.dq[2]*this.dq[6] + this.dq[3]*this.dq[7])/q_real_mod];
	},

	/**
	 * Сопряженный бикватернион
	 * DQ' := (dq0, -dq1, -dq2, -dq3,  dq4, -dq5, -dq6, -dq7)
	 */
	'conjugate': function() {
		return new DualQuaternion(this.dq[0], -this.dq[1], -this.dq[2], -this.dq[3],  this.dq[4], -this.dq[5], -this.dq[6], -this.dq[7]);
	},

	// Вычислить обратный бикватернион
	'inverse': function() {
		var q_real_norm = new Quaternion(this.dq[0], this.dq[1], this.dq[2], this.dq[3]).norm();
		
		var dq_norm_inv = [q_real_norm, - (this.dq[0]*this.dq[4] + this.dq[1]*this.dq[5] + this.dq[2]*this.dq[6] + this.dq[3]*this.dq[7])/q_real_norm];

		var dq_conj = this.conjugate();
		
		// Умножение бикватерниона на дуальное число
		return new DualQuaternion(
			dq_norm_inv[0] * dq_conj.dq[0], 
			dq_norm_inv[0] * dq_conj.dq[1],
			dq_norm_inv[0] * dq_conj.dq[2],
			dq_norm_inv[0] * dq_conj.dq[3],
			dq_norm_inv[0] * dq_conj.dq[4] + dq_norm_inv[1] * dq_conj.dq[0],
			dq_norm_inv[0] * dq_conj.dq[5] + dq_norm_inv[1] * dq_conj.dq[1],
			dq_norm_inv[0] * dq_conj.dq[6] + dq_norm_inv[1] * dq_conj.dq[2],
			dq_norm_inv[0] * dq_conj.dq[7] + dq_norm_inv[1] * dq_conj.dq[3]);
	},

	/**
	 * Бикватернионное умножение
	 * q1_real*q2_real, q1_real*q2_dual + q1_dual*q2_real
	 */
	'mul': function(DQ2) {
		var q1_real = this.getReal();
		var q1_dual = this.getDual();
		var q2_real = DQ2.getReal();
		var q2_dual = DQ2.getDual();

		var q_res_real   = q1_real.mul(q2_real);
		var q_res_dual_1 = q1_real.mul(q2_dual);
		var q_res_dual_2 = q1_dual.mul(q2_real);

		return new DualQuaternion(
			q_res_real.q[0],
			q_res_real.q[1],
			q_res_real.q[2],
			q_res_real.q[3],
			q_res_dual_1.q[0] + q_res_dual_2.q[0],
			q_res_dual_1.q[1] + q_res_dual_2.q[1],
			q_res_dual_1.q[2] + q_res_dual_2.q[2],
			q_res_dual_1.q[3] + q_res_dual_2.q[3]);
	},

	/**
	 * Преобрвазование вектора бикватернионом
	 */
	'transformVector': function (v) {
		var dq_res = this.mul(new DualQuaternion(1, 0, 0, 0,  0, v[0], v[1], v[2])).mul(this.conjugate());

		return [dq_res.dq[5], dq_res.dq[6], dq_res.dq[7]];
	},

	/**
	 * Преобразовать в строку, для отладки
	 */
	'toString': function() {
		return '[' + 
			this.dq[0].toString() + ', ' + this.dq[1].toString() + ', ' + this.dq[2].toString() + ', ' + this.dq[3].toString() + ', ' +
			this.dq[4].toString() + ', ' + this.dq[5].toString() + ', ' + this.dq[6].toString() + ', ' + this.dq[7].toString() + ']';
	}

}

/*
// TEST:
var dq1 = new DualQuaternion.fromEulerVector(0 * Math.PI/180.0, 0 * Math.PI/180, 0 * Math.PI/180, [10, 20, 30]);

console.log(dq1.toString());
console.log('getEulerVector = ', dq1.getEulerVector());

console.log('norm = ', dq1.norm());
console.log('mod = ', dq1.mod());
console.log('conjugate = ', dq1.conjugate().dq);
console.log('inverse = ', dq1.inverse().dq);

var dq2 = new DualQuaternion.fromEulerVector(0 * Math.PI/180.0, 0 * Math.PI/180, 0 * Math.PI/180, [10, 0, 0]);
console.log('mul = ', dq1.mul(dq2).dq);

console.log('transformVector ??? = ', dq1.transformVector([0, 0, 0]));
*/