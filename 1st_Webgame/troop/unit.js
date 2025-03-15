class Unit extends Troop {
    constructor(tileX, tileY, id, name, standardImg, size, hp, atk, mp, skills, reinforcement = null) {
        super(tileX, tileY, unitType.size, false);
        this.unitType = unitType;
        this.hp = unitType.hp;
        this.atk = unitType.atk;
        this.mp = unitType.mp;
        if (reinforcement != null){
            this.reinforceUnit(reinforcement);
        }
        console.log(this.tileX, this.tileY);
    }

    reinforceUnit(reinforcement){

    }

    draw(camera){
        //console.log(this.getCenter(camera));
        this.unitType.standardAnimation.default.draw(this.getCenter(camera));
    }

    get imageLoadRequest() {
        return this.unitType.imageLoadRequest;
    }
}

class UndeadTrainee extends Unit {
    constructor(tileX, tileY, reinforcement) {
        super(tileX, tileY, "UndeadTrainee", "언데드 훈련병", 50, , atk, mp, skills, reinforcement);
    }
}