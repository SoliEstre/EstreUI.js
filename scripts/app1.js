// custom handles

// Custom handle implamentation
class MyOwnUserHandle extends EstreHandle {

    // constants


    // statics


    // open property

    
    // enclosed property


    // getter and setter



    constructor(element, host) {
        super(element, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.releaseInfo();

        this.setEvent();
    }

    setEvent() {
        let inst = this;

        this.$bound.find(cls + "sign_out").click(function(e) {
            e.preventDefault();

            exampleSessionManager.signOut();

            return false;
        });
    }

    releaseInfo() {
        this.$bound.find(cls + "user_name").text(exampleSessionManager.userName);
    }
}

// Register my own handle
EstreHandle.registerCustomHandle("myOwnUserHandle", ".my_own_user_handle", MyOwnUserHandle);



// Register my own external PID (page alias)
const myOwnPages = {
    //if writed html in sections in mains(#staticDoc and #instantDoc), can you show PIDs by command "pageManager.pages" on JS console

    //"own shorter id": "PID",

    "wait": "$i&b=wait",

    "home": "$s&m=home",

    "tab1": "$s&m=tab1",
    "tab1Next": "$i&m=tab1#root@tab1_next",

    "tab2": "$s&m=tab2",
    "tab2Next": "$i&m=paybill#root@tab2_next",
    
    "activity1": "$s&m=activity1",

    "activity2": "$i&m=activity2",

    "": "",
}


// Customize lifecycle actions for handles(component/container/article) on own pages
const myOwnPageHandlers = {
    //"same name in extPidMap": "function type object constructer",

    "wait": function () {},

    "home": function () {},

    "tab1": function () {},
    "tab1Next": function () {},

    "attend_success": function () {},
    
    "tab2": function () {},
    "tab2Next": function () {
        this.onOpen = function (handle) {
        };
        
        this.onBack = function (handle) {
            return handle.close();
        }
    },

    "activity1": function () {
        this.onOpen = function (handle) {
            myOwnActionHandler.somethingDoWhileAnything();
        }
        
        this.onBack = function (handle) {
            return handle.close();
        }
    },

    "activity2": function () {
        this.onOpen = function (handle) {
            this.myOwnFunction();
        }
        
        this.onBack = function (handle) {
            return handle.close();
        }

        this.myOwnFunction = function () {
            //do anything
        }
    },

}


// Implement example of my own custom page handler
class EstreUiExapmlePageManager extends EstreUiCustomPageManager {

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


    bringPage(id, intent) {
        pageManager.bringPage("*" + id, intent);
    }

    showPage(id, intent) {
        pageManager.showPage("*" + id, intent);
    }

    hidePage(id) {
        pageManager.hidePage("*" + id);
    }

    closePage(id) {
        pageManager.closePage("*" + id);
    }

}

const myOwnPageHandler = new EstreUiExapmlePageManager().init(myOwnPages, myOwnPageHandlers);



// Implement example of my own action handler
class MyOwnActionHandler {

    hostId = "myOwnActionManager";

    somethingDoWhileAnything() {
        //show blinded loading indicator
        myOwnPageHandler.bringPage("wait");
        //register to async manager for monitor async work for prevent leak
        let currentWid = EstreAsyncManager.beginWork("[" + "work title" + "]" + "detail", this.hostId);

        //<= before process

        setTimeout(() => {// <= somthing did wile async action

            //<= after process

            //unregister from async manager
            EstreAsyncManager.endOfWork(currentWid);
            //hide blinded loading indicator
            myOwnPageHandler.closePage("wait");
        }, 3000);
        //<= You must catch error case for do unregister from async manager and close loading indicator
    }
}

const myOwnActionHandler = new MyOwnActionHandler();




// Local Storage key constants
const LS_ESTRE_UI_EXAMPLE_SESSION_BLOCK = "ESTRE_UI_EXAMPLE_SESSION_BLOCK";


// Authed API communication manager example
const MY_OWN_API_SERVER = "https://my.own.api.server/api";

const PATH_LOGIN = "/login";

const PATH_SEND_NOTHING = "/takeNothing";


class MyOwnApiUrl {
    static get login() { return MY_OWN_API_SERVER + PATH_LOGIN; }
    static get sendNothing() { return MY_OWN_API_SERVER + PATH_SEND_NOTHING; }
}


class EstreUiExampleSessionManager {

    // class property


    // static methods


    // constants
    hostId = "myOwnSessionManager";

    get #emptyUser() {
        return {};
    }
    get #emptySession() {
        return {};
    }
    

    // instnace property
    #onPrepare = null;
    #onCheckedAuth = null;
    #onReady = null;

    #user = this.#emptyUser;

    #session = this.#emptySession;


    // geter setter
    get #authToken() {
        return this.#session.loginToken;
    }


    #setUser(infoSet) {
        this.#user = infoSet;

        EstreHandle.activeHandle[uis.myOwnUserHandle]?.forEach(handle => {
            handle.releaseInfo();
        });
    }

    get userName() { return this.#user.name; }


    constructor() {}

    
    init(onPrepare, onCheckedAuth, onReady) {
        if (this != exampleSessionManager) return new Error("Can not duplicate session manager");

        this.#onPrepare = onPrepare;
        this.#onCheckedAuth = onCheckedAuth;
        this.#onReady = onReady;

        this.#checkUpSession();
    }

    async #checkUpSession() {
        let block = ELS.getString(LS_ESTRE_UI_EXAMPLE_SESSION_BLOCK);

        if (block != null && block != "") {
            this.#extractBlock(block);

            let token = this.#authToken;
            //console.log(token);

            this.#bringOnPrepare(true);

            if (token != null && token.length > 0) {
                this.#bringOnCheckedAuth(true);
                this.#bringOnReady(true);
            } else {
                this.#bringOnCheckedAuth(false);
                this.#bringOnReady(true);
            };
            
        } else {
            
            this.#bringOnPrepare(false);

            this.#onCheckedAuth = null;

            this.#bringOnReady(true);
        }

    }

    #bringOnPrepare(isTokenExist) {
        this.#onPrepare(isTokenExist);
        this.#onPrepare = null;
    }

    #bringOnCheckedAuth(isOnAuth) {
        this.#onCheckedAuth(isOnAuth);
        this.#onCheckedAuth = null;
    }

    #bringOnReady(isStraight) {
        this.#onReady(isStraight);
        this.#onReady = null;
    }

    #clearSession() {
        this.#user = this.#emptyUser;
        this.#session = this.#emptySession;
        ELS.setString(LS_ESTRE_UI_EXAMPLE_SESSION_BLOCK);
    }

    #extractBlock(block) {
        let set = Jcodd.parse(atob(block));
        this.#session = set.session;
        this.#user = set.user;
    }

    #solidBlock() {
        return btoa(Jcodd.coddify({ session: this.#session, user: this.#user }));
    }

    #fetchApiPost(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, fetchKind = "communication") {
        return this.#fetchApiWithBody(url, data, callbackSuccess, callbackFailure, "POST", fetchKind);
    }

    #fetchApiPatch(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, fetchKind = "communication") {
        return this.#fetchApiWithBody(url, data, callbackSuccess, callbackFailure, "PATCH", fetchKind);
    }

    #fetchApiPut(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, fetchKind = "communication") {
        return this.#fetchApiWithBody(url, data, callbackSuccess, callbackFailure, "PUT", fetchKind);
    }

    #fetchApiWithBody(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, request = "POST", fetchKind = "communication") {

        let headers = new Headers();
        headers.append("Content-Type", "application/json");
        if (location.href.indexOf("http://") > -1) {
            headers.append("Access-Control-Request-Private-Network", "true");
        }
        
        let content = data;
        let body = JSON.stringify(content);
        console.log("request: [" + request + "] " + url + "\n" + body);

        let fetchWid = EstreAsyncManager.beginWork("[" + request + "]" + url, this.hostId);
        fetch (url, {
            method: request,
            headers: headers,
            body: body
        }).then((response) => {
            if (response.ok) {
                try {
                    return response.json();
                } catch (ex) {
                    console.log(ex.name + "\n" + ex.message);
                    console.log(response);
                    EstreAsyncManager.endOfWork(fetchWid);
                    //retry
                    console.log(fetchKind + " Failure : Server issue");
                    callbackFailure({ error: "JSON parse failure", response: response });
                    return response;
                }
            } else {
                console.log(response);
                EstreAsyncManager.endOfWork(fetchWid);
                //retry
                console.log(fetchKind + " Failure : Server error");
                callbackFailure({ error: "Response is not Ok", response: response });
                return response;
            }
        }).then((resp) => {
            if (resp != null) {
                if (resp instanceof Response) return;
                console.log(resp);
                
                if (resp?.resultOk != null) {

                    if (resp.resultOk) {
                        callbackSuccess(resp);
                    } else {
                        switch (resp.resultCode) {
                            case 1:
                                //process each resultCode cases
                                break;
                        }
                        console.log(fetchKind + " Failure : (" + resp.resultCode + ")\n" + resp.resultMessage);
                        callbackFailure(resp);
                    }
                } else {
                    console.log(fetchKind + " Failure : Null resultOk");
                    callbackFailure({ error: "no result", response: response });
                }
            } else {
                console.log(fetchKind + " Failure : Null response");
                callbackFailure({ error: "How null is response object", response: response });
            }
            EstreAsyncManager.endOfWork(fetchWid);
        }).catch (error => {
            console.log(error);
            //console.log(ex.name + "\n" + ex.message);

            // to do implement retry
            callbackFailure({ error: "Error on fetch [" + request + "] " + url + "\n" + error, errorOrigin: error });
            EstreAsyncManager.endOfWork(fetchWid);
        });
    }

    #fetchApiAuthedPost(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, fetchKind = "communication") {
        this.#fetchApiAuthedWithBody(url, data, callbackSuccess, callbackFailure, "POST", fetchKind);
    }

    #fetchApiAuthedPatch(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, fetchKind = "communication") {
        this.#fetchApiAuthedWithBody(url, data, callbackSuccess, callbackFailure, "PATCH", fetchKind);
    }

    #fetchApiAuthedPut(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, fetchKind = "communication") {
        this.#fetchApiAuthedWithBody(url, data, callbackSuccess, callbackFailure, "PUT", fetchKind);
    }

    #fetchApiAuthedWithBody(url, data, callbackSuccess = (data) => {}, callbackFailure = (data) => {}, request = "POST", fetchKind = "communication") {
        if (this.#session.loginToken != null && this.#session.loginToken != "") {
            if (data == null) data = {};
            data.loginToken = this.#session.loginToken;
            this.#fetchApiWithBody(url, data, callbackSuccess, callbackFailure, request, fetchKind);
        } else callbackFailure({ error: "Login token not exist" });
    }


    signIn(id, pw, callbackSuccess = (data) => {}, callbackFailure = (data) => {}) {
        let data = { LoginID: id, LoginPW: pw };

        this.#fetchApiPost(MyOwnApiUrl.login, data, (data) => {
            
            if (data.resultOk) {
                this.#session.loginToken = data.loginToken;

                this.#setUser({ name: data.userName });

                let block = this.#solidBlock();
                //console.log("session block: " + block);

                ELS.setString(LS_ESTRE_UI_EXAMPLE_SESSION_BLOCK, block);
                
                callbackSuccess(data);
            } else {
                console.log("Sign in Failure : (" + head.resultCode + ")\n" + head.ResultMessage);
                callbackFailure(data);
            }
        }, (data) => {
            alert("Sign in Failure : " + (data.error != null ? data.error : "(" + data.resultOk + ")\n" + data.ResultMessage));
            callbackFailure(data);
        }, "Sign in");
    }

    signOut() {
        this.#clearSession();
        location.reload(); 
    }

    sendNothing(nothing, callbackSuccess = (data) => {}, callbackFailure = (data) => {}) {
        this.#fetchApiAuthedPost(MyOwnApiUrl.sendNothing, { nothing }, callbackSuccess, callbackFailure);
    }
}

const exampleSessionManager = new EstreUiExampleSessionManager();




// Own application and EstreUI initializing
$(document).ready((e) => {

    //<= to do implement my own initializing


    //Initialize my own API session manager related initialize EstreUI
    exampleSessionManager.init((isTokenExist) => {
        //initialize Estre UI after checked user session
        estreUi.init(false);
        //something do while intializes on splash page
        myOwnPageHandler.init();
    
        //ready to begin page if han not login token
        if (!isTokenExist) myOwnPageHandler.bringPage("login");
    }, (isOnAuth) => {
        //bitfurcation user auth when checked only has login token
        if (!isOnAuth) myOwnPageHandler.bringPage("login");
        else myOwnPageHandler.bringPage("home");
    }, (isStraight) => {
        //notification finished loading my own app to Estre UI
        if (isStraight) setTimeout(() => estreUi.checkOnReady(), 0);
        else estreUi.checkOnReady();
    });


})
