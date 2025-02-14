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
    constructor(){
        this.map = [];
        newLine(5);
        newLine(5);
        newLine(5);
    }

    newLine(n){
        for (let x = 0; x < n; x++) {
            this.map.push(new MapTile(TileType.PLAIN, x, this.map.length));
        }
    }

    draw(camera){
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                tile.draw(x, y, camera);
            }
        }
    }

    isIncludingPoint(px, py, camera){
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                if (tile.isIncludingPoint(px, py, camera)){
                    console.log("(" + x + ", " + y + ")");
                }
            }
        }
    }
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

    isIncludingPoint(px, py, camera){
        const SQRT3 = 1.732;
        const size = this.size * camera.zoom;
        const centerX = this.tileX * size * SQRT3 - tileY * size * SQRT3 / 2 - camera.x;
        const centerY = -this.tileY * size * 3 / 2 - camera.y;

        const left = centerX - size * SQRT3 / 2;
        const right = centerX + size * SQRT3 / 2;
        const topCenter = centerY + size / 2;
        const bottomCenter = centerY - size / 2;
        if (left <= px <= centerX){
            if (topCenter <= py <= topCenter + (px - left) / SQRT3){
                return true;
            }
            if (bottomCenter <= py <= topCenter){
                return true;
            }
            if (bottomCenter - (px - left) / SQRT3 <= py <= bottomCenter){
                return true;
            }
        }
        if (centerX <= px <= right){
            if (topCenter <= py <= topCenter + (right - px) / SQRT3){
                return true;
            }
            if (bottomCenter <= py <= topCenter){
                return true;
            }
            if (bottomCenter - (right - px) / SQRT3 <= py <= bottomCenter){
                return true;
            }
        }
        return false;
    }
}