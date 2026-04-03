import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },
    image: { type: String, default: "" },
}, { minimize: false });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
