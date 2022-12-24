export interface CountStat {
    meterType: string
    onlineMeterCount: Number
    offlineMeterCount:Number
}

export interface TotalStackPieChartStat {
    name : string
    y: string
    color: string

}

export interface StackChartData {
    type : string
    name: string
    data: number[]

}