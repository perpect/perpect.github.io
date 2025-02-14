const canvas = document.getElementById("mainCanv");
const ctx = canvas.getContext("2d");
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;

var a = new MapTile(0);

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    a.draw(0, 0, 0, 0, 10);
    a.draw(1, 0, 0, 0, 10);
    a.draw(0, 1, 0, 0, 10);
    a.draw(1, 1, 0, 0, 10);
    a.draw(1, 2, 0, 0, 10);
}

//document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);
setInterval(update, 10);