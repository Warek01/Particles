declare class ParticlesController<Elem extends HTMLElement> {
    private initialOverflow;
    private intervalId;
    private callback;
    density: Density | null;
    attachedElement: Elem | null;
    transitionDuration: number | null;
    particleSize: number | null;
    angle: number;
    active: boolean | null;
    constructor({ element, type, fallDuration: duration, density, size, hideParentOverflow: overflow, active, angle, }: ControllerSetup<Elem>);
    get type(): ParticlesType;
    set type(type: ParticlesType);
    private get width();
    private get height();
    private get startY();
    private get endY();
    private get startX();
    private get endX();
    private setInterval;
    disable(force?: boolean): Elem;
    enable(): Elem;
    destroy(): Elem;
}
export default function addParticles<Elem extends HTMLElement>({ element, type, fallDuration: duration, density, size, hideParentOverflow, active, angle, }: ControllerSetup<Elem>): ParticlesController<Elem>;
declare type ParticlesType = "rain" | "snow";
declare type Density = "low" | "normal" | "dense" | "storm";
interface ControllerSetup<Elem extends HTMLElement> {
    element: Elem;
    type?: ParticlesType;
    fallDuration?: number;
    density?: Density;
    size?: number;
    hideParentOverflow?: boolean;
    active?: boolean;
    angle?: number;
}
export {};
