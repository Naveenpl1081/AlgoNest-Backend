export interface IPasswordHash{
    hash(password:string):Promise<string>
    // verify(hashPassword:string):Promise<Boolean>;
}