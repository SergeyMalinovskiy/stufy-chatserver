export interface IncomingOrderDTO {
    customer: number,
    for: number,
    discipline: number,
    worktype: number,
    targetCompletionDate: Date,
    garantyCompletionDate: Date,
    price: number,
    currency: string,
}