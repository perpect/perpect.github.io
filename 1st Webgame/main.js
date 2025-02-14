const canvas = document.getElementById("mainCanv");
const ctx = canvas.getContext("2d");

var camera = new Camera(0, 0);
var dragPoint = { x : 0, y : 0, isDrag : false };
var map = [[new MapTile(TileType.PLAIN), new MapTile(TileType.PLAIN), new MapTile(TileType.PLAIN)],
    [new MapTile(TileType.PLAIN), new MapTile(TileType.PLAIN), new MapTile(TileType.PLAIN)],
    [new MapTile(TileType.PLAIN), new MapTile(TileType.PLAIN), new MapTile(TileType.PLAIN)]
]

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];
            tile.draw(x, y, camera);
        }
    }
}

canvas.addEventListener("mousedown", function(mouse){
    dragPoint.x = mouse.x;
    dragPoint.y = mouse.y;
    dragPoint.isDrag = true;
}, false);

canvas.addEventListener("mousemove", function(mouse){
    if (!isDrag) { return; }
    camera.x = dragPoint.x - mouse.x;
    camera.y = dragPoint.y - mouse.y;
}, false);

canvas.addEventListener("mouseup", function(mouse){
    dragPoint.isDrag = false;
}, false);

//document.addEventListener("keydown", keyDownHandler, false);
//document.addEventListener("keyup", keyUpHandler, false);
setInterval(update, 10);