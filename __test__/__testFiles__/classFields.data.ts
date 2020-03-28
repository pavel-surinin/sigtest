export class TestMap<V, D = string, A = any> {
    public readonly publicData: Map<string, V> = new Map()
    private readonly data: Map<string, V> = new Map()
    protected protectedData: Map<string, V> = new Map()

    constructor(private fields: string, optional?: Blob) {}
}
