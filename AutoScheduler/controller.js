class TabButton{
    constructor(btnData, selected, mgr){
        this.id = btnData[0];
        this.name = btnData[1];
        this.iconName = btnData[2];
        this.selected = selected;
        this.mgr = mgr;

        this.button = document.createElement("div");
        this.button.classList.add("tabBox");
        if (this.selected)
            this.button.classList.add("active");

        this.icon = new Image(20, 20);
        this.icon.src = "./icons/" + this.iconName + ".png";
        this.button.appendChild(this.icon);
        
        this.nameBox = document.createElement("div");
        this.nameBox.insertAdjacentHTML("afterbegin", this.name);
        this.nameBox.classList.add("center");
        this.nameBox.classList.add("full-width");
        this.button.appendChild(this.nameBox);
        this.button.addEventListener("click", (e)=>{
            this.click();
        });
    }

    click(){
        if (this.selected)
            return;
        this.button.classList.add("active");
        this.mgr.selectBtn(this.id);
    }

    off(){
        this.button.classList.remove("active");
        this.selected = false;
    }
}

class TabButtonController{
    constructor(initialSelect, btnData) {
        this.btnData = btnData;
        this.tabButtons = {};
        this.nowTabId = initialSelect;
        btnData.forEach(data => {
            this.tabButtons[data[0]] = new TabButton(data, initialSelect == data[0], this);
        });
        this.selectedBtn = this.tabButtons[initialSelect];
    }

    selectBtn(id){
        if (this.nowTabId == id)
            return;
        this.selectedBtn.off();
        this.selectedBtn = this.tabButtons[id];
        document.getElementById("tab-"+this.nowTabId).style.display = 'none';
        this.nowTabId = id;
        document.getElementById("tab-"+this.nowTabId).style.display = 'block';
    }

    get keys(){
        return Object.keys(this.tabButtons);
    }

    insertTo(parent){
        Object.keys(this.tabButtons).forEach(id => {
            parent.appendChild(this.tabButtons[id].button);
        });
    }
}