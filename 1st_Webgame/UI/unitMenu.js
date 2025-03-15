class UnitMenu {
    draw(){
        ctx.strokeStyle = "#008C7E";
        ctx.fillStyle = "#9A5ABF";
        ctx.beginPath();
        ctx.rect(560, 520, 400, 200);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = "#FFFFFF";
        Utility.drawText(570, 560, 30, selectedUnit.unitType.name);

        
    }
}