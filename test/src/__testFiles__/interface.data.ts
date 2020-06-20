export interface FunctionHolder {
    readonly arrowFx: () => string
    /**
     * @callback
     */
    arrowFxWithParam: (p: string) => string
    fx(): string
    fxWithParam(p: string): string
}

export interface Basic<T1, T3 extends Function, K extends keyof any, T2 = string> {
    prop1: T1
    blob: Blob
    tBlob: typeof Blob
    opt?: string
}
