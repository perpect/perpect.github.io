const SQRT3 = 1.732;

class Camera{
    constructor(x, y, zoom = 1) {
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }
}

class WorldMap{
    constructor(){
        this.map = [];
        this.newLine(3);
        this.newLine(4);
        this.newLine(5);
        this.newLine(6);
        this.newLine(7);
        this.map[2][2].type = new WaterTile();
        this.map[3][0].type = new NoneTile();
        this.map[4][0].type = new NoneTile();
        this.map[4][1].type = new NoneTile();
        this.map[3][5].type = new NoneTile();
        this.map[4][6].type = new NoneTile();
        this.map[4][5].type = new NoneTile();
        this.map[1][2].troop = new TestUnit();
    }

    newLine(n){
        this.map.push([]);
        for (let x = 0; x < n; x++) {
            this.map[this.map.length - 1].push(new MapTile(new PlainTile(), x, this.map.length));
        }
    }

    draw(camera){
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                let tile = this.map[y][x];
                tile.draw(camera);
            }
        }
    }

    isIncludingPoint(px, py, camera){
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                let tile = this.map[y][x];
                if (tile.isIncludingPoint(px, py, camera)){
                    console.log("(" + x + ", " + y + ")");
                }
            }
        }
    }
}

class MapTile{
    constructor(type, tileX, tileY, size = 100) {
        this.type = type;
        this.size = size;
        this.tileX = tileX;
        this.tileY = tileY;
        this.troop = null;
    }

    getCenter(camera){
        const size = this.size * camera.zoom;
        const x = this.tileX * size * SQRT3 - this.tileY * size * SQRT3 / 2 - camera.x;
        const y = this.tileY * size * 3 / 2 - camera.y;
        return { x : x, y : y, size : size };
    }

    draw(camera){
        if (this.type.isEmpty){
            return ;
        }
        const SQRT3 = 1.732;
        const center = this.getCenter(camera);
        const size = center.size;
        const x = center.x;
        const y = center.y;
        if (this.tileX + this.tileY == 0){
            //console.log(x, y);
        }

        //console.log(TileColor[this.type]);
        ctx.strokeStyle = this.type.strokeColor;
        ctx.fillStyle = this.type.fillColor;
        ctx.lineWidth = size / 20;
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
        ctx.stroke();
    }

    isIncludingPoint(px, py, camera){
        const center = this.getCenter(camera);
        const size = center.size;

        const left = center.x - size * SQRT3 / 2;
        const right = center.x + size * SQRT3 / 2;
        const topCenter = center.y + size / 2;
        const bottomCenter = center.y - size / 2;
        if (left <= px && px <= center.x){
            if (topCenter <= py && py <= topCenter + (px - left) / SQRT3){
                return true;
            }
            if (bottomCenter <= py && py <= topCenter){
                return true;
            }
            if (bottomCenter - (px - left) / SQRT3 <= py && py <= bottomCenter){
                return true;
            }
        }
        if (center.x <= px && px <= right){
            if (topCenter <= py && py <= topCenter + (right - px) / SQRT3){
                return true;
            }
            if (bottomCenter <= py && py <= topCenter){
                return true;
            }
            if (bottomCenter - (right - px) / SQRT3 <= py && py <= bottomCenter){
                return true;
            }
        }
        return false;
    }
}