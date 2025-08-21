
import mongoose,{Schema} from "mongoose";
import { IRecruiter } from "../interfaces/models/Irecruiter";

const RecruiterSchema:Schema<IRecruiter>=new Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    isVerified: {
        type: Boolean,
      },
    emailVerify:{
        type:Boolean,
    }  ,
    companyName:{
        type:String
    },
    companyType:{
        type:String
    },
    yearEstablished:{
        type:String
    },
    phone:{
        type:Number
    },
    registrationCertificate:{
        type:String
    },
    status:{
        type:String,
        enum:["Active","InActive","pending"]
    }
},{ timestamps : true }
);

const Recruiter=mongoose.model<IRecruiter>("Recruiter",RecruiterSchema)
export default Recruiter