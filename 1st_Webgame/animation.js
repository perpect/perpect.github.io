class GameAnimation {
    constructor(frame, imgSet, loop = false) {
        this.imgSet = imgSet;
        this.frame = frame;
        this.maxFrame = imgSet.length;
        this.speed = 1;
        this.loop = loop;
        this.nowFrame = 0;
    }

    draw(center){
        const x = center.x;
        const y = center.y;
        const size = center.size;
        /*ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x, y, size / 5, 0, 2 * Math.PI);
        ctx.stroke();*/
        ctx.drawImage(this.imgSet[this.nowFrame], x, y, size, size);
        this.nowFrame += this.speed;
        if (this.loop && this.maxFrame == this.nowFrame){
            this.nowFrame = 0;
        }
        if (!this.loop && this.maxFrame == this.nowFrame){
            this.speed = 0;
            this.nowFrame -= 1;
        }
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
    constructor() {
        super(null, null, null, null);  // 기본값으로 null 설정

        this.loadImage('./img/minion-0.png').then((img) => {
            const ani = new GameAnimation(1, [img], false);
            this.default = ani;
            this.attack = ani;
            this.defense = ani;
            this.standardSkill = ani;
        });
    }

    // 이미지 로드 후 Promise를 반환하는 메소드
    loadImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = src;
            img.onload = () => resolve(img);  // 이미지 로드 완료 시 resolve
            img.onerror = (error) => reject(error);  // 에러 발생 시 reject
        });
    }
}