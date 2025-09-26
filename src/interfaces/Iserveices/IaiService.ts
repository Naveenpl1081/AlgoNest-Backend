

export interface IAIService{
    explainError(params: {
        code: string;
        errorLog: string;
        problemStatement: string;
      }):Promise<any>
}