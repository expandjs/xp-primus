/**
 * @license
 * Copyright (c) 2017 The expand.js authors. All rights reserved.
 * This code may only be used under the BSD style license found at https://expandjs.github.io/LICENSE.txt
 * The complete set of authors may be found at https://expandjs.github.io/AUTHORS.txt
 * The complete set of contributors may be found at https://expandjs.github.io/CONTRIBUTORS.txt
 */

// Const
const events  = ['close', 'data', 'destroy', 'end', 'error', 'offline', 'online', 'open', 'ready', 'reconnect', 'reconnected', 'state', 'timeout'],
    env       = typeof window !== "undefined" ? window : global,
    Primus    = typeof window !== "undefined" ? null : require('primus.io'),
    location  = env.location || {},
    XP        = env.XP || require('expandjs'),
    XPEmitter = env.XPEmitter || require('xp-emitter'),
    XPScript  = env.XPScript || require('xp-script');

/*********************************************************************/

/**
 * A class used to wrap Primus functionality.
 *
 * @class XPPrimus
 * @extends XPEmitter /bower_components/xp-emitter/lib/index.js
 * @since 1.0.0
 * @description A class used to wrap Primus functionality
 * @keywords nodejs, expandjs
 * @source https://github.com/expandjs/xp-primus/blob/master/lib/index.js
 */
module.exports = env.XPPrimus = new XP.Class('XPPrimus', {

    // EXTENDS
    extends: XPEmitter,

    /*********************************************************************/

    /**
     * Emitted when an error is received.
     *
     * @event error
     * @param {Object} error
     */

    /**
     * Emitted when the client is offline.
     *
     * @event offline
     */

    /**
     * Emitted when the client is online.
     *
     * @event online
     */

    /**
     * Emitted when the socket is ready.
     *
     * @event ready
     */

    /**
     * Emitted when the socket state changes.
     *
     * @event state
     * @param {string} state
     */

    /*********************************************************************/

    /**
     * @constructs
     * @param {Object | string} options The connection's url or options
     *   @param {string} [options.global = "Primus"] The global variable's name for `Primus`
     *   @param {string} [options.hostname] The connection's hostname
     *   @param {number} [options.port] The connection's port
     *   @param {number} [options.protocol = "https:"] The connection's protocol
     *   @param {Object} [options.query] The connection's query
     *   @param {string} [options.transformer = "websockets"] The Socket transformer
     *   @param {string} [options.url] The connection's url
     * @param {Function} resolver The promise callback
     */
    initialize: {
        promise: true,
        value(options, resolver) {

            // Attempting
            XP.attempt(resolver => {

                // Super
                XPEmitter.call(this);

                // Overriding
                if (!XP.isObject(options)) { options = {url: options}; }
                if (!XP.isFalsy(options.url)) { Object.assign(options, XP.pick(XP.parseURL(options.url), ['hostname', 'query', 'port', 'protocol'])); }

                // Setting
                this.channels    = {};
                this.adapted     = false;
                this.offline     = false;
                this.state       = 'idle';
                this.options     = options;
                this.global      = this.options.global || 'Primus';
                this.hostname    = this.options.hostname || location.hostname || '';
                this.port        = this.options.port || (!this.options.hostname && location.port) || null;
                this.protocol    = this.options.protocol || (!this.options.hostname && location.protocol) || 'https:';
                this.query       = this.options.query || null;
                this.transformer = this.options.transformer || 'websockets';
                this.src         = XP.toURL({protocol: this.protocol, hostname: this.hostname, port: this.port, pathname: '/primus/primus.io.js'});
                this.url         = XP.toURL({protocol: this.protocol, hostname: this.hostname, port: this.port, query: this.query});

                // Binding
                this.adapt = this.adapt.bind(this, resolver);

            }, resolver);
        }
    },

    /*********************************************************************/

    /**
     * Discards an event listener.
     *
     * @method discard
     * @param {string} channel
     * @param {string} [event]
     * @param {Function} [handler]
     */
    discard(channel, event, handler) {

        // Preparing
        if (XP.isFunction(event)) { handler = event; event = channel; channel = undefined; }

        // Asserting
        XP.assertArgument(XP.isVoid(channel) || XP.isString(channel, true), 1, 'string');
        XP.assertArgument(XP.isString(event, true), 2, 'string');
        XP.assertArgument(XP.isVoid(handler) || XP.isFunction(handler), 3, 'Function');

        // CASE: channel
        if (channel) { this._channel(channel, (error, channel) => channel && channel[handler ? 'removeListener' : 'removeAllListeners'](event, handler)); return; }

        // CASE: default
        if (!events.includes(event)) { this._connect(error => !error && this.adaptee[handler ? 'removeListener' : 'removeAllListeners'](event, handler)); }
    },

    /**
     * Adds an event listener.
     *
     * @method on
     * @param {string} channel
     * @param {string} [event]
     * @param {Function} [handler]
     */
    on(channel, event, handler) {

        // Preparing
        if (XP.isFunction(event)) { handler = event; event = channel; channel = undefined; }

        // Asserting
        XP.assertArgument(XP.isVoid(channel) || XP.isString(channel, true), 1, 'string');
        XP.assertArgument(XP.isString(event, true), 2, 'string');
        XP.assertArgument(XP.isFunction(handler), 3, 'Function');

        // CASE: channel
        if (channel) { this._channel(channel, (error, channel) => channel && channel.on(event, handler)); return; }

        // CASE: wrapped
        if (events.includes(event)) { XPEmitter.prototype.on.call(this, event, handler); return; }

        // CASE: default
        this._connect(error => !error && this.adaptee.on(event, handler));
    },

    /**
     * Adds a one time event listener.
     *
     * @method once
     * @param {string} channel
     * @param {string} [event]
     * @param {Function} [handler]
     */
    once(channel, event, handler) {

        // Preparing
        if (XP.isFunction(event)) { handler = event; event = channel; channel = undefined; }

        // Asserting
        XP.assertArgument(XP.isVoid(channel) || XP.isString(channel, true), 1, 'string');
        XP.assertArgument(XP.isString(event, true), 2, 'string');
        XP.assertArgument(XP.isFunction(handler), 3, 'Function');

        // CASE: channel
        if (channel) { this._channel(channel, (error, channel) => channel && channel.once(event, handler)); return; }

        // CASE: wrapped
        if (events.includes(event)) { XPEmitter.prototype.once.call(this, event, handler); return; }

        // CASE: default
        this._connect(error => !error && this.adaptee.on(event, handler));
    },

    /*********************************************************************/

    /**
     * Set the adaptee.
     *
     * @method adapt
     * @param {Function} [callback]
     */
    adapt: {
        callback: true,
        value(resolver, callback) {
            let Socket = null;
            XP.waterfall([
                next => this.adapted ? this.ready(callback) : next(null, this.adapted = true), // preventing
                next => Primus ? next() : new XPScript({src: this.src}, next), // loading
                next => next(null, Socket = Primus ? Primus.createSocket({transformer: this.transformer}) : window[this.global]), // preparing
                next => next(null, this.adaptee = new Socket(this.url, {manual: true})), // adapting
                next => next(null, this.adaptee.on('close', this._handleClose.bind(this))), // listening
                next => next(null, this.adaptee.on('error', this._handleError.bind(this))), // listening
                next => next(null, this.adaptee.on('offline', this._handleOffline.bind(this))), // listening
                next => next(null, this.adaptee.on('online', this._handleOnline.bind(this))), // listening
                next => next(null, this.adaptee.on('open', this._handleOpen.bind(this))), // listening
                next => next(null, this.adaptee.on('reconnect', this._handleReconnect.bind(this))), // listening
                next => next(null, resolver(null, this.emit('ready'))) // resolving
            ], callback);
        }
    },

    /**
     * Closes the connection definitively.
     *
     * @method destroy
     * @param {Function} [callback]
     */
    destroy: {
        callback: true,
        value(callback) {
            XP.waterfall([
                next => this.ready(next), // waiting
                next => this.adaptee.once('destroy', next) && this.adaptee.destroy() // destroying
            ], callback);
        }
    },

    /**
     * Leaves the specified `channel`.
     *
     * @method leave
     * @param {string} channel
     * @param {Function} [callback]
     */
    leave: {
        callback: true,
        value(channel, callback) {
            XP.waterfall([
                next => next(!XP.isString(channel, true) && XP.error(500, '"channel" must be string.')), // checking
                next => this.channels[channel] ? this._channel(channel, (err, res) => next(err, channel = res)) : callback(null, false), // ensuring
                next => channel.once('close', next) && channel.destroy(), // destroying
                next => next(null, delete this.channels[channel.name]) // deleting
            ], callback);
        }
    },

    /**
     * Sends `data` to the `channel`, invoking the specified `event`.
     *
     * @method send
     * @param {string} channel
     * @param {string} event
     * @param {Object} [data]
     * @param {Function} [callback]
     */
    send: {
        callback: true,
        value(channel, event, data, callback) {
            XP.waterfall([
                next => next(!XP.isString(channel, true) && XP.error(500, '"channel" must be string.')), // checking
                next => next(!XP.isString(event, true) && XP.error(500, '"event" must be string.')), // checking
                next => next(!XP.isVoid(data) && !XP.isObject(data) && XP.error(500, '"data" must be Object.')), // checking
                next => this._channel(channel, (err, res) => next(err, channel = res)), // ensuring
                next => channel.send(event, data, next) // sending
            ], callback);
        }
    },

    /*********************************************************************/

    /**
     * Ensures a channel.
     *
     * @method _channel
     * @param {string} name
     * @param {Function} [callback]
     * @private
     */
    _channel: {
        callback: true,
        enumerable: false,
        value(name, callback) {
            let caught = false;
            XP.waterfall([
                next => next(!XP.isString(name, true) && XP.error(500, '"name" must be string.')), // checking
                next => next(null, this.channels[name] = this.channels[name] || new Promise((resolve, reject) => this._connect(error => error ? reject(error) : resolve(this.adaptee.channel(name))))), // promising
                next => this.channels[name].catch(error => { caught = true; next(error); }).then(data => caught || next(null, data)) // resolving
            ], callback);
        }
    },

    /**
     * Opens the connection.
     *
     * @method _connect
     * @param {Function} [callback]
     * @private
     */
    _connect: {
        callback: true,
        enumerable: false,
        value(callback) {
            XP.waterfall([
                next => this.adapt(err => this.state === 'connected' ? callback(err) : next(err)), // adapting
                next => this.adaptee.once('open', next) && this.state === 'idle' && this.adaptee.open(this.state = 'connecting') // opening
            ], callback);
        }
    },

    /*********************************************************************/

    /**
     * If set to true, the adaptee has been set.
     *
     * @property adapted
     * @type boolean
     * @default false
     * @readonly
     */
    adapted: {
        set(val) { return this.adapted || !!val; }
    },

    /**
     * The Socket's instance.
     *
     * @property adaptee
     * @type Object
     */
    adaptee: {
        set(val) { return this.adaptee || val; },
        validate(val) { return !XP.isObject(val) && 'Object'; }
    },

    /**
     * The map of channels.
     *
     * @property channels
     * @type Object
     * @readonly
     */
    channels: {
        set(val) { return this.channels || val; },
        validate(val) { return !XP.isObject(val) && 'Object'; }
    },

    /**
     * The  global variable's name for `Primus`.
     *
     * @property global
     * @type string
     * @default "Primus"
     */
    global: {
        set(val) { return this.global || val; },
        validate(val) { return !XP.isString(val, true) && 'string'; }
    },

    /**
     * The connection's hostname.
     *
     * @property hostname
     * @type string
     */
    hostname: {
        set(val) { return this.hostname || val; },
        validate(val) { return !XP.isString(val, true) && 'string'; }
    },

    /**
     * If set to true, the connection is offline.
     *
     * @property offline
     * @type boolean
     * @readonly
     */
    offline: {
        set(val) { return !!val; }
    },

    /**
     * The connection's port.
     *
     * @property port
     * @type number
     */
    port: {
        set(val) { return XP.isDefined(this.port) ? this.port : val; },
        validate(val) { return !XP.isNull(val) && !XP.isNumeric(val, true) && 'number'; }
    },

    /**
     * The connection's protocol.
     *
     * @property protocol
     * @type string
     */
    protocol: {
        set(val) { return this.protocol || val; },
        validate(val) { return !XP.isString(val, true) && 'string'; }
    },

    /**
     * The connection's query.
     *
     * @property query
     * @type Object
     */
    query: {
        set(val) { return XP.isDefined(this.query) ? this.query : val; },
        validate(val) { return !XP.isNull(val) && !XP.isObject(val) && 'Object'; }
    },

    /**
     * The library's src.
     *
     * @property src
     * @type string
     */
    src: {
        set(val) { return this.src || val; },
        validate(val) { return !XP.isString(val, true) && 'string'; }
    },

    /**
     * The connection's state.
     *
     * @property state
     * @type string
     * @default "idle"
     * @readonly
     */
    state: {
        set(val) { return val; },
        then(val) { this.emit('state', val); },
        validate(val) { return !this.states.includes(val) && 'string'; }
    },

    /**
     * The list of possible connection's states.
     *
     * @property states
     * @type Array
     * @default ["connected", "connecting", "disconnected", "idle"]
     * @readonly
     */
    states: {
        frozen: true,
        writable: false,
        value: ['connected', 'connecting', 'disconnected', 'idle']
    },

    /**
     * The Socket's transformer.
     *
     * @property transformer
     * @type string
     * @default "websockets"
     */
    transformer: {
        set(val) { return this.transformer || val; },
        validate(val) { return !this.transformers.includes(val) && this.transformers.split(", "); }
    },

    /**
     * The list of possible Socket's transformers.
     *
     * @property transformers
     * @type Array
     * @default ["browserchannel", "engine.io", "faye", "sockjs", "uws", "websockets"]
     * @readonly
     */
    transformers: {
        frozen: true,
        writable: false,
        value: ['browserchannel', 'engine.io', 'faye', 'sockjs', 'uws', 'websockets']
    },

    /**
     * The connection's url.
     *
     * @property url
     * @type string
     */
    url: {
        set(val) { return this.url || val; },
        validate(val) { return !XP.isString(val, true) && 'string'; }
    },

    /*********************************************************************/

    // HANDLER
    _handleClose() {

        // Setting
        this.state = 'disconnected';
    },

    // HANDLER
    _handleError(error) {

        // Setting
        if (this.state === 'connecting') { this.state = 'disconnected'; }

        // Emitting
        this.emit('error', error);
    },

    // HANDLER
    _handleOffline() {

        // Setting
        this.offline = true;

        // Emitting
        this.emit('offline');
    },

    // HANDLER
    _handleOnline() {

        // Setting
        this.offline = false;

        // Emitting
        this.emit('online');
    },

    // HANDLER
    _handleOpen() {

        // Setting
        this.state = 'connected';
    },

    // HANDLER
    _handleReconnect() {

        // Setting
        this.state = 'connecting';
    }
});
