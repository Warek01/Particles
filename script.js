var styleIsAdded = false;
var ParticlesController = (function () {
    function ParticlesController(_a) {
        var element = _a.element, type = _a.type, duration = _a.fallDuration, density = _a.density, size = _a.size, overflow = _a.hideParentOverflow, active = _a.active, angle = _a.angle;
        this.attachedElement = element;
        this.transitionDuration = duration;
        this.density = density;
        this.particleSize = size;
        this.initialOverflow = getComputedStyle(this.attachedElement).overflow;
        this.angle = angle;
        this.active = active;
        if (!active)
            this.disable();
        else
            this.setInterval();
        this.attachedElement.dataset.type = type;
        if (overflow)
            this.attachedElement.style.overflow = "hidden";
    }
    Object.defineProperty(ParticlesController.prototype, "type", {
        get: function () {
            return this.attachedElement.dataset.type;
        },
        set: function (type) {
            console.assert(type !== null && type !== this.type);
            this.attachedElement.dataset.type = type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticlesController.prototype, "width", {
        get: function () {
            return this.attachedElement.clientWidth;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticlesController.prototype, "height", {
        get: function () {
            return this.attachedElement.clientHeight;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticlesController.prototype, "startY", {
        get: function () {
            return -this.particleSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticlesController.prototype, "endY", {
        get: function () {
            return this.height + this.particleSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticlesController.prototype, "startX", {
        get: function () {
            return +(Math.random() * this.width);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ParticlesController.prototype, "endX", {
        get: function () {
            return this.startX;
        },
        enumerable: false,
        configurable: true
    });
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
            if (!_this.active)
                return;
            var particle = document.createElement("div");
            var range = _this.height * Math.tan(degToRad(_this.angle));
            var offset = Math.abs(range);
            var startX = Math.ceil(Math.random() * _this.width);
            if (_this.angle > 0 && _this.angle < 90) {
                startX = Math.floor(Math.random() * (_this.width - -offset) + -offset);
            }
            else if (_this.angle < 0 && _this.angle > -90) {
                startX = Math.floor(Math.random() * (_this.width + offset));
            }
            var endX = _this.angle ? range + startX : startX;
            particle.ontransitionend = function () { return particle.remove(); };
            particle.classList.add("particle", _this.type);
            particle.style.cssText = "\n        width: " + _this.particleSize + "px;\n        height: " + _this.particleSize + "px;\n        top: " + _this.startY + "px;\n        left: " + startX + "px;\n        transition: all " + _this.transitionDuration + "ms linear;\n      ";
            _this.attachedElement.append(particle);
            particle.style.top = _this.endY + "px";
            particle.style.left = endX + "px";
        };
        this.intervalId = setInterval(factory, interval);
        this.callback = factory;
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
    ParticlesController.prototype.destroy = function () {
        var elem = this.attachedElement;
        this.attachedElement.dataset.type = "";
        this.disable(true);
        this.callback = null;
        this.attachedElement = null;
        this.particleSize = null;
        this.initialOverflow = null;
        this.transitionDuration = null;
        this.active = false;
        this.density = null;
        return elem;
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
function degToRad(num) {
    return num * (Math.PI / 180);
}
