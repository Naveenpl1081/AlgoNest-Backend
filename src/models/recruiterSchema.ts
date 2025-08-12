
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
        default: false
      },
    status:{
        type:String,
        enum:["Active","InActive"]
    }
},{ timestamps : true }
);

const Recruiter=mongoose.model<IRecruiter>("Recruiter",RecruiterSchema)
export default Recruiter