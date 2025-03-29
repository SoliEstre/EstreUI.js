// custom handles

// Custom handle implamentation

// Register my own handle




// Customize lifecycle actions for handles(component/container/article) on own pages
class AppPagesProvider {

    // Register my own external PID (page alias)
    static get pages() { return {
        //if writed html in sections in mains(#staticDoc and #instantDoc), can you show PIDs by command "pageManager.pages" on JS console

        //"own shorter id": "PID",

        "home": "&m=home",

    }; }


    // properties
    #pageManager = null;
    get pageManager() { return this.#pageManager; }


    constructor(pageManager) {
        this.#pageManager = pageManager;
    }

    
    //declare handler of pages

    //"own shorter id" = page handler implementation class from extends EstrePageHandler or empty class(function type constructor)
    "home" = class extends EstrePageHandler {};

}


// Implement example of my own custom page handler
class AppPageManager extends EstreUiCustomPageManager {

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


// setup instances
const appPageManager = new AppPageManager();


// custom handle callbacks


// Own application and EstreUI initializing
$(document).ready((e) => {

    //<= to do implement my own initializing



    //something do while intializes on splash page
    appPageManager.init(AppPagesProvider.pages, new AppPagesProvider(appPageManager));
    //initialize scheduleDateSet with own data handler
    // scheduleDataSet.init(appDataHandler);
    //initialize Estre UI after checked user session
    estreUi.init(false);

    appPageManager.bringPage("home");

    setTimeout(() => estreUi.checkOnReady(), 0);

})
