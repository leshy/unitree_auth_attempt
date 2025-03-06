var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// node_modules/.deno/eventemitter3@5.0.1/node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/.deno/eventemitter3@5.0.1/node_modules/eventemitter3/index.js"(exports, module) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__) prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }
    function EventEmitter2() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0) return names;
      for (name in events = this._events) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter2.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter2.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };
    EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                args[j - 1] = arguments[j];
              }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter2.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter2.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
    EventEmitter2.prefixed = prefix;
    EventEmitter2.EventEmitter = EventEmitter2;
    if ("undefined" !== typeof module) {
      module.exports = EventEmitter2;
    }
  }
});

// node_modules/.deno/eventemitter3@5.0.1/node_modules/eventemitter3/index.mjs
var import_index = __toESM(require_eventemitter3(), 1);

// clientside/wm.ts
var Window = class extends import_index.default {
  constructor(title = "") {
    super();
    __publicField(this, "element");
    __publicField(this, "titleElement");
    __publicField(this, "contentElement");
    __publicField(this, "subWindows", []);
    this.element = document.createElement("div");
    this.element.className = "window";
    if (title) {
      this.titleElement = document.createElement("div");
      this.titleElement.className = "window-title";
      this.titleElement.innerText = title;
      this.element.appendChild(this.titleElement);
    }
    this.contentElement = document.createElement("div");
    this.contentElement.className = "window-content";
    this.contentElement.style.display = "flex";
    this.contentElement.style.flexWrap = "wrap";
    this.element.appendChild(this.contentElement);
  }
  get title() {
    return this.titleElement ? this.titleElement.innerText : "";
  }
  set title(value) {
    if (this.titleElement) {
      this.titleElement.innerText = value;
    }
  }
  addWindow(window) {
    this.subWindows.push(window);
    this.contentElement.appendChild(window.element);
    return window;
  }
  removeWindow(window) {
    const index = this.subWindows.indexOf(window);
    if (index !== -1) {
      this.subWindows.splice(index, 1);
      this.contentElement.removeChild(window.element);
    }
  }
  clearWindows() {
    this.subWindows.forEach(
      (subWin) => this.contentElement.removeChild(subWin.element)
    );
    this.subWindows = [];
  }
};

// clientside/controls.ts
var Controls = class extends import_index.default {
  constructor(window) {
    super();
    this.window = window;
    __publicField(this, "container");
    __publicField(this, "controlsMap", /* @__PURE__ */ new Map());
    // Map to track radio button groups
    __publicField(this, "radioGroups", /* @__PURE__ */ new Map());
    // Map to track checkbox groups
    __publicField(this, "checkboxGroups", /* @__PURE__ */ new Map());
    this.container = document.createElement("div");
    this.container.className = "controls horizontal";
    this.window.element.appendChild(this.container);
  }
  /**
   * Sets the layout orientation of the controls
   */
  setLayout(layout) {
    this.container.classList.remove("horizontal", "vertical", "grid");
    this.container.classList.add(layout);
  }
  /**
   * Adds a simple button with a click handler
   */
  addButton(id, label, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.addEventListener("click", onClick);
    this.container.appendChild(button);
    this.controlsMap.set(id, button);
    return button;
  }
  /**
   * Adds a toggle button that switches between two states
   */
  addToggleButton(id, labels, isActive, onToggle) {
    const button = document.createElement("button");
    button.textContent = isActive() ? labels[1] : labels[0];
    button.addEventListener("click", () => {
      onToggle();
      button.textContent = isActive() ? labels[1] : labels[0];
    });
    this.container.appendChild(button);
    this.controlsMap.set(id, button);
    return button;
  }
  /**
   * Adds a radio button that is part of a group where only one can be selected
   */
  addRadioButton(id, groupName, label, value, isSelected, onSelect) {
    const button = document.createElement("button");
    button.textContent = label;
    button.dataset.value = String(value);
    if (isSelected) {
      button.classList.add("selected");
    }
    this.controlsMap.set(id, button);
    if (!this.radioGroups.has(groupName)) {
      this.radioGroups.set(groupName, /* @__PURE__ */ new Set());
    }
    this.radioGroups.get(groupName)?.add(id);
    button.addEventListener("click", () => {
      const groupButtons = this.radioGroups.get(groupName) || /* @__PURE__ */ new Set();
      for (const btnId of groupButtons) {
        const btn = this.getControl(btnId);
        if (btn) {
          btn.classList.remove("selected");
        }
      }
      button.classList.add("selected");
      onSelect(value);
    });
    this.container.appendChild(button);
    return button;
  }
  /**
   * Creates a radio button group with multiple options
   */
  addRadioGroup(groupName, options, initialValue, onChange) {
    return options.map(
      (option) => this.addRadioButton(
        option.id,
        groupName,
        option.label,
        option.value,
        option.value === initialValue,
        onChange
      )
    );
  }
  /**
   * Adds a slider control with min, max and step values
   */
  addSlider(id, min, max, step, initialValue, onChange) {
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min.toString();
    slider.max = max.toString();
    slider.step = step.toString();
    slider.value = initialValue.toString();
    slider.addEventListener("input", () => {
      onChange(parseFloat(slider.value));
    });
    this.container.appendChild(slider);
    this.controlsMap.set(id, slider);
    return slider;
  }
  /**
   * Gets a control by ID with type casting
   */
  getControl(id) {
    return this.controlsMap.get(id);
  }
  /**
   * Updates a control's properties or state
   */
  updateControl(id, updater) {
    const control = this.controlsMap.get(id);
    if (control) {
      updater(control);
    }
  }
  /**
   * Updates the selected radio button in a group
   */
  setRadioSelection(groupName, value) {
    const groupButtons = this.radioGroups.get(groupName) || /* @__PURE__ */ new Set();
    for (const btnId of groupButtons) {
      const btn = this.getControl(btnId);
      if (btn) {
        if (btn.dataset.value === String(value)) {
          btn.classList.add("selected");
        } else {
          btn.classList.remove("selected");
        }
      }
    }
  }
  /**
   * Adds a checkbox button that can be toggled independently
   */
  addCheckboxButton(id, groupName, label, value, isChecked, onToggle) {
    const button = document.createElement("button");
    button.textContent = label;
    button.dataset.value = String(value);
    button.className = "checkbox-button";
    if (isChecked) {
      button.classList.add("checked");
    }
    this.controlsMap.set(id, button);
    if (!this.checkboxGroups.has(groupName)) {
      this.checkboxGroups.set(groupName, /* @__PURE__ */ new Set());
    }
    this.checkboxGroups.get(groupName)?.add(id);
    button.addEventListener("click", () => {
      const isCurrentlyChecked = button.classList.contains("checked");
      if (isCurrentlyChecked) {
        button.classList.remove("checked");
      } else {
        button.classList.add("checked");
      }
      onToggle(value, !isCurrentlyChecked);
    });
    this.container.appendChild(button);
    return button;
  }
  /**
   * Creates a group of checkbox buttons
   */
  addCheckboxGroup(groupName, options, initialValues = [], onChange) {
    return options.map(
      (option) => this.addCheckboxButton(
        option.id,
        groupName,
        option.label,
        option.value,
        initialValues.includes(option.value),
        onChange
      )
    );
  }
  /**
   * Gets all selected values in a checkbox group
   */
  getCheckedValues(groupName) {
    const values = [];
    const groupButtons = this.checkboxGroups.get(groupName) || /* @__PURE__ */ new Set();
    for (const btnId of groupButtons) {
      const btn = this.getControl(btnId);
      if (btn && btn.classList.contains("checked")) {
        values.push(btn.dataset.value);
      }
    }
    return values;
  }
  /**
   * Sets the checked state of a button in a checkbox group
   */
  setCheckboxState(groupName, value, isChecked) {
    const groupButtons = this.checkboxGroups.get(groupName) || /* @__PURE__ */ new Set();
    for (const btnId of groupButtons) {
      const btn = this.getControl(btnId);
      if (btn && btn.dataset.value === String(value)) {
        if (isChecked) {
          btn.classList.add("checked");
        } else {
          btn.classList.remove("checked");
        }
        break;
      }
    }
  }
};

// clientside/main.ts
var root = new Window();
document.getElementById("window-container")?.appendChild(root.element);
var testWin = root.addWindow(new Window("unitree auth v1"));
testWin.element.style.height = "100vh";
globalThis.testWin = testWin;
var ctrl = new Controls(testWin);
ctrl.addButton("connectRobot", "connect robot", connectRobot);
function getReadableTimeString() {
  const now = /* @__PURE__ */ new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const ms = now.getMilliseconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}:${ms}`;
}
function log(...values) {
  const el = document.createElement("div");
  el.className = "logLine";
  el.textContent = getReadableTimeString() + " | " + // @ts-ignore
  values.map(JSON.stringify).join(" ");
  testWin.element.prepend(el);
}
async function connectRobot() {
  const pc = new RTCPeerConnection({ sdpSemantics: "unified-plan" });
  const channel = pc.createDataChannel("data");
  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "sendrecv" });
  pc.addEventListener("track", console.log);
  channel.onmessage = console.log;
  log("creating SDP offer...");
  await pc.createOffer().then((offer) => pc.setLocalDescription(offer)).then(() => {
    log("offer created");
  });
  const sdpreq = {
    token: "",
    id: "STA_localNetwork",
    type: "offer",
    ip: "192.168.12.1",
    // @ts-ignore
    sdp: pc.localDescription.sdp
  };
  console.log(sdpreq);
  const peer_answer = await getPeerAnswer(
    sdpreq,
    "192.168.12.1"
  );
  console.log("Setting remote description with peer answer");
  try {
    const sessionDescription = new RTCSessionDescription(peer_answer);
    await pc.setRemoteDescription(sessionDescription);
    console.log("Remote description set successfully");
  } catch (error) {
    console.error("Error setting remote description:", error);
  }
  return peer_answer;
}
function getPeerAnswer(sdp, ip) {
  return fetch("/sdp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sdp, ip })
  }).then((response) => response.json()).then((data) => {
    log(data);
    console.log("session data received:", data);
    return new RTCSessionDescription(data);
  }).catch((error) => {
    console.error("Error connecting to robot:", error);
  });
}
