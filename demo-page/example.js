function hashCode (str) { // java String#hashCode
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

function addDot (x, y, color) {
    let sprite = document.createElement('div');
    sprite.style.position = 'absolute';
    sprite.style.left = x;
    sprite.style.top = y;
    sprite.style.width = 5;
    sprite.style.height = 5;
    sprite.style.backgroundColor = color;
    document.body.appendChild(sprite);
}

window.onload = function () {
    // Sets up and connects to the multiplayer server
    var me = document.getElementById('me');
    var mp = new Multiplayer(me.style, ['left', 'top']);
    mp.addCallback('connect', (id) => {
        me.style.backgroundColor = '#' + intToRGB(hashCode(id));
    });

    mp.addCallback('newPlayer', (player) => {
        let sprite = document.createElement('div');
        sprite.id = player.id;
        sprite.style.backgroundColor = '#' + intToRGB(hashCode(player.id));
        document.body.appendChild(sprite);
        mp.linkPlayerID(player.id, sprite.style);
    });

    mp.addCallback('deadPlayer', (id) => {
        document.getElementsByTagName('body')[0].removeChild(document.getElementById(id));
        mp.unlinkPlayerID(id);
    });

    mp.addCallback('showDot', (data) => {
        addDot(data.x, data.y, data.color);
    });

    // Updates mul.me and square position on the screen
    window.addEventListener('mousemove', function (event) {
        // mul.update({ x:event.pageX, y:event.pageY })
        me.style.left = event.pageX;
        me.style.top = event.pageY;
    });

    window.addEventListener('mousedown', function (event) {
        addDot(event.pageX, event.pageY, me.style.backgroundColor);
        mp.emit('showDot', {
            x: event.pageX,
            y: event.pageY,
            color: me.style.backgroundColor
        });
    });
};
