class TileType{
    constructor(name, strokeColor, fillColor, isEmpty){
        this.name = name;
        this.strokeColor = strokeColor;
        this.fillColor = fillColor; 
        this.isEmpty = isEmpty;
    }
}

class NoneTile extends TileType{
    constructor(){
        super("None", "#ffffff", "#ffffff", true);
    }
}

class PlainTile extends TileType{
    constructor(){
        super("Plain", "#757003", "#6a8518", false);
    }
}

class WaterTile extends TileType{
    constructor(){
        super("Water", "#006bea", "#0080ff", false);
    }
}