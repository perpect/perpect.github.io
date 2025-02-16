class Animation {
    constructor(frame, imgSet) {
        this.imgSet = imgSet;
        this.frame = frame;
    }
}

class StandardAnimation {
    constructor(defaultAnimation, attackAnimation, defenseAnimation, standardSkillAnimation){
        this.default = defaultAnimation;
        this.attack = attackAnimation;
        this.defense = defenseAnimation;
        this.standardSkill = standardSkillAnimation;
    }
}

class TestUnitStandardAnimation extends StandardAnimation {
    constructor(){
        let img = new Image();
        img.src = './1st_Webgame/img/minion-0.png';
        super(new Animation(1, img));
    }
}