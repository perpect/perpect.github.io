const canvas = document.getElementById("mainCanv");
const ctx = canvas.getContext("2d");

var camera = new Camera(0, 0);
var dragPoint = { x : 0, y : 0, isDrag : false };
var map = new WorldMap();
var userMenu = new UnitMenu();
var selectedUnit = null;

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(camera);
    map.drawTroop(camera);
    userMenu.draw();
}

canvas.addEventListener("mousedown", function(mouse){
    dragPoint.x = mouse.x + camera.x;
    dragPoint.y = mouse.y + camera.y;
    dragPoint.isDrag = true;
    //console.log(camera);
}, false);

canvas.addEventListener("mousemove", function(mouse){
    if (!dragPoint.isDrag) { return; }
    camera.x = dragPoint.x - mouse.x;
    camera.y = dragPoint.y - mouse.y;
}, false);

canvas.addEventListener("mouseup", function(mouse){
    dragPoint.isDrag = false;
    selectedTile = map.isIncludingPoint(mouse.x, mouse.y, camera);
    if (selectedTile != null) {
        selectedUnit = map.getTroop(selectedTile.x, selectedTile.y);
        console.log(selectedTile);
        console.log(selectedUnit);
    }
}, false);

canvas.addEventListener("wheel", function(mouse){
    camera.zoom -= mouse.deltaY * 0.001;
}, false);

//document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);
setInterval(update, 2);