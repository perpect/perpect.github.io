class Troop {
    constructor(tileX, tileY, size, isControllable, isWaterProof) {
        this.isControllable = isControllable;
        this.tileX = tileX;
        this.tileY = tileY;
        this.size = size;
        this.isWaterProof = isWaterProof;
    }

    getCenter(camera, tileSize = 100){
        tileSize = tileSize * camera.zoom;
        const x = this.tileX * tileSize * SQRT3 - (this.tileY + 0) * tileSize * SQRT3 / 2 - camera.x;
        const y = (this.tileY + 0) * tileSize * 3 / 2 - camera.y;
        const troopSize = this.size * camera.zoom;
        return { x : x - troopSize / 2, y : y - troopSize / 2, size : troopSize };
    }
}

class TroopType {
    constructor(name, standardAnimation, size, hp, atk, mp, skills) {
        this.name = name;
        this.standardAnimation = standardAnimation;
        this.size = size;
        this.hp = hp;
        this.atk = atk;
        this.mp = mp;
        this.skills = skills;
    }
}