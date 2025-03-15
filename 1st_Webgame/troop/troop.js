class Troop {
    constructor(tileX, tileY, size, isControllable, isWaterProof) {
        this.isControllable = isControllable;
        this.tileX = tileX;
        this.tileY = tileY;
        this.size = size;
        this.isWaterProof = isWaterProof;
    }

    getCenter(camera, tileSize = 100){
        let center = Utility.getCenter(this.tileX, this.tileY, tileSize, camera);
        const troopSize = this.size * camera.zoom;
        return { x : center.x - troopSize / 2, y : center.y - troopSize / 2, size : troopSize };
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