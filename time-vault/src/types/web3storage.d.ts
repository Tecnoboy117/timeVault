declare module 'web3.storage' {
  export class Web3Storage {
    constructor(options: { token: string })
    
    put(files: File[]): Promise<string>
    
    get(cid: string): Promise<{
      ok: boolean
      status: number
      files(): Promise<File[]>
    } | null>
    
    list(options?: {
      before?: string
      maxResults?: number
      size?: boolean
    }): AsyncIterable<{
      cid: string
      name: string
      created: Date
      size?: number
      pins?: Array<{ status: string; updated: Date }>
      deals?: Array<{
        status: string
        lastChanged: Date
        chainDealID?: number
        datamodelSelector: string
      }>
    }>
  }
}