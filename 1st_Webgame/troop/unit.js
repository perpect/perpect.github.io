class Unit extends Troop {
    constructor(tileX, tileY, unitType, reinforcement = null) {
        console.log(unitType.size);
        super(tileX, tileY, unitType.size, false);
        this.unitType = unitType;
        this.hp = unitType.hp;
        this.atk = unitType.atk;
        this.mp = unitType.mp;
        if (reinforcement != null){
            this.reinforceUnit(reinforcement);
        }
    }

    reinforceUnit(reinforcement){

    }

    draw(camera){
        //console.log(this.getCenter(camera));
        this.unitType.standardAnimation.default.draw(this.getCenter(camera));
    }
}

class UnitType extends TroopType {
    constructor(name, standardAnimation, size, hp, atk, mp, skills) {
        super(name, standardAnimation, size, hp, atk, mp, skills);
    }
}

class TestUnit extends Unit {
    constructor(tileX, tileY, reinforcement = null) {
        super(tileX, tileY, new TestUnitType(), reinforcement);
    }
}

class TestUnitType extends UnitType {
    constructor() {
        super("테스트", new TestUnitStandardAnimation(), 100, 10, 2, 0, []);
    }
}