// custom handles



// Customize lifecycle actions for handles(component/container/article) on own pages
class ApartPagesProvider {
    // Register my own external PID (page alias)
    static get pages() { return {
        //if writed html in sections in mains(#staticDoc and #instantDoc), can you show PIDs by command "pageManager.pages" on JS console

        //"own shorter id": "PID",

        "home": "$s&m=home",

        "apart": "$s&m=apart",

        "lyrics": "$s&m=lyrics",

        "": "",
    }; }


    // properties
    #pageManager = null;
    get pageManager() { return this.#pageManager; }
    #actionHandler = null;
    get actionHandler() { return this.#actionHandler; }


    constructor(pageManager, actionHandler) {
        this.#pageManager = pageManager;
        this.#actionHandler = actionHandler;
    }


    //declare handler of pages

    //"own shorter id" = page handler implementation class from extends EstrePageHandler or empty class(function type constructor)
    "wait" = class extends EstrePageHandler {};

    "home" = class extends EstrePageHandler {};

    "tab1" = class extends EstrePageHandler {};

    "tab2" = class extends EstrePageHandler {};

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



// Implement example of my own action handler
class ApartActionHandler {

    hostId = "ApartActionManager";

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


// Global implementation
let floor = 1;
let topFloor = 7 + parseInt(Math.random() * 10);


// Setup instances
const apartActionHandler = new ApartActionHandler();

const apartPageManager = new ApartPageManager();


// Own application and EstreUI initializing
$(document).ready((e) => {

    //<= to do implement my own initializing


    //initialize Estre UI after checked user session
    estreUi.init(false);
    //something do while intializes on splash page
    apartPageManager.init(ApartPagesProvider.pages, new ApartPagesProvider(apartPageManager, apartActionHandler));
    //show home page
    apartPageManager.bringPage("home");
    
    //notification finished loading my own app to Estre UI
    setTimeout(() => estreUi.checkOnReady(), 0);


})
