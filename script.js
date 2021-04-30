var styleIsAdded = false;
var knownTypes = ["rain", "snow"];
var knownDensities = ["low", "normal", "storm", "dense"];
var ParticlesController = (function () {
    function ParticlesController(_a) {
        var _this = this;
        var element = _a.element, type = _a.type, duration = _a.fallDuration, density = _a.density, size = _a.size, overflow = _a.hideParentOverflow, active = _a.active, angle = _a.angle;
        this.attachedElement = element;
        this.transitionDuration = duration;
        this.particleSize = size;
        this.initialOverflow = getComputedStyle(this.attachedElement).overflow;
        this.angle = angle;
        var _density = density, _active = active, _type = type;
        Object.defineProperties(this, {
            density: {
                enumerable: true,
                configurable: false,
                get: function () {
                    return _density;
                },
                set: function (value) {
                    if (knownDensities.indexOf(value) < 0)
                        throw "Unknown density: " + value;
                    _density = value;
                    if (_this.active)
                        _this.setInterval();
                },
            },
            active: {
                enumerable: true,
                configurable: false,
                get: function () {
                    return _active;
                },
                set: function (value) {
                    if (value && !_active) {
                        _this.setInterval();
                    }
                    else if (!value && _active) {
                        clearInterval(_this.intervalId);
                        _this.intervalId = null;
                    }
                    _active = value;
                },
            },
            type: {
                enumerable: true,
                configurable: false,
                get: function () {
                    return _type;
                },
                set: function (value) {
                    if (knownTypes.indexOf(value) < 0)
                        throw Error("Unkown type: " + value);
                    _this.attachedElement.dataset.type = value;
                    _type = value;
                },
            },
        });
        if (!active)
            this.disable();
        else
            this.setInterval();
        this.attachedElement.dataset.type = type;
        if (overflow)
            this.attachedElement.style.overflow = "hidden";
    }
    ParticlesController.prototype.setInterval = function () {
        var _this = this;
        var interval;
        switch (this.density) {
            case "low":
                interval = 400;
                break;
            case "normal":
                interval = 200;
                break;
            case "dense":
                interval = 120;
                break;
            case "storm":
                interval = 20;
                break;
            default:
                interval = 200;
        }
        var factory = function () {
            var particle = document.createElement("div");
            var range = Utils.size(_this.attachedElement).height *
                Math.tan(Utils.degToRad(_this.angle));
            var offset = Math.abs(range);
            var startX = Math.ceil(Math.random() * Utils.size(_this.attachedElement).width);
            if (_this.angle > 0 && _this.angle < 90) {
                startX = Utils.rand(-offset, Utils.size(_this.attachedElement).width);
            }
            else if (_this.angle < 0 && _this.angle > -90) {
                startX = startX = Utils.rand(0, Utils.size(_this.attachedElement).width + offset);
            }
            var endX = _this.angle ? range + startX : startX;
            particle.ontransitionend = function () { return particle.remove(); };
            particle.classList.add("particle", _this.type);
            particle.style.cssText = "\n        width: " + _this.particleSize + "px;\n        height: " + _this.particleSize + "px;\n        top: -" + _this.particleSize + "px;\n        left: " + startX + "px;\n        transition: all " + _this.transitionDuration + "ms linear;\n      ";
            _this.attachedElement.append(particle);
            particle.style.top =
                Utils.size(_this.attachedElement).height + _this.particleSize + "px";
            particle.style.left = endX + "px";
        };
        if (this.intervalId)
            clearInterval(this.intervalId);
        this.intervalId = setInterval(factory, interval);
    };
    ParticlesController.prototype.disable = function (force) {
        if (force === void 0) { force = false; }
        if (!this.active)
            return this.attachedElement;
        this.active = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.attachedElement.style.overflow = this.initialOverflow;
        if (force)
            document.querySelectorAll(".particle").forEach(function (el) {
                el.remove();
            });
        return this.attachedElement;
    };
    ParticlesController.prototype.enable = function () {
        if (this.active)
            this.attachedElement;
        this.active = true;
        this.setInterval();
        return this.attachedElement;
    };
    return ParticlesController;
}());
export default function addParticles(_a) {
    var element = _a.element, _b = _a.type, type = _b === void 0 ? "rain" : _b, _c = _a.fallDuration, duration = _c === void 0 ? 3000 : _c, _d = _a.density, density = _d === void 0 ? "normal" : _d, _e = _a.size, size = _e === void 0 ? 5 : _e, _f = _a.hideParentOverflow, hideParentOverflow = _f === void 0 ? false : _f, _g = _a.active, active = _g === void 0 ? true : _g, _h = _a.angle, angle = _h === void 0 ? 0 : _h;
    if (!styleIsAdded) {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode("\n        /* Generated by script */\n        .particle { position: absolute; display: block; z-index: -1; }\n        .particle.rain { background-color: #3498db; }\n        .particle.snow { background-color: #dff9fb; }\n    "));
        document.body.append(style);
    }
    return new ParticlesController({
        element: element,
        fallDuration: duration,
        type: type,
        density: density,
        size: size,
        hideParentOverflow: hideParentOverflow,
        active: active,
        angle: angle,
    });
}
var Utils;
(function (Utils) {
    function degToRad(num) {
        return num * (Math.PI / 180);
    }
    Utils.degToRad = degToRad;
    function getElementSize(elem) {
        return {
            width: elem.clientWidth,
            height: elem.clientHeight,
        };
    }
    Utils.size = getElementSize;
    function randX(elem, offset) {
        if (offset === void 0) { offset = 0; }
        return Math.ceil(Math.random() * getElementSize(elem).width) + offset;
    }
    Utils.randX = randX;
    function randY(elem, offset) {
        if (offset === void 0) { offset = 0; }
        return Math.ceil(Math.random() * getElementSize(elem).height) + offset;
    }
    Utils.randY = randY;
    function rand(min, max) {
        return Math.ceil(Math.random() * (max - min) + min);
    }
    Utils.rand = rand;
})(Utils || (Utils = {}));
