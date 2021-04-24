class ParticlesController<Elem extends HTMLElement> {
  private initialOverflow!: string | null;
  private intervalId!: any | null;
  private callback!: (() => void) | null;

  public density: Density | null;
  public attachedElement: Elem | null;
  public transitionDuration: number | null;
  public particleSize: number | null;
  public active: boolean | null;

  constructor({
    parentElement: element,
    type,
    fallDuration: duration,
    density,
    size,
    hideParentOverflow: overflow,
    active,
  }: ControllerSetup<Elem>) {
    if (!(element && type && duration && density && size && active && overflow))
      throw Error("Constructor error");

    this.attachedElement = element!;
    this.transitionDuration = duration!;
    this.density = density!;
    this.particleSize = size!;
    this.initialOverflow = getComputedStyle(this.attachedElement).overflow;

    this.active = active;
    if (!active) this.disable();
    else this.setInterval();

    this.attachedElement.dataset.type = type!;

    if (overflow) this.attachedElement.style.overflow = "hidden";
  }

  get type(): ParticlesType {
    return <ParticlesType>this.attachedElement!.dataset.type;
  }

  set type(type: ParticlesType) {
    console.assert(type !== null && type !== this.type);

    this.attachedElement!.dataset.type = type;
  }

  private get width(): number {
    return this.attachedElement!.clientWidth;
  }

  private get height(): number {
    return this.attachedElement!.clientHeight;
  }

  private get startY(): number {
    return -this.particleSize!;
  }

  private get endY(): number {
    return this.height + this.particleSize!;
  }

  private get startX(): number {
    return +(Math.random() * this.width);
  }

  private get endX(): number {
    return this.startX;
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
      if (!this.active) return;

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

      this.attachedElement!.append(particle);

      particle.style.top = this.endY + "px";
      particle.style.left = x + "px";
    };
    this.intervalId = setInterval(factory, interval);
    this.callback = factory;
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

  public destroy(): Elem {
    const elem = this.attachedElement!;
    this.attachedElement!.dataset.type = "";

    this.disable(true);
    this.callback = null;
    this.attachedElement = null;
    this.particleSize = null;
    this.initialOverflow = null;
    this.transitionDuration = null;
    this.active = false;
    this.density = null;

    return elem;
  }
}

export default function addParticles<Elem extends HTMLElement>({
  parentElement: element,
  type: type = "rain",
  fallDuration: duration = 3000,
  density = "normal",
  size = 5,
  hideParentOverflow = false,
  active = true,
}: ControllerSetup<Elem>): ParticlesController<Elem> {
  return new ParticlesController<Elem>({
    parentElement: element,
    fallDuration: duration,
    type: type,
    density,
    size,
    hideParentOverflow,
    active,
  });
}

type ParticlesType = "rain" | "snow";
type Density = "low" | "normal" | "dense" | "storm";

interface ControllerSetup<Elem extends HTMLElement> {
  parentElement: Elem;
  type?: ParticlesType;
  fallDuration?: number;
  density?: Density;
  size?: number;
  hideParentOverflow?: boolean;
  active?: boolean;
}
