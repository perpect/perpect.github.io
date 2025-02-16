class Troop {
    constructor(tileX, tileY, isControllable) {
        this.isControllable = isControllable;
        this.tileX = tileX;
        this.tileY = tileY;
    }
}

class TroopType {
    constructor(name, baseAnimations, hp, atk, mp, skills) {
        this.name = name;
        this.baseAnimations = baseAnimations;
        this.hp = hp;
        this.atk = atk;
        this.mp = mp;
        this.skills = skills;
    }
}