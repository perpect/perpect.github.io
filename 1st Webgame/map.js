class Camera{
    constructor(x, y, zoom = 1) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }
}

const TileType = {
    PLAIN : 0
};
Object.freeze(TileType);

const TileColor = [
    ("#757003", "#6a8518")
];
Object.freeze(TileColor);

class MapTile{
    constructor(type, size = 20) {
        this.type = type;
        this.size = size;
    }

    draw(tileX, tileY, camera){
        const SQRT3 = 1.732;
        let size = this.size * camera.zoom;
        let x = tileX * size * SQRT3 - tileY * size * SQRT3 / 2 - camera.x;
        let y = -tileY * size * 3 / 2 - camera.y;

        ctx.strokeStyle = TileColor[this.type][0];
        ctx.fillStyle = TileColor[this.type][1];
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size * SQRT3 / 2, y + size / 2);
        ctx.lineTo(x + size * SQRT3 / 2, y - size / 2);
        ctx.lineTo(x, y - size);
        ctx.lineTo(x - size * SQRT3 / 2, y - size / 2);
        ctx.lineTo(x - size * SQRT3 / 2, y + size / 2);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
    }
}