export interface IOTPService{
    generateOTP():Promise<string>;
}