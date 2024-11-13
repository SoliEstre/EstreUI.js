// custom handles



// Register my own external PID (page alias)
const apartPages = {
    //if writed html in sections in mains(#staticDoc and #instantDoc), can you show PIDs by command "pageManager.pages" on JS console

    //"own shorter id": "PID",

    "home": "$s&m=home",

    "apart": "$s&m=apart",

    "lyrics": "$s&m=lyrics",

    "": "",
}


// Customize lifecycle actions for handles(component/container/article) on own pages
const apartPageHandlers = {
    //"same name in extPidMap": "function type object constructer",

    "wait": class extends EstrePageHandler {},

    "home": class extends EstrePageHandler {},

    "tab1": class extends EstrePageHandler {},

    "tab2": class extends EstrePageHandler {},

}


// Implement example of my own custom page handler
class ApartPageManager extends EstreUiCustomPageManager {

    // class property


    // static methods


    // constants
    

    // instnace property


    constructor() {
        super();
    }


    /**
     * * must be initialized estreUi before call 
     */
    init(extPidMap, pageHandlers) {

        return super.init(extPidMap, pageHandlers);
    }

}

const apartPageManager = new ApartPageManager().init(apartPages, apartPageHandlers);



// Implement example of my own action handler
class ApartActionHandler {

    hostId = "apartActionManager";

    somethingDoWhileAnything() {
        //show blinded loading indicator
        const waiter = wait();
        //register to async manager for monitor async work for prevent leak
        let currentWid = EstreAsyncManager.beginWork("[" + "work title" + "]" + "detail", this.hostId);

        //<= before process

        setTimeout(() => {// <= somthing did wile async action

            //<= after process

            //unregister from async manager
            EstreAsyncManager.endOfWork(currentWid);
            //hide blinded loading indicator
            go(waiter);
        }, 3000);
        //<= You must catch error case for do unregister from async manager and close loading indicator
    }
}

const apartActionHandler = new ApartActionHandler();


let floor = 1;
let topFloor = 7 + parseInt(Math.random() * 10);


// Own application and EstreUI initializing
$(document).ready((e) => {

    //<= to do implement my own initializing


    //initialize Estre UI after checked user session
    estreUi.init(false);
    //something do while intializes on splash page
    apartPageManager.init();
    apartPageManager.bringPage("home");
    
    setTimeout(() => estreUi.checkOnReady(), 0);


})
