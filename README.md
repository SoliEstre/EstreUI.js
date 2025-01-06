# EstreUI.js
<img src="https://estreui.mpsolutions.kr/images/EstreUI-flatter-144x144.png">

# Estre UI rimwork(like as framework)

This project provided by [MP Solutions inc.](https://mpsolutions.kr) at 2024

***

Estre UI rim-work is like as a front-end framework but so diffrent probably.

This Estre UI rimwork developed by requires rim(runnable frame) for Universal(Mobile & PC) Application on Web based front-end project.

- This rimwork is dependency on jQuery. so it's good for existing jQuery users.
- This rimwork can coexist with other front-end frameworks. (such as Vue.js)
- This rimwork provides a basic UI and lifecycle similar to mobile applications.
- This rimwork can be arranged many things with given web abilities for your project.
- This rimwork provided basic implementation of SPA and PWA for quicker build Web application service.

<br />

# Preview

Application preview page on this repo.

[Example web app 1](https://estreui.mpsolutions.kr/myOwnApplication1.html)


Applications for Estre UI demonstration   
[APT.](https://estreui.mpsolutions.kr/APT)


<br />

# Document index

- [Structure](#Structure)
- [Lifecycle](#Lifecycle)


<br />

# Structure

## Rimwork root elements (childs of document.body)
- **header#fixedTop** - Appbar layer (such as Android's that)
- **main#splashRoot** - Prime layer for splash
- **nav#mainMenu** - Main menu layer
- **div#ptr** - Layer for indicate pull to refresh => *Currently not implemented
- **main#staticDoc** - Main content layer (under fixedTop & fidedBottom and Main menu)
- **footer#fixedBottom** - Bottom fixed menu(like as tabs, and such as taskbar of Windows) layer
- **main#instantDoc** - Overlay contents layer (to be covers whole things except splash when exist page opened)
- **nav#managedOverlay** - Managed overlay layer for essential UIs of application

<br />

## Section bounds (root page holder)
- **headerSections** has component sections of ***header#fixedTop***
- **menuSections** has component sections of ***nav#mainManu***
- **mainSections** has component sections of ***main#staticDoc*** and component has button pairs on ***footer#fixedBottm***
- **blindSections** has component sections of ***main#instantDoc***
- **overlaySections** has component sections of ***nav#managedOverlay***

<br />

## Page
Page is a unit of managed section(such as a component) with lifecycle.   
and has three page handles be sequenced layer as: **Component > Container > Article**   
Pages be managed(bring and close) by pageManager(EstreUiPageManager's obejct).

Pages has to be got unique PID(Page ID) on initialize Estre UI.   
it formatted as: **${statement}&{sectionBound}={component id}#{container id}@{article id}**   
PID needs to calling bring and close pages.
can you see imported pages refers on **pageManager.pages** when after Estre UI initialized.

### Component
Component is root item of Page structure.   
It's query specfied as: **section#{component id}**   
Component can be had many containers.
Initial component's ID is **"home"** or not exist home tab in main sections, all of sections is root tab (exit app on back pressed any tab) except modal tab.

### Container
Conatiner is full screen content holder.   
It's query specfied as: **div.container\[data-container-id\="{container id}"]**   
container pages only shows one in component has **data-on-top="1"** attribute.
and component can be had many articles.
Single or initial container's ID is **"root"**.

### Article
Article is minimum unit of page.   
It's query specfied as: **article\[data-article-id="{article id}"\]**   
article can be shoing on full screes(in safe area) or part of container.
Single or initial article's ID is **"main"**.


<br />

## Page Handle
Page handle is implementation of page works.
it's own element be called **"host"**.
Page handle like as provided Activity/Fragment implementation of Android framework.

### statement
Statement is has two type static or instant.
Static page is never removes from DOM. but when parent pages fully static.
When instant page's child page was static, that be released together when parent page releases.
Instnt pages has to be sampled HTML and remove from DOM when intialize Estre UI(page handle).
and append(be created) to DOM on page has bring.
Pages statement has to be never changed when browser loaded.
It's assigned by attribute  ***data-static="1"*** or not.

### intent
Estre UI can push intent datas on bring(open) page or on show page.
intent can contains your cusom data for pages want bring. and can assign provided specific actions on any lifecycle on times.
currently provided actions is very little bit.
Intent is little like as intent of Android fremework.

<br />

## Page Handler
> extends EstrePageHandler or custom page handler based empty class

Page handler is controller. has be called each lifecycle items by page handle's lifecycle.
that like as custom implementation of Activity/Fragment of Android framework.
handler callback provided page handle object. can you access handle host DOM and intent data from handle object.

Page handler implementation has probably not be changed.


<br />

## Handle
> extends EstreHandle

Handle is operation controller of specfied bound.
Estre UI provided stock handles and can register custom handle before init of Estre UI.
Handles own element be called **"bound"**.
Handle is like as View of Android framework.


<br />

## Handler
> each implementations, class name begins "Estre" and ends "Handler"

Handler is independent attachable functional controller.
Estre UI has to be provided continuously more stock handlers.

<br />

# Lifecycle

### onBring()
Be called on created page host element and page handle.
surely be called once.

this is like as onCreate() in Android fragment lifecycle.

### onOpen()
Be called once on open page when after initialized page handle and handles(in article).

this is like as onViewCreated() in Android fragment lifecycle.

### onShow()
Be called on showing page from initial or hided.

this is like as onStart() in Android fragment lifecycle.

### onFocus()
Be called on focus page and current application(window of DOM. but currently not implemented).

this is like as onResume() in Android fragment lifecycle.

### onReload()*
Be pressed F5 key for refresh by user, refresh current top showing Estre UI page has be reloaded instead reload Estre UI site. (prevented refresh by user press F5 key)   
developer can override action when called onReload event by custom page handler.   
but Ctrl+F5 only allowed for user.

> \* This is diffrent as a lifecycle things. but this rimwork take similar as lifecycle.

### onBack()*
Be called the back(web browser back press or android back button press or iOS swipe to back) requested.
be triggered by popstate event of window

this is like as onBackPressed() in Android fragment lifecycle.

> \* This is diffrent as a lifecycle things. but this rimwork take similar as lifecycle. 
> \* On go to forward request(pushstate) is not implemented currently.

### onBlur()
Be called on blur page and current application(window of DOM. but currently not implemented).

this is like as onPause() in Android fragment lifecycle.

### onHide()
Be called on hiding page by hide or close request.

this is like as onStop() in Android fragment lifecycle.

### onClose()
Be called once on close page when before release(destroy) page handle and handles(in article).

this is like as onDestroyView() in Android fragment lifecycle.

### onRelease()
Be called once on release(destroy) page handle and remove page host element.
but fully static(parent page handles any one has no instant statement) page handle has not be removed element from DOM.

this is like as onDestroy() in Android fragment lifecycle.

<br />

# Essential methods
Recommanded to use 'await' for syncronized sequence codes.  

## Basic dialogs
Basic center popup dialogs
<br />
### alert(args..) / estreAlert({options..})
It's overrided classic alert method. call classicAlert() for basic alert method.

### confirm(args..) / estreConfirm({options..})
It's overrided classic confirm method. call classicConfirm() for basic confirm method.

To be fallbacked to classic method when not assigned second(message) argument.

### prompt(args..) / estrePrompt({options..})
It's overrided classic prompt method. call classicPrompt() for basic prompt method.

To be fallbacked to classic method when not assigned second(message) argument.

<br />

## Toast up slide dialogs
It's like as Bottom Sheet Dialog of Android.
Recommanded to use 'await' for syncronized sequence codes.  

### toastAlert(args..) / estreToastAlert({options..})
Toast up slide version alert dialog.

### toastConfirm(args..) / estreToastConfirm({options..})
Toast up slide version confirm dialog.

### toastPrompt(args..) / estreToastPrompt({options..})
Toast up slide version prompt dialog.

### toastOption(args..) / estreToastOption({options..})
#### optionToast([selections], ..)
Simple selection from option list.
This is like as options menu of Android.

### toastSelection(args..) / estreToastSelection({options..})
#### selectionToast([selections], ..)
Select with checkbox and confirming single to multi selection dialog.
This is a checklist board. and returns checked item list object when confirm by user.

<br />

## Progress indicators

### wait()
Open whole screen cover infinite loading animation page.

### go()
Close whole screen cover infinite loading animation page.

### going()
Open whole screen cover guaged loading animation page.

### arrived()
Close whole screen cover guaged loading animation page.

<br />

## Notification posts

### noti() *is not implemented currently
Post notification card on top of screen.
And to be added Notification slide page.

### note()
Post note card(such as Toast of Android) on bottom of screen.

<br />

<br />

***

** This project is currently just begining.
to be added more documentation and examples soon. **

***
