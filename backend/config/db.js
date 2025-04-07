import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://daya:Daya1431@cluster0.eig9a.mongodb.net/meat-app').then(()=>console.log("DB Connected"));

}
