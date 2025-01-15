/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const svgUrl: string;
  const svgComponent: SvgrComponent;
  export default svgUrl;
  export { svgComponent as ReactComponent };
}

type Obj = Record<PropertyKey, unknown>;

type PartialRecursive<T> = {
  [P in keyof T]?: PartialRecursive<T[P]>;
};
type RequiredRecursive<T> = {
  [P in keyof T]-?: RequiredRecursive<T[P]>;
};
type PartialSample<T, K extends keyof any> = Required<Omit<T, K>> & Partial<Pick<T, K>>;
type RequiredSample<T, K extends keyof any> = Required<Pick<T, K>> & Partial<Omit<T, K>>;

type SetFn<S> = ((prev: S) => S) | S;
