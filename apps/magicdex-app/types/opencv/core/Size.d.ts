/* eslint-disable @typescript-eslint/no-misused-new */
// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword
declare module Size {
  interface Size {
      new(width: number, height: number): Size;
      width: number;
      height: number;
  }
}
export = Size;
