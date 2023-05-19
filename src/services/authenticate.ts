import bcrypt from "bcrypt";
import { User } from "../models/User";

// TODO: VALIDATE DATA!!!!!!!!!!!!!!!!!!!
async function authenticate(username: string, password: string) {
    let user = await User.findOne({ username: username });
    if (!user) {
        return false;
    }
    return await bcrypt.compare(password, user.password);
}

export { authenticate };
