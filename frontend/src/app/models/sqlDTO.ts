export interface SqlDTO {
    QuestionId: number;
    sql: string;
    databaseName: string;
    UserId: number;
    SaveToDatabase: boolean;
}