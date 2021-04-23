var ParticlesController = (function () {
    function ParticlesController(_a) {
        var element = _a.parentElement, type = _a.type, duration = _a.fallDuration, density = _a.density, size = _a.size, overflow = _a.hideParentOverflow;
        if (!(element && type && duration && density && size))
            throw Error("Constructor error");
        this.attachedElement = element;
        this.transitionDuration = duration;
        this.density = density;
        this.particleSize = size;
        this.initialOverflow = getComputedStyle(this.attachedElement).overflow;
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
    ParticlesController.prototype.setInterval = function (callBack) {
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
        this.intervalId = setInterval(callBack, interval);
    };
    ParticlesController.prototype.disable = function (force) {
        if (force === void 0) { force = false; }
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.attachedElement.style.overflow = this.initialOverflow;
        if (force)
            document.querySelectorAll(".particle").forEach(function (el) {
                el.remove();
            });
        return this.attachedElement;
    };
    return ParticlesController;
}());
export function addParticles(_a) {
    var element = _a.parentElement, _b = _a.type, type = _b === void 0 ? "rain" : _b, _c = _a.fallDuration, duration = _c === void 0 ? 3000 : _c, _d = _a.density, density = _d === void 0 ? "normal" : _d, _e = _a.size, size = _e === void 0 ? 5 : _e, _f = _a.hideParentOverflow, hideParentOverflow = _f === void 0 ? false : _f;
    var elem = new ParticlesController({
        parentElement: element,
        fallDuration: duration,
        type: type,
        density: density,
        size: size,
        hideParentOverflow: hideParentOverflow,
    });
    elem.setInterval(function () {
        var particle = document.createElement("div");
        var x = this.startX;
        particle.ontransitionend = function () { return particle.remove(); };
        particle.classList.add("particle", this.type);
        particle.style.cssText = "\n        width: " + this.particleSize + "px;\n        height: " + this.particleSize + "px;\n        top: " + this.startY + "px;\n        left: " + x + "px;\n        transition: all " + this.transitionDuration + "ms linear;\n      ";
        this.attachedElement.append(particle);
        particle.style.top = this.endY + "px";
        particle.style.left = x + "px";
    }.bind(elem));
    return elem;
}
var elem = addParticles({
    parentElement: document.querySelector(".test"),
    density: "storm",
    type: "snow",
    hideParentOverflow: true,
});
