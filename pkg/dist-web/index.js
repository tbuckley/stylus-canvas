import { LitElement, html } from 'lit-element';

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

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
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

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n      <style>\n        :host {\n          display: block;\n          /*\n          Necessary to prevent layout issues on 90/180deg. Layout will\n          look at the pre-rotated dimensions.\n          */\n          overflow: hidden;\n        }\n        canvas {\n          touch-action: none;\n          transform-origin: 50% 50%;\n        }\n      </style>\n      <canvas\n        width=\"", "\"\n        height=\"", "\"\n        style=\"", "\"\n      ></canvas>\n    "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.

var ROTATION_EPSILON = 0.0001;

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

function getRotateTransform(rotation, disableLowLatency) {
  var finalRotation = rotation + (disableLowLatency ? ROTATION_EPSILON : 0);
  return "rotate(".concat(finalRotation, "deg)");
}

function getTranslateTransform(_ref2, rotation) {
  var {
    width,
    height
  } = _ref2;
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

function getTransform(_ref3) {
  var {
    width,
    height,
    rotation,
    disableLowLatency
  } = _ref3;
  var rotateTransform = getRotateTransform(rotation, disableLowLatency);
  var translateTransform = getTranslateTransform({
    width,
    height
  }, rotation);
  return "transform: ".concat(translateTransform, " ").concat(rotateTransform, ";");
}

class StylusCanvas extends LitElement {
  static get properties() {
    return {
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      rotation: {
        type: Number
      },
      disableLowLatency: {
        type: Boolean
      }
    };
  }

  constructor() {
    super(); // Initialize properties

    this.width = 300; // <canvas> default

    this.height = 150; // <canvas> default

    this.rotation = window.screen.orientation.angle;
    this.disableLowLatency = false; // Observe resizes

    this.resizeObserver = new ResizeObserver(() => {
      // Only resize if still visible in the DOM
      if (this.offsetParent !== null) {
        this.handleResize({
          width: this.clientWidth,
          height: this.clientHeight
        });
      }
    });
    this.resizeObserver.observe(this); // Observe orientation changes

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
    var transform = getTransform(_objectSpread2({}, elDims, {
      rotation,
      disableLowLatency
    }));
    var style = "width: ".concat(canvasStyleDims.width, "px; height: ").concat(canvasStyleDims.height, "px; ").concat(transform);
    return html(_templateObject(), canvasDims.width, canvasDims.height, style);
  }

  handleResize(_ref4) {
    var _this = this;

    return _asyncToGenerator(function* () {
      var {
        width,
        height
      } = _ref4;

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


  getContext(contextId, optionalContextAttributes) {
    var contextAttributes = optionalContextAttributes || {}; // Check that parameters will allow for low-latency

    if (contextAttributes.desynchronized !== true) {
      throw new Error('getContext(id, attrs) must include {desynchronized: true}');
    }

    var canvas = this.shadowRoot.querySelector('canvas');
    return canvas.getContext(contextId, contextAttributes);
  }

}
customElements.define('stylus-canvas', StylusCanvas);

export default StylusCanvas;
