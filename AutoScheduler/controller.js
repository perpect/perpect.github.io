class TabButton{
    constructor(btnData, selected, mgr, type, iconSize = 20){
        this.id = btnData[0];
        this.name = btnData[1];
        this.iconName = btnData[2];
        this.mgr = mgr;

        this.radioElem = document.createElement("input");
        this.radioElem.type = "radio";
        this.radioElem.name = type;
        this.radioElem.value = this.id;
        this.radioElem.id = type + "Radio-" + this.id;
        this.radioElem.checked = selected;
        this.radioElem.addEventListener("change", (e) => {
			this.mgr.select(this.id);
        });
        
        this.labelElem = document.createElement("label");
        this.icon = new Image(iconSize, iconSize);
        this.icon.src = "./icons/" + this.iconName + ".png";
        this.labelElem.appendChild(this.icon);
        this.labelElem.htmlFor = type + "Radio-" + this.id;
        
        this.nameBox = document.createElement("div");
        this.nameBox.insertAdjacentHTML("afterbegin", this.name);
        this.nameBox.classList.add("center");
        this.nameBox.classList.add("full-width");
        this.labelElem.appendChild(this.nameBox);
    }
}

class TabButtonController{
    constructor(initialSelect, btnData, type, iconSize = 20) {
        this.btnData = btnData;
        this.tabButtons = {};
        this.prevId = initialSelect;
        this.type = type;
        btnData.forEach(data => {
            this.tabButtons[data[0]] = new TabButton(data, initialSelect == data[0], this, type, iconSize);        
            document.getElementById(type + "-" + data[0]).style.display = 'none';
        });
        document.getElementById(type + "-" + initialSelect).style.display = 'block';
    }

    select(id){
        document.getElementById(this.type + "-" + this.prevId).style.display = 'none';
        this.prevId = id;
        document.getElementById(this.type + "-" + id).style.display = 'block';
    }

    get keys(){
        return Object.keys(this.tabButtons);
    }

    insertTo(parent){
        Object.keys(this.tabButtons).forEach(id => {
            parent.appendChild(this.tabButtons[id].radioElem);
            parent.appendChild(this.tabButtons[id].labelElem);
        });
    }
}