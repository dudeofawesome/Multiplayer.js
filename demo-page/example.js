/*
* Space Invaders structure
** @author Josh GIbbs - uPaymeiFixit@gmail.com
*/

var ctx;
var ai = [];
var player;
var bullet = [];
var frame = 0;
var timer;
var score = 0;
var vx;
var vy;

const initial_ai = 50;
const framerate = 60; // fps
const player_size = 8; // px
const ai_size = 4; // px
const bullet_size = 2; // px
const player_speed = 5;
const bullet_speed = 5;
const ai_speed = 1;
const frames_per_bullet = 1;

window.onload = function () {
    ctx = new Canvas({color:'#222222'});
    ctx.font = '20pt Arial';

    for (var i = 0; i < initial_ai; i++) {
        makeAI();
    };

    makePlayer();
    timer = setInterval('main()', 1000 / framerate);
};

/*** INPUT ***/

var mx = 0;
var my = 0;
var mdown = false;
document.onmousemove = function (e) { mx = e ? e.pageX : event.pageX; my = e ? e.pageY : event.pageY; };
document.onmousedown = function () { mdown = true; };
document.onmouseup = function () { mdown = false; };
document.onkeypress = function (e) {
    e = e ? e : event;
    if (e.keyCode == 112) {
        timer ? clearInterval(timer) : (timer = setInterval('main()', 1000 / framerate));
    };
};

function makePlayer () {
    player = {
        x: ctx.width / 2,
        y: ctx.height / 2,
        radius: player_size
    };
};

function makeAI () {
    if (Math.random() > 0.5) {
        var x = Math.random() < 0.5 ? Math.random() * -100 : Math.random() * 100 + ctx.width;
        var y = Math.random() * ctx.height;
    } else {
        var x = Math.random() * ctx.width;
        var y = Math.random() < 0.5 ? Math.random() * -100 : Math.random() * 100 + ctx.height;
    };
    ai[ai.length] = {
        x: x,
        y: y,
        radius: ai_size
    };
};

function makeBullet () {
    bullet[bullet.length] = {
        x: player.x,
        y: player.y,
        vx: player.vx * bullet_speed,
        vy: player.vy * bullet_speed,
        radius: bullet_size
    };
};

function main () {
    frame++;

    ctx.clearRect(0, 0, ctx.width, ctx.height);

    if ((!(frame % frames_per_bullet)) && mdown) {
        makeBullet();
    };

    var theta = Math.atan2((my - player.y), (mx - player.x));
    player.vx = Math.cos(theta) * player_speed;
    player.vy = Math.sin(theta) * player_speed;

    ctx.fillStyle = '#00ff00';
    draw(player);

    ctx.fillStyle = '#ff00ff';
    for (var i = 0; i < bullet.length; i++) {

        bullet[i].x += bullet[i].vx - player.vx;
        bullet[i].y += bullet[i].vy - player.vy;

        draw(bullet[i]);

        for (var j = 0; j < ai.length; j++) {
            if (collision(bullet[i], ai[j])) {
                ai.splice(j, 1);
                bullet.splice(i, 1);
                makeAI();
                makeAI();
                score++;
            };
        };

        if (bullet[i].x > ctx.width || bullet[i].x < 0 || bullet[i]. y > ctx.height || bullet[i].y < 0) {
            bullet.splice(i, 1);
        };

    };

    ctx.fillStyle = '#00ffff';
    var sc = 'Score ' + score;
    ctx.fillText(sc, 100, 100);

    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < ai.length; i++) {

        var theta = Math.atan2((player.y - ai[i].y), (player.x - ai[i].x));
        ai[i].vx = Math.cos(theta) * ai_speed;
        ai[i].vy = Math.sin(theta) * ai_speed;

        ai[i].x += ai[i].vx - player.vx;
        ai[i].y += ai[i].vy - player.vy;

        draw(ai[i]);

        if (collision(ai[i], player)) {
            clearInterval(timer);
            ctx.fillStyle = '#ff0000';
            ctx.font = '70pt Arial';
            ctx.fillText('GAME OVER', 100, 300);
            return null;
        };
    };
};

function draw (ob) {
    ctx.beginPath();
    ctx.arc(ob.x, ob.y, ob.radius, 0, 6.2832, true);
    ctx.fill();
};

function collision (obj1, obj2) {
    var dx = obj1.x - obj2.x;
    var dy = obj1.y - obj2.y;
    var r = obj1.radius + obj2.radius + 5; // 5 is a buffer, if you two are 5 away, you die
    if (Math.pow(r, 2) > Math.pow(dx, 2) + Math.pow(dy, 2)) {
        return true;
    }
    return false;
};
