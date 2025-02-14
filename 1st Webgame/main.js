const canvas = document.getElementById("mainCanv");
const ctx = canvas.getContext("2d");

var camera = new Camera(0, 0);
var dragStartPos = { x : 0, y : 0 };
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