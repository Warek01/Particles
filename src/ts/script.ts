let styleIsAdded: boolean = false;
const knownTypes: ParticlesType[] = ["rain", "snow"];
const knownDensities: Density[] = ["low", "normal", "storm", "dense"];

class ParticlesController<Elem extends HTMLElement> {
  private initialOverflow!: string;
  private intervalId!: any;
  private container: HTMLDivElement;

  public density: Density;
  public attachedElement: Elem;
  public transitionDuration: number;
  public particleSize: number;
  public angle: number;
  public active: boolean;
  public type: ParticlesType;

  constructor({
    element,
    type,
    fallDuration: duration,
    density,
    size,
    hideParentOverflow: overflow,
    active,
    angle,
  }: ControllerSetup<Elem>) {
    this.attachedElement = element!;
    this.transitionDuration = duration!;
    this.particleSize = size!;
    this.initialOverflow = getComputedStyle(this.attachedElement).overflow;
    this.angle = angle!;

    let _density = density!,
      _active = active!,
      _type = type!;
    Object.defineProperties(this, {
      density: {
        enumerable: true,
        configurable: false,

        get(): Density {
          return _density;
        },

        set: (value: Density) => {
          if (knownDensities.indexOf(value) < 0)
            throw `Unknown density: ${value}`;

          _density = value;
          if (this.active) this.setInterval();
        },
      },

      active: {
        enumerable: true,
        configurable: false,

        get(): boolean {
          return _active;
        },

        set: (value: boolean) => {
          if (value && !_active) {
            this.setInterval();
          } else if (!value && _active) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
          _active = value;
        },
      },

      type: {
        enumerable: true,
        configurable: false,

        get(): ParticlesType {
          return _type;
        },

        set: (value: ParticlesType) => {
          if (knownTypes.indexOf(value) < 0)
            throw Error(`Unkown type: ${value}`);

          this.attachedElement!.dataset._type = value;
          _type = value;
        },
      },
    });

    this.container = document.createElement("div");
    this.container.className = "particle-container";
    this.container.innerHTML =
      "<!-- Container element for generated particles -->";

    this.attachedElement.dataset._type = type!;
    this.attachedElement.append(this.container);

    if (!active) this.disable();
    else this.setInterval();

    if (overflow) this.attachedElement.style.overflow = "hidden";
  }

  private setInterval(): void {
    if (this.angle < -89 || this.angle > 89)
      throw new Error(`Angle ${this.angle} not supported`);

    let interval = 50;

    switch (this.density) {
      case "low":
        interval = 100;
        break;
      case "normal":
        break;
      case "dense":
        interval = 30;
        break;
      case "storm":
        interval = 5;
        break;
    }

    const node = document.createElement("div");
    node.classList.add("particle", this.type);

    const trimmed = Utils.trimDegrees(this.angle);
    const alpha = Utils.degToRad(trimmed);

    const generate = () => {
      const particle = <HTMLDivElement>node.cloneNode(true);
      this.container.append(particle);

      let range = Utils.size(this.container).height * Math.tan(alpha),
        offset = Math.abs(range),
        startX = Utils.rand(-offset, Utils.size(this.container).width),
        endX = range + startX,
        startY = -this.particleSize,
        endY = Utils.size(this.container).height + this.particleSize;

      particle.style.cssText = `
        width: ${this.particleSize}px;
        height: ${this.particleSize}px;
        top: ${startY}px;
        left: ${startX}px;
        transition: all ${this.transitionDuration}ms linear;
        `;

      setTimeout(() => {
        particle.style.top = endY + "px";
        particle.style.left = endX + "px";
      });

      particle.ontransitionend = () => this.active && particle.remove();

      setTimeout(() => {
        if (this.active && particle) particle.remove();
      }, this.transitionDuration);
    };

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(generate, interval);
  }

  public disable(force = false): Elem {
    if (!this.active) return this.attachedElement!;

    this.active = false;
    clearInterval(this.intervalId);
    this.intervalId = null;

    if (force) {
      document.querySelectorAll(".particle").forEach((el) => {
        el.remove();
      });
    }

    return this.attachedElement!;
  }

  public enable(): Elem {
    if (this.active) this.attachedElement;

    this.active = true;
    this.setInterval();

    return this.attachedElement!;
  }

  public destroy(): Elem {
    this.disable(true);
    delete this.attachedElement.dataset._type;

    return this.attachedElement;
  }

  public pause() {
    this.disable();
    
    this.container
      .querySelectorAll<HTMLDivElement>(".particle")
      .forEach((element) => {
        const { top, left } = getComputedStyle(element);

        element.style.top = top;
        element.style.left = left;
      });
  }
}

export default function addParticles<Elem extends HTMLElement>({
  element,
  type = "rain",
  fallDuration: duration = 3000,
  density = "normal",
  size = 5,
  hideParentOverflow = false,
  active = true,
  angle = 0,
}: ControllerSetup<Elem>): ParticlesController<Elem> {
  if (!styleIsAdded) {
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode(
        `
        /*_GENERATED_BY_SCRIPT_*/
        .particle-container { position: relative; display: block; z-index: 0; height: 100%; width: 100%; }
        .particle { position: absolute; display: block; }
        .particle.rain { background-color: #3498db; }
        .particle.snow { background-color: #dff9fb; }
    `.replace(/\s/giu, "")
      )
    );
    document.body.append(style);
  }

  return new ParticlesController<Elem>({
    element,
    fallDuration: duration,
    type: type,
    density,
    size,
    hideParentOverflow,
    active,
    angle,
  });
}

namespace Utils {
  /** Returs given value in radians */
  export function degToRad(num: number) {
    return num * (Math.PI / 180);
  }

  interface Size {
    width: number;
    height: number;
  }
  function getElementSize<T extends HTMLElement>(elem: T): Size {
    return {
      width: elem.clientWidth,
      height: elem.clientHeight,
    };
  }

  export const size = getElementSize;

  export function randX<T extends HTMLElement>(elem: T, offset = 0): number {
    return Math.ceil(Math.random() * getElementSize(elem).width) + offset;
  }

  export function randY<T extends HTMLElement>(elem: T, offset = 0): number {
    return Math.ceil(Math.random() * getElementSize(elem).height) + offset;
  }

  export function rand(min: number, max: number): number {
    return Math.ceil(Math.random() * (max - min) + min);
  }

  export function trimDegrees(alpha: number): number {
    // true for +, false for -
    const sign = alpha >= 0;
    alpha = Math.abs(alpha);

    while (alpha - 360 > 0) alpha -= 360;
    if (!sign) alpha = 360 - alpha;

    return alpha;
  }

  export function angleCuadran(alpha: number): number {
    if (alpha >= 0 && alpha < 90) return 1;
    else if (alpha >= 90 && alpha < 180) return 2;
    else if (alpha >= 180 && alpha < 270) return 3;
    else if (alpha >= 270 && alpha < 360) return 4;
    else return 0;
  }
}

type ParticlesType = "rain" | "snow";
type Density = "low" | "normal" | "dense" | "storm";

interface ControllerSetup<Elem extends HTMLElement> {
  /** Element which particles will be applied on */
  element: Elem;
  /** Type of particles */
  type?: ParticlesType;
  /** Particle fall duration (ms)
   * @default 3000
   */
  fallDuration?: number;
  /** Particle generation density
   * @default "normal"
   */
  density?: Density;
  /** Particle size (px)
   * @default 5
   */
  size?: number;
  /** Set parent element's css "overflow: hidden"
   * @default false
   */
  hideParentOverflow?: boolean;
  /** If particle generation is active
   * @default true
   */
  active?: boolean;
  /** Particles fall angle
   * @default 0
   */
  angle?: number;
}
