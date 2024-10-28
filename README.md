# EstreUI.js
<img src="https://estreui.mpsolutions.kr/images/EstreUI-flatter-144x144.png">

## Estre UI rimwork(like as framework)

This project provided by [MP Solutions inc.](https://mpsolutions.kr) at 2024

***

Estre UI rim-work is like as a front-end framework but so diffrent probably.

This Estre UI rimwork developed by requires rim(runnable frame) for Universal(Mobile & PC) Application on Web based front-end project.

- This rimwork is dependency on jQuery. so it's good for existing jQuery users.
- This rimwork can coexist with other front-end frameworks. (such as Vue.js)
- This rimwork provides a basic UI and lifecycle similar to mobile applications.
- This rimwork can be arranged many things with given web abilities for your project.
- This rimwork provided basic implementation of SPA and PWA for quicker build Web application service.

Preview
--
Application preview page on this repo.

[Example web app 1](https://estreui.mpsolutions.kr/myOwnApplication1.html)


Life cycle
--

### onBring()
Be called on created page host element and page handle.
surely be called once.

this is like as onCreate() in Android fragment life cycle.

### onOpen()
Be called once on open page when after initialized page handle and handles(in article).

this is like as onViewCreated() in Android fragment life cycle.

### onShow()
Be called on showing page from initial or hided.

this is like as onStart() in Android fragment life cycle.

### onFocus()
Be called on focus page and current application(window of DOM. but currently not implemented).

this is like as onResume() in Android fragment life cycle.

### onBack()*
Be called on back(web browser back press or android back button press or iOS swipe to back) requested.
be triggered by popstate event of window

this is like as onBackPressed() in Android fragment life cycle.

(* This is diffrent as an life cycle things. but this rimwork take same as lifecycle. and on go to forward request-pushstate- is not implemented currently.)

### onBlur()
Be called on blur page and current application(window of DOM. but currently not implemented).

this is like as onPause() in Android fragment life cycle.

### onHide()
Be called on hiding page by hide or close request.

this is like as onStop() in Android fragment life cycle.

### onClose()
Be called once on close page when before release(destroy) page handle and handles(in article).

this is like as onDestroyView() in Android fragment life cycle.

### onRelease()
Be called once on release(destroy) page handle and remove page host element.
but fully static(parent page handles any one has no instant statement) page handle has not be removed element from DOM.

this is like as onDestroy() in Android fragment life cycle.


***

** This project is currently just begining.
to be added more documentation and examples soon. **

***
