let styleIsAdded: boolean = false;
const knownTypes: ParticlesType[] = ["rain", "snow"];
const knownDensities: Density[] = ["low", "normal", "storm", "dense"];

class ParticlesController<Elem extends HTMLElement> {
  private initialOverflow!: string;
  private intervalId!: any;

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

          this.attachedElement!.dataset.type = value;
          _type = value;
        },
      },
    });

    if (!active) this.disable();
    else this.setInterval();

    this.attachedElement.dataset.type = type!;

    if (overflow) this.attachedElement.style.overflow = "hidden";
  }

  private setInterval(): void {
    let interval: number;

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

    const factory = () => {
      const particle = document.createElement("div");

      const range =
        Utils.size(this.attachedElement).height *
        Math.tan(Utils.degToRad(this.angle));
      const offset = Math.abs(range);

      let startX = Math.ceil(
        Math.random() * Utils.size(this.attachedElement).width
      );

      if (this.angle > 0 && this.angle < 90) {
        startX = Utils.rand(-offset, Utils.size(this.attachedElement).width);
      } else if (this.angle < 0 && this.angle > -90) {
        startX = startX = Utils.rand(
          0,
          Utils.size(this.attachedElement).width + offset
        );
      }

      const endX = this.angle ? range + startX : startX;

      particle.ontransitionend = () => particle.remove();
      particle.classList.add("particle", this.type);
      particle.style.cssText = `
        width: ${this.particleSize}px;
        height: ${this.particleSize}px;
        top: -${this.particleSize}px;
        left: ${startX}px;
        transition: all ${this.transitionDuration}ms linear;
      `;

      this.attachedElement!.append(particle);

      particle.style.top =
        Utils.size(this.attachedElement).height + this.particleSize + "px";
      particle.style.left = endX + "px";
    };

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(factory, interval);
  }

  public disable(force = false): Elem {
    if (!this.active) return this.attachedElement!;

    this.active = false;
    clearInterval(this.intervalId);
    this.intervalId = null;

    this.attachedElement!.style.overflow = this.initialOverflow!;

    if (force)
      document.querySelectorAll(".particle").forEach((el) => {
        el.remove();
      });

    return this.attachedElement!;
  }

  public enable(): Elem {
    if (this.active) this.attachedElement;

    this.active = true;
    this.setInterval();

    return this.attachedElement!;
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
      document.createTextNode(`
        /* Generated by script */
        .particle { position: absolute; display: block; z-index: -1; }
        .particle.rain { background-color: #3498db; }
        .particle.snow { background-color: #dff9fb; }
    `)
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
