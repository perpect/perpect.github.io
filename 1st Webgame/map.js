const Type = {
    PLAIN : 0
};
Object.freeze(Type);

class MapTile{
    constructor(type) {
        this.type = type;
    }

    draw(tileX, tileY, playerX, playerY, size){
        const SQRT3 = 1.732;
        let x = tileX * size * SQRT3 - tileY * size * SQRT3 / 2 - playerX;
        let y = -tileY * size * 3 / 2 - playerY;

        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#a0a0a0";
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