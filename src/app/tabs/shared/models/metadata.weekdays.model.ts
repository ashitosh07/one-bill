export class MetadataWeekDays {
    id: number;
    description: string;

    constructor(weekDay) {
        this.id = weekDay.id || '';
        this.description = weekDay.description || '';
    }
}