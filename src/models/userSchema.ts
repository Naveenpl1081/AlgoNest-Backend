
import mongoose,{Schema} from "mongoose";
import { IUser } from "../interfaces/models/Iuser"

const userSchema:Schema<IUser>=new Schema({
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
    status:{
        type:String,
        enum:["Active","InActive"]
    }
},{ timestamps : true }
);

const User=mongoose.model<IUser>("User",userSchema)
export default User