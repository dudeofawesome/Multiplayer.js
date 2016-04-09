var ctx;
var pen = new Pen();
var pens = [];
var drawings = [];
var currentLine = 0;

function Pen (id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.down = false;
    this.color = 'red';
    this.img = new Image();
    this.img.src = '/images/pencil-white.png';
    this.img.width = this.width;
    this.img.height = this.height;
}

function hashCode (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB (i) {
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return '00000'.substring(0, 6 - c.length) + c;
}

function drawPen (x, y, color, scale) {
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (10 * scale), y);
    ctx.lineTo(x + (35 * scale), y - (25 * scale));
    ctx.lineTo(x + (25 * scale), y - (35 * scale));
    ctx.lineTo(x + (0 * scale), y - (10 * scale));
    ctx.lineTo(x, y);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + (39 * scale), y - (29 * scale));
    ctx.lineTo(x + (46 * scale), y - (36 * scale));
    ctx.lineTo(x + (36 * scale), y - (46 * scale));
    ctx.lineTo(x + (29 * scale), y - (39 * scale));
    ctx.fill();

    ctx.fillStyle = 'transparent';
}

function loop () {
    requestAnimationFrame(loop);

    ctx.clearRect(0, 0, ctx.width, ctx.height);

    for (var i in drawings) {
        ctx.strokeStyle = drawings[i].color;
        ctx.beginPath();
        if (drawings[i].path[0]) {
            ctx.moveTo(drawings[i].path[0].x, drawings[i].path[0].y);
        }
        for (var j in drawings[i].path) {
            ctx.lineTo(drawings[i].path[j].x, drawings[i].path[j].y);
        }
        ctx.stroke();
    }

    drawPen(pen.x, pen.y, pen.color, 0.35 * pen.scale);

    for (var i in pens) {
        if (pens[i] && i !== pen.id) {
            // ctx.drawImage(pens[i].img, pens[i].x, pens[i].y - pens[i].height, pens[i].width, pens[i].height);
            drawPen(pens[i].x, pens[i].y, pens[i].color, 0.35 * pens[i].scale);
        }
    }

    ctx.fillStyle = 'white';
    ctx.beginPath();
}

window.onload = function () {
    // Sets up and connects to the multiplayer server
    var mp = new Multiplayer(pen, ['x', 'y', 'color', 'down', 'scale']);
    mp.addCallback('connect', (id) => {
        pen.color = '#' + intToRGB(hashCode(id));
        pen.id = id;
    });

    mp.addCallback('newPlayer', (player) => {
        var newPen = new Pen(player.id);
        pens[player.id] = newPen;
        mp.linkPlayerID(player.id, newPen);
    });

    mp.addCallback('deadPlayer', (id) => {
        pens[id] = undefined;
        mp.unlinkPlayerID(id);
    });

    mp.addCallback('newLine', (line) => {
        drawings.push(line);
    });

    ctx = new Canvas({color: 'rgb(45,45,45)', dblclick_fullscreen:true});

    Input.bind('onmousedown', function () {
        pen.down = true;
        pen.scale = 1.3;
        currentLine = drawings.push({color: pen.color, path: []}) - 1;
    });
    Input.bind('onmouseup', function () {
        pen.down = false;
        pen.scale = 1;
        console.log(currentLine);
        mp.emit('newLine', drawings[currentLine]);
    });
    Input.bind('onmousemove', function (x, y) {
        pen.x = x;
        pen.y = y;
        if (pen.down) {
            drawings[drawings.length - 1].path.push({x: x, y: y});
        }
    });

    loop();
};
