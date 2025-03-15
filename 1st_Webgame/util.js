class Utility{
    static getCenter(tileX, tileY, size, camera) {
        size = size * camera.zoom;
        const x = tileX * size * SQRT3 - tileY * size * SQRT3 / 2 - camera.x;
        const y = tileY * size * 3 / 2 - camera.y;
        return { x : x, y : y, size : size };
    }

    static drawText(x, y, size, content){
        ctx.font = size + "px serif";
        ctx.fillText(content, x, y);      
    }
}