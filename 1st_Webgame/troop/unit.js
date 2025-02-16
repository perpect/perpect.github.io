class Unit extends Troop {
    constructor(tileX, tileY, unitType, reinforcement = null) {
        this.unitType = unitType;
        super(tileX, tileY, false);
        this.hp = unitType.hp;
        this.atk = unitType.atk;
        this.mp = unitType.mp;
        if (reinforcement != null){
            this.reinforceUnit(reinforcement);
        }
    }

    reinforceUnit(reinforcement){

    }
}

class UnitType extends TroopType {
    constructor(name, standardAnimations, hp, atk, mp, skills) {
        super(name, standardAnimations, hp, atk, mp, skills);
    }
}

class TestUnit extends Unit {
    constructor(tileX, tileY, reinforcement = null) {
        super(tileX, tileY, new TestUnitType(), reinforcement);
    }
}

class TestUnitType extends TestUnitType {
    constructor() {
        super("테스트");
    }
}