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

class WorldMap{

}

class MapTile{
    constructor(type, tileX, tileY, size = 20) {
        this.type = type;
        this.size = size;
        this.tileX = tileX;
        this.tileY = tileY;
    }

    draw(camera){
        const SQRT3 = 1.732;
        const size = this.size * camera.zoom;
        const x = this.tileX * size * SQRT3 - tileY * size * SQRT3 / 2 - camera.x;
        const y = -this.tileY * size * 3 / 2 - camera.y;

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

    isIncludingPoint(px, py){
        const SQRT3 = 1.732;
        const size = this.size * camera.zoom;
        const centerX = this.tileX * size * SQRT3 - tileY * size * SQRT3 / 2 - camera.x;
        const centerY = -this.tileY * size * 3 / 2 - camera.y;

        centerX - this.size * SQRT3 / 2;
    }
}