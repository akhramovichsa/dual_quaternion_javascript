// ----------------------------------------------------- //
//                      КОРАБЛИК                         //
// ----------------------------------------------------- //
function Ship(ctx, v) {
    this.ctx    = ctx;
    this.dq_pos = new DualQuaternion.fromEulerVector(0*Math.PI/180, 0, 0, v);

    // Форма корабля
    this.dq_forward_left    = new DualQuaternion.fromEulerVector(0, 0, 0, [ 15, 0, -10]);
    this.dq_forward_right   = new DualQuaternion.fromEulerVector(0, 0, 0, [ 15, 0,  10]);
    this.dq_backward_left   = new DualQuaternion.fromEulerVector(0, 0, 0, [-15, 0, -10]);
    this.dq_backward_right  = new DualQuaternion.fromEulerVector(0, 0, 0, [-15, 0,  10]);
    this.dq_forward_forward = new DualQuaternion.fromEulerVector(0, 0, 0, [ 30, 0,  0]);

    // Приращения текущей позиции при управлении
    this.dq_dx_left     = new DualQuaternion.fromEulerVector( 1*Math.PI/180, 0, 0, [0, 0, 0]);
    this.dq_dx_right    = new DualQuaternion.fromEulerVector(-1*Math.PI/180, 0, 0, [0, 0, 0]);
    this.dq_dx_forward  = new DualQuaternion.fromEulerVector(0, 0, 0, [ 1, 0, 0]);
    this.dq_dx_backward = new DualQuaternion.fromEulerVector(0, 0, 0, [-1, 0, 0]);

    return this;
};

Ship.prototype = {
    'ctx': 0,
    'dq_pos':  new DualQuaternion.fromEulerVector(0, 0, 0, 0, 0, 0),

    /**
     * Нарисовать кораблик
     */
    'draw': function() {

        // Переместить все точки кораблика с помощью бикватрнионного умножения
        v_pos             = this.dq_pos.getVector();
        v_forward_left    = this.dq_pos.mul(this.dq_forward_left).getVector();
        v_forward_right   = this.dq_pos.mul(this.dq_forward_right).getVector();
        v_backward_left   = this.dq_pos.mul(this.dq_backward_left).getVector();
        v_backward_right  = this.dq_pos.mul(this.dq_backward_right).getVector();
        v_forward_forward = this.dq_pos.mul(this.dq_forward_forward).getVector();

        // Непосредственно рисование
        ctx.beginPath();
        ctx.moveTo(v_backward_left[0],   v_backward_left[2]);
        ctx.lineTo(v_forward_left[0],    v_forward_left[2]);
        ctx.lineTo(v_forward_left[0],    v_forward_left[2]);
        ctx.lineTo(v_forward_forward[0], v_forward_forward[2]);
        ctx.lineTo(v_forward_right[0],   v_forward_right[2]);
        ctx.lineTo(v_backward_right[0],  v_backward_right[2]);
        ctx.lineTo(v_backward_left[0],   v_backward_left[2]);
        ctx.stroke();
        ctx.closePath();
    }
};

// ----------------------------------------------------- //
//                       ОРУДИЕ                          //
// ----------------------------------------------------- //
function Gun(ctx, ship, v) {
    this.ctx  = ctx;
    this.ship = ship;

    // Позиция орудия относительно корабля
    this.dq_pos = new DualQuaternion.fromEulerVector(0, 0, 0, v);

    // Форма орудия
    this.dq_forward  = new DualQuaternion.fromEulerVector(0, 0, 0, [20, 0, 0]);
    this.dq_backward = new DualQuaternion.fromEulerVector(0, 0, 0, [ 0, 0, 0]);

    // Вращение орудия при управлении
    this.dq_dx_left     = new DualQuaternion.fromEulerVector( 1*Math.PI/180, 0, 0, [0, 0, 0]);
    this.dq_dx_right    = new DualQuaternion.fromEulerVector(-1*Math.PI/180, 0, 0, [0, 0, 0]);

    return this;
};

Gun.prototype = {
    'ctx':  0,
    'ship': 0,
    'dq_pos': new DualQuaternion.fromEulerVector(0, 0, 0, [0, 0, 0]),

    /**
     * Нарисовать орудие
     */
    'draw': function() {

        // Переместить орудие относительно корабля
        v_pos        = this.ship.dq_pos.getVector();
        v_forward    = this.ship.dq_pos.mul(this.dq_backward).mul(this.dq_forward).getVector();
        v_backward   = this.ship.dq_pos.mul(this.dq_backward).getVector();
        
        // Непосредственно рисование
        ctx.beginPath();
        ctx.moveTo(v_backward[0], v_backward[2]);
        ctx.lineTo(v_forward[0],  v_forward[2]);
        ctx.stroke();
        ctx.closePath();
    }
};

// ----------------------------------------------------- //
//                ОБРАБОТЧИКИ УПРАВЛЕНИЯ                 //
// ----------------------------------------------------- //
leftPressed  = false;
rightPressed = false;
upPressed    = false;
downPressed  = false;
dq_mouse_pos = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 0, 0]);

document.addEventListener("keydown",   keyDownHandler,   false);
document.addEventListener("keyup",     keyUpHandler,     false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// Обраотка нажатия клавиш управления
function keyDownHandler(e) {
    if      (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97)  { leftPressed  = true; } // влево  A
    else if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { upPressed    = true; } // вверх  W
    else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = true; } // вправо D
    else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed  = true; } // вниз   S
}

// Обработка отжатия клавиш управления
function keyUpHandler(e) {
    if      (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97)  { leftPressed  = false; } // влево  A
    else if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { upPressed    = false; } // вверх  W
    else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = false; } // вправо D
    else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed  = false; } // вниз   S
}

// Обработка мышки, управляет орудием корабля
function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    var relativeY = e.clientY - canvas.offsetTop;

    // Обрабатывать события только когда курсор мышки находится в игровой области
    if (relativeX > 0 && relativeX < canvas.width && 
        relativeY > 0 && relativeY < canvas.height) {
        
        // Бикватернион положения мышки
        dq_mouse_pos = new DualQuaternion.fromEulerVector(0, 0, 0, [relativeX, 0, relativeY]);

        // Бикватернион положения мышки относительно корабля
        // Направление орудия. От координат мышки отнимается координаты корабля
        // Последовательность бикватернионного умножения важна
        // DQ_ship^(-1) * DQ_mouse
        dq_mouse_pos_about_ship = ship_1.dq_pos.inverse().mul(dq_mouse_pos);

        // Угол между векторами орудия и мышки
        q_gun_mouse = new Quaternion.fromBetweenVectors(gun_1.dq_forward.getVector(), dq_mouse_pos_about_ship.getVector());

        dq_gun_mouse = new DualQuaternion(q_gun_mouse.q[0], q_gun_mouse.q[1], q_gun_mouse.q[2], q_gun_mouse.q[3], 0, 0, 0, 0);

        gun_1.dq_backward = dq_gun_mouse;
        
        // console.log(dq_gun_mouse.getEulerVector());
        // console.log(relativeX + ' ' + relativeY + ' ' + gun_1.dq_forward.toString());
    }
}

// ----------------------------------------------------- //
//           ИНИЦИАЛИЗАЦИЯ И ОСНОВНОЙ ЦИКЛ               //
// ----------------------------------------------------- //
var canvas = document.getElementById("myCanvas");
var ctx    = canvas.getContext("2d");

ship_1 = new Ship(ctx, [100, 0, 100]);
gun_1  = new Gun(ctx, ship_1, [0, 0, 0]);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ship_1.draw();
    gun_1.draw();

    // Debug info
    ship_euler_vector    = ship_1.dq_pos.getEulerVector();
    ship_euler_vector[0] = ship_euler_vector[0]*180/Math.PI;
    ship_euler_vector[1] = ship_euler_vector[1]*180/Math.PI;
    ship_euler_vector[2] = ship_euler_vector[2]*180/Math.PI;
    ship_euler_vector    = ship_euler_vector.map(function(each_element){ return each_element.toFixed(2); });
    ship_dq              = ship_1.dq_pos.dq.map(function(each_element){ return each_element.toFixed(2); });

    gun_dq = ship_1.dq_pos.mul(gun_1.dq_backward).dq.map(function(each_element){ return each_element.toFixed(2); });

    ctx.font = "8pt Courier";
    ctx.fillText("Ship: " + ship_dq + " | ψ, ϑ, ϒ, vector:" + ship_euler_vector, 10, 20);
    ctx.fillText("Gun:  " + gun_dq, 10, 40);

    // Управление корабликом
    if (leftPressed)  { ship_1.dq_pos = ship_1.dq_pos.mul(ship_1.dq_dx_left);     }
    if (rightPressed) { ship_1.dq_pos = ship_1.dq_pos.mul(ship_1.dq_dx_right);    }
    if (upPressed)    { ship_1.dq_pos = ship_1.dq_pos.mul(ship_1.dq_dx_forward);  }
    if (downPressed)  { ship_1.dq_pos = ship_1.dq_pos.mul(ship_1.dq_dx_backward); }

    requestAnimationFrame(draw);
}

draw();