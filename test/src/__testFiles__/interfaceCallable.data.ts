export interface ClassInterface {
    new (arrayLength?: number): any[]
    new (): any[]
    <T>(...items: T[]): T[]
    (n: number): number[]
    isArray(arg: any): arg is any[]
}
