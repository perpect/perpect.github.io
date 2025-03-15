class Button {
    constructor(x, y, size, onclick, strokeColor, fillColor, strokeWidth, isAffectedByCamera){
        this.oriX = x;
        this.oriY = y;
        this.oriSize = size;
        this.onclick = onclick;
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.strokeWidth = strokeWidth;
        this.isAffectedByCamera = isAffectedByCamera;
    }
    draw(camera){}
    isIncludingPoint(px, py, camera){}
    activate(px, py, camera){
        if (this.isIncludingPoint(px, py, camera)){
            this.onclick();
        }
    }
}

class HexagonButton extends Button {
    constructor(x, y, size, onclick, strokeColor = "#000000", fillColor = "#000000", strokeWidth = 5, isAffectedByCamera = { x: false, y : false, zoom : false}){
        super(x, y, size, onclick, strokeColor, fillColor, strokeWidth, isAffectedByCamera);
    }

    draw(camera){
        const x = this.oriX - camera.x * this.isAffectedByCamera.x;
        const y = this.oriY - camera.y * this.isAffectedByCamera.y;
        const size = this.oriSize * (camera.zoom + (1 - camera.zoom) * this.isAffectedByCamera.zoom);
        ctx.strokeStyle = this.strokeColor;
        ctx.fillStyle = this.fillColor;
        ctx.lineWidth = this.strokeWidth;
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