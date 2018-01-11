!function(t){var e={};function n(i){if(e[i])return e[i].exports;var s=e[i]={i:i,l:!1,exports:{}};return t[i].call(s.exports,s,s.exports,n),s.l=!0,s.exports}n.m=t,n.c=e,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:i})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){t.exports=n(1)},function(t,e,n){(function(e){const i=["close","data","destroy","end","error","offline","online","open","ready","reconnect","reconnected","state","timeout"],s="undefined"!=typeof window?window:e,r="undefined"!=typeof window?null:n(3),o=s.location||{},a=s.XP||n(4),l=s.XPEmitter||n(5),h=s.XPScript||n(6);t.exports=new a.Class("XPPrimus",{extends:l,initialize:{promise:!0,value(t,e){l.call(this),a.isObject(t)||(t={url:t}),a.isFalsy(t.url)||Object.assign(t,a.pick(a.parseURL(t.url),["hostname","query","port","protocol"])),this.channels={},this.adapted=!1,this.offline=!1,this.state="idle",this.options=t,this.global=this.options.global||"Primus",this.hostname=this.options.hostname||o.hostname||"",this.port=this.options.port||!this.options.hostname&&o.port||null,this.protocol=this.options.protocol||!this.options.hostname&&o.protocol||"https:",this.query=this.options.query||null,this.transformer=this.options.transformer||"websockets",this.src=a.toURL({protocol:this.protocol,hostname:this.hostname,port:this.port,pathname:"/primus/primus.io.js"}),this.url=a.toURL({protocol:this.protocol,hostname:this.hostname,port:this.port,query:this.query}),this.adapt=this.adapt.bind(this,e)}},discard(t,e,n){a.isFunction(e)&&(n=e,e=t,t=void 0),a.assertArgument(a.isVoid(t)||a.isString(t,!0),1,"string"),a.assertArgument(a.isString(e,!0),2,"string"),a.assertArgument(a.isVoid(n)||a.isFunction(n),3,"Function"),t?this._channel(t,(t,i)=>i&&i[n?"removeListener":"removeAllListeners"](e,n)):i.includes(e)||this._connect(t=>!t&&this.adaptee[n?"removeListener":"removeAllListeners"](e,n))},on(t,e,n){a.isFunction(e)&&(n=e,e=t,t=void 0),a.assertArgument(a.isVoid(t)||a.isString(t,!0),1,"string"),a.assertArgument(a.isString(e,!0),2,"string"),a.assertArgument(a.isFunction(n),3,"Function"),t?this._channel(t,(t,i)=>i&&i.on(e,n)):i.includes(e)?l.prototype.on.call(this,e,n):this._connect(t=>!t&&this.adaptee.on(e,n))},once(t,e,n){a.isFunction(e)&&(n=e,e=t,t=void 0),a.assertArgument(a.isVoid(t)||a.isString(t,!0),1,"string"),a.assertArgument(a.isString(e,!0),2,"string"),a.assertArgument(a.isFunction(n),3,"Function"),t?this._channel(t,(t,i)=>i&&i.once(e,n)):i.includes(e)?l.prototype.once.call(this,e,n):this._connect(t=>!t&&this.adaptee.on(e,n))},adapt:{promise:!0,value(t,e){let n=null;a.waterfall([t=>this.adapted?this.ready(e):t(null,this.adapted=!0),t=>r?t():new h({src:this.src},t),t=>t(null,n=r?r.createSocket({transformer:this.transformer}):window[this.global]),t=>t(null,this.adaptee=new n(this.url,{manual:!0})),t=>t(null,this.adaptee.on("close",this._handleClose.bind(this))),t=>t(null,this.adaptee.on("error",this._handleError.bind(this))),t=>t(null,this.adaptee.on("offline",this._handleOffline.bind(this))),t=>t(null,this.adaptee.on("online",this._handleOnline.bind(this))),t=>t(null,this.adaptee.on("open",this._handleOpen.bind(this))),t=>t(null,this.adaptee.on("reconnect",this._handleReconnect.bind(this))),e=>e(null,t(null,this.emit("ready")))],e)}},destroy:{promise:!0,value(t){a.waterfall([t=>this.ready(t),t=>this.adaptee.once("destroy",t)&&this.adaptee.destroy()],t)}},leave:{promise:!0,value(t,e){a.waterfall([e=>e(!a.isString(t,!0)&&a.ValidationError("channel","string")),n=>this.channels[t]?this._channel(t,(e,i)=>n(e,t=i)):e(null,!1),e=>t.once("close",e)&&t.destroy(),e=>e(null,delete this.channels[t.name])],e)}},send:{promise:!0,value(t,e,n,i){a.waterfall([e=>e(!a.isString(t,!0)&&a.ValidationError("channel","string")),t=>t(!a.isString(e,!0)&&a.ValidationError("event","string")),t=>t(!a.isVoid(n)&&!a.isObject(n)&&a.ValidationError("data","Object")),e=>this._channel(t,(n,i)=>e(n,t=i)),i=>t.send(e,n,i)],i)}},_channel(t,e){let n=!1;a.waterfall([e=>e(!a.isString(t,!0)&&a.ValidationError("name","string")),e=>e(null,this.channels[t]=this.channels[t]||new Promise((e,n)=>this._connect(i=>i?n(i):e(this.adaptee.channel(t))))),e=>this.channels[t].catch(t=>{n=!0,e(t)}).then(t=>n||e(null,t))],e)},_connect(t){a.waterfall([e=>this.adapt(n=>"connected"===this.state?t(n):e(n)),t=>this.adaptee.once("open",t)&&"idle"===this.state&&this.adaptee.open(this.state="connecting")],t)},adapted:{set(t){return this.adapted||Boolean(t)}},adaptee:{set(t){return this.adaptee||t},validate:t=>!a.isObject(t)&&"Object"},channels:{set(t){return this.channels||t},validate:t=>!a.isObject(t)&&"Object"},global:{set(t){return this.global||t},validate:t=>!a.isString(t,!0)&&"string"},hostname:{set(t){return this.hostname||t},validate:t=>!a.isString(t,!0)&&"string"},offline:{set:t=>Boolean(t)},port:{set(t){return a.isDefined(this.port)?this.port:t},validate:t=>!a.isNull(t)&&!a.isNumeric(t,!0)&&"number"},protocol:{set(t){return this.protocol||t},validate:t=>!a.isString(t,!0)&&"string"},query:{set(t){return a.isDefined(this.query)?this.query:t},validate:t=>!a.isNull(t)&&!a.isObject(t)&&"Object"},src:{set(t){return this.src||t},validate:t=>!a.isString(t,!0)&&"string"},state:{set:t=>t,then(t){this.emit("state",t)},validate(t){return!this.states.includes(t)&&"string"}},states:{frozen:!0,writable:!1,value:["connected","connecting","disconnected","idle"]},transformer:{set(t){return this.transformer||t},validate(t){return!this.transformers.includes(t)&&this.transformers.split(", ")}},transformers:{frozen:!0,writable:!1,value:["browserchannel","engine.io","faye","sockjs","uws","websockets"]},url:{set(t){return this.url||t},validate:t=>!a.isString(t,!0)&&"string"},_handleClose(){this.state="disconnected"},_handleError(t){"connecting"===this.state&&(this.state="disconnected"),this.emit("error",t)},_handleOffline(){this.offline=!0,this.emit("offline")},_handleOnline(){this.offline=!1,this.emit("online")},_handleOpen(){this.state="connected"},_handleReconnect(){this.state="connecting"}}),"undefined"!=typeof window&&(window.XPPrimus=t.exports)}).call(e,n(2))},function(t,e){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(t){"object"==typeof window&&(n=window)}t.exports=n},function(t,e){t.exports=Primus},function(t,e){t.exports=XP},function(t,e){t.exports=XPEmitter},function(t,e){t.exports=XPScript}]);