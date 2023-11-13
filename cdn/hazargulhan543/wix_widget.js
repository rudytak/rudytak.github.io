const _createClass = (function () {
  function defineProperties(target, props) {
    for (let i = 0; i < props.length; i++) {
      const descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called",
    );
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass,
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

// To debug this code, open wixDefaultCustomElement.js in Developer Tools.

const WixDefaultCustomElement = (function (_HTMLElement) {
  _inherits(WixDefaultCustomElement, _HTMLElement);

  // eslint-disable-next-line no-shadow
  function WixDefaultCustomElement() {
    _classCallCheck(this, WixDefaultCustomElement);

    const _this = _possibleConstructorReturn(
      this,
      (
        WixDefaultCustomElement.__proto__ ||
        Object.getPrototypeOf(WixDefaultCustomElement)
      ).call(this),
    );

    // eslint-disable-next-line no-console
    console.log(DEBUG_TEXT);
    return _this;
  }

  _createClass(WixDefaultCustomElement, [
    {
      key: 'connectedCallback',
      value: function connectedCallback() {
        this.appendChild(main());
      },
    },
  ]);

  return WixDefaultCustomElement;
})(HTMLElement);

const admin_url = "https://rudytak.github.io/cdn/hazargulhan543/admin_panel/index.html";
const widget_url = "https://rudytak.github.io/cdn/hazargulhan543/widget/widget.html";

function  main(){
  let ifr = document.createElement("iframe");
  ifr.src = widget_url;

  this.appendChild(ifr);

  console.log("test");
  this.style = "background: red;"
}

customElements.define('wix-default-custom-element', WixDefaultCustomElement);