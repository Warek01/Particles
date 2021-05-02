declare class ParticlesController<Elem extends HTMLElement> {
    private initialOverflow;
    private intervalId;
    density: Density;
    attachedElement: Elem;
    transitionDuration: number;
    particleSize: number;
    angle: number;
    active: boolean;
    type: ParticlesType;
    constructor({ element, type, fallDuration: duration, density, size, hideParentOverflow: overflow, active, angle, }: ControllerSetup<Elem>);
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
