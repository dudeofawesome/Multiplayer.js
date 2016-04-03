// Accepts an object parameter with the following options
// 'x' - x position | default: 0 // TODO - implement
// 'y' - y position | default: 0 // TODO - implement
// 'width' - canvas width | default: screen width
// 'height' - canvas hegiht | default: screen height
// 'color' - canvas color | default: white
Canvas = function (options) {
    // Canvas setup
    var context = document.createElement('canvas').getContext('2d');
    context.canvas.innerHTML = 'Your browser does not fully support HTML5';
    context.canvas.id = document.getElementsByTagName('canvas').length;
    context.canvas.style.position = 'absolute';
    context.canvas.style.left = 0;
    context.canvas.style.top = 0;
    context.canvas.style.right = 0;
    context.canvas.style.bottom = 0;
    context.canvas.style.backgroundColor = options.color || 'white';
    // context.canvas.ondblclick = this.webkitRequestFullScreen();

    context.resize = function () {
        context.width = options.width || window.innerWidth;
        context.height = options.height || window.innerHeight;
        context.canvas.width = context.width;
        context.canvas.height = context.height;
    };

    context.resize();

    document.body.appendChild(context.canvas);
    window.onresize = context.resize;

    return context;
};
