class Unit{
    constructor(type, tileX, tileY){
        this.type = type;
        this.tileX = tileX;
        this.tileY = tileY;
    }

    getCenter(camera){
        const size = this.size * camera.zoom;
        const x = this.tileX * size * SQRT3 - this.tileY * size * SQRT3 / 2 - camera.x;
        const y = this.tileY * size * 3 / 2 - camera.y;
        return { x : x, y : y, size : size };
    }

    draw(camera){
        const SQRT3 = 1.732;
        const center = this.getCenter(camera);
        const size = center.size;
        const x = center.x;
        const y = center.y;
        
        new Image();
        ctx.drawImage();
    }
}