import { LitElement, html, property, customElement } from 'lit-element';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function rotateDimensions(_ref, rotation) {
  var {
    width,
    height
  } = _ref;

  if (rotation === 0 || rotation === 180) {
    return {
      width,
      height
    };
  }

  return {
    width: height,
    height: width
  };
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n      <style>\n        :host {\n          display: block;\n          /*\n          Necessary to prevent layout issues on 90/180deg. Layout will\n          look at the pre-rotated dimensions.\n          */\n          overflow: hidden;\n        }\n        canvas {\n          touch-action: none;\n          transform-origin: 50% 50%;\n        }\n      </style>\n      <canvas\n        width=\"", "\"\n        height=\"", "\"\n        style=\"", "\"\n      ></canvas>\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

/* eslint-env browser */

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render"] }] */
var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
    if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  }
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.

var ROTATION_EPSILON = 0.0001;

function getRotateTransform(rotation, disableLowLatency) {
  var finalRotation = rotation + (disableLowLatency ? ROTATION_EPSILON : 0);
  return "rotate(".concat(finalRotation, "deg)");
}

function getTranslateTransform(_ref, rotation) {
  var {
    width,
    height
  } = _ref;
  var shiftX = 0;
  var shiftY = 0;

  if (rotation === 90 || rotation === 270) {
    var [canvasWidth, canvasHeight] = [height, width];
    var w2 = canvasWidth / 2;
    var h2 = canvasHeight / 2;
    shiftX = h2 - w2;
    shiftY = w2 - h2;
  }

  return "translate(".concat(shiftX, "px, ").concat(shiftY, "px)");
}

function getTransform(_ref2, rotation, disableLowLatency) {
  var {
    width,
    height
  } = _ref2;
  var rotateTransform = getRotateTransform(rotation, disableLowLatency);
  var translateTransform = getTranslateTransform({
    width,
    height
  }, rotation);
  return "transform: ".concat(translateTransform, " ").concat(rotateTransform, ";");
}

var StylusCanvas = class StylusCanvas extends LitElement {
  constructor() {
    super();
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.disableLowLatency = false; // Initialize properties

    this.width = 300; // <canvas> default

    this.height = 150; // <canvas> default

    this.rotation = window.screen.orientation.angle;
    this.disableLowLatency = false; // Observe resizes

    var resizeObserver = new ResizeObserver(() => {
      // Only resize if still visible in the DOM
      if (this.offsetParent !== null) {
        this.handleResize(this.clientWidth, this.clientHeight);
      }
    });
    resizeObserver.observe(this); // TODO detach observer
    // Observe orientation changes

    window.screen.orientation.onchange = () => {
      this.handleRotate(window.screen.orientation.angle);
    };
  }

  render() {
    var {
      width,
      height,
      rotation
    } = this;
    var canvasDims = rotateDimensions({
      width,
      height
    }, rotation);
    var elDims = {
      width: this.clientWidth,
      height: this.clientHeight
    };
    var canvasStyleDims = rotateDimensions(elDims, rotation);
    var {
      disableLowLatency
    } = this;
    var transform = getTransform(elDims, rotation, disableLowLatency);
    var style = "width: ".concat(canvasStyleDims.width, "px; height: ").concat(canvasStyleDims.height, "px; ").concat(transform);
    return html(_templateObject(), canvasDims.width, canvasDims.height, style);
  }

  handleResize(width, height) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.requestUpdate();

      yield _this.updateComplete;

      _this.dispatchEvent(new CustomEvent('canvas-resize', {
        detail: {
          width,
          height
        }
      }));
    })();
  }

  handleRotate(rotation) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.rotation = rotation;
      yield _this2.updateComplete;

      _this2.dispatchEvent(new CustomEvent('canvas-rotate', {
        detail: {
          angle: _this2.rotation
        }
      }));
    })();
  } // API


  getContext(contextId, contextAttributes) {
    var attributes = contextAttributes || {}; // Check that parameters will allow for low-latency

    if (attributes.desynchronized !== true) {
      throw new Error('getContext(id, attrs) must include {desynchronized: true}');
    }

    var canvas = this.shadowRoot.querySelector('canvas');
    return canvas.getContext(contextId, attributes);
  }

};

__decorate([property({
  type: Number
})], StylusCanvas.prototype, "width", void 0);

__decorate([property({
  type: Number
})], StylusCanvas.prototype, "height", void 0);

__decorate([property({
  type: Number
})], StylusCanvas.prototype, "rotation", void 0);

__decorate([property({
  type: Boolean
})], StylusCanvas.prototype, "disableLowLatency", void 0);

StylusCanvas = __decorate([customElement("stylus-canvas")], StylusCanvas);
var StylusCanvas$1 = StylusCanvas;

export default StylusCanvas$1;
