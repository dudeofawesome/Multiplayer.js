var ctx;
var pen = new Pen();
var pens = [];
var drawings = [];
var currentLine = 0;

function Pen (id) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.width = 20;
    this.height = 20;
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

    ctx.drawImage(pen.img, pen.x, pen.y - pen.height, pen.width, pen.height);

    for (var i in pens) {
        if (pens[i] && i !== pen.id) {
            ctx.drawImage(pens[i].img, pens[i].x, pens[i].y - pens[i].height, pens[i].width, pens[i].height);
        }
    }
}

window.onload = function () {
    // Sets up and connects to the multiplayer server
    var mp = new Multiplayer(pen, ['x', 'y', 'color', 'down']);
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
        currentLine = drawings.push({color: pen.color, path: []}) - 1;
    });
    Input.bind('onmouseup', function () {
        pen.down = false;
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
