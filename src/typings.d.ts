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

// TODO: rename to PartialRecursive
type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
type RequiredRecursive<T> = {
  [P in keyof T]-?: RequiredRecursive<T[P]>;
};

// type Pick<T, K extends keyof T> = {
//   [P in K]: T[P];
// };
// type Exclude<T, U> = T extends U ? never : T;
// type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
// type TTT = Omit<any, any>

type PartialSample<T, K extends keyof any> = Required<Omit<T, K>> & Partial<Pick<T, K>>;
type RequiredSample<T, K extends keyof any> = Required<Pick<T, K>> & Partial<Omit<T, K>>;
