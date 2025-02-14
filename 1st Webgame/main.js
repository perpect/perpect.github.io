const canvas = document.getElementById("mainCanv");
const ctx = canvas.getContext("2d");

var camera = new Camera(0, 0);
var dragStartPos = { x : 0, y : 0 };
var a = new MapTile(0);

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    a.draw(0, 0, camera);
    a.draw(1, 0, camera);
    a.draw(0, 1, camera);
    a.draw(1, 1, camera);
    a.draw(1, 2, camera);
}

canvas.addEventListener("mousedown", function(mouse){
    dragStartPos.x = mouse.x;
    dragStartPos.y = mouse.y;
}, false);

canvas.addEventListener("mousemove", function(mouse){
    camera.x += dragStartPos.x - mouse.x;
    camera.y += dragStartPos.y - mouse.y;
}, false);

//document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);
setInterval(update, 10);