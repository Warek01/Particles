class ParticlesController<Elem extends HTMLElement> {
  private intervalId: any;
  private initialOverflow: string;

  public readonly density: Density;
  public readonly attachedElement: Elem;
  public readonly transitionDuration: number;
  public readonly particleSize: number;

  constructor({
    parentElement: element,
    type: type,
    fallDuration: duration,
    density,
    size,
    hideParentOverflow: overflow,
  }: ControllerSetup<Elem>) {
    if (!(element && type && duration && density && size))
      throw Error("Constructor error");

    this.attachedElement = element!;
    this.transitionDuration = duration!;
    this.density = density!;
    this.particleSize = size!;
    this.initialOverflow = getComputedStyle(this.attachedElement).overflow;

    this.attachedElement.dataset.type = type!;

    if (overflow) this.attachedElement.style.overflow = "hidden";
  }

  get type(): ParticlesType {
    return <ParticlesType>this.attachedElement.dataset.type;
  }

  set type(type: ParticlesType) {
    console.assert(type !== null && type !== this.type);

    this.attachedElement.dataset.type = type;
  }

  get width(): number {
    return this.attachedElement.clientWidth;
  }

  get height(): number {
    return this.attachedElement.clientHeight;
  }

  get startY(): number {
    return -this.particleSize;
  }

  get endY(): number {
    return this.height + this.particleSize;
  }

  get startX(): number {
    return +(Math.random() * this.width);
  }

  get endX(): number {
    return this.startX;
  }

  setInterval(callBack: () => void): void {
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

    this.intervalId = setInterval(callBack, interval);
  }

  disable(force = false): Elem {
    clearInterval(this.intervalId);
    this.intervalId = null;

    this.attachedElement.style.overflow = this.initialOverflow;

    if (force)
      document.querySelectorAll(".particle").forEach((el) => {
        el.remove();
      });

    return this.attachedElement;
  }
}

export function addParticles<Elem extends HTMLElement>({
  parentElement: element,
  type: type = "rain",
  fallDuration: duration = 3000,
  density = "normal",
  size = 5,
  hideParentOverflow = false,
}: ControllerSetup<Elem>): ParticlesController<Elem> {
  const elem = new ParticlesController<Elem>({
    parentElement: element,
    fallDuration: duration,
    type: type,
    density,
    size,
    hideParentOverflow,
  });

  elem.setInterval(
    function (this: ParticlesController<Elem>) {
      const particle = document.createElement("div");
      const x = this.startX;

      particle.ontransitionend = () => particle.remove();
      particle.classList.add("particle", this.type);
      particle.style.cssText = `
        width: ${this.particleSize}px;
        height: ${this.particleSize}px;
        top: ${this.startY}px;
        left: ${x}px;
        transition: all ${this.transitionDuration}ms linear;
      `;

      this.attachedElement.append(particle);

      particle.style.top = this.endY + "px";
      particle.style.left = x + "px";
    }.bind(elem)
  );

  return elem;
}

// ==================================================

const elem = addParticles({
  parentElement: document.querySelector<HTMLDivElement>(".test")!,
  density: "storm",
  type: "snow",
  hideParentOverflow: true,
});

// setTimeout(() => {
//   elem.type = "rain";

//   setTimeout(() => {
//     elem.disable();
//   }, 2000);
// }, 2000);

// ==================================================

type ParticlesType = "rain" | "snow";
type Density = "low" | "normal" | "dense" | "storm";

export interface ControllerSetup<Elem extends HTMLElement> {
  parentElement: Elem;
  type?: ParticlesType;
  fallDuration?: number;
  density?: Density;
  size?: number;
  hideParentOverflow?: boolean;
}
