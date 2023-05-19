import bcrypt from "bcrypt";
import { User } from "../models/User";

function makeid(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) 
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   return result;
}

// TODO: VALIDATE DATA!!!!!!!!!!!!!!!!!!!
async function login(username: string, password: string) {
    let user = await User.findOne({ username: username });

    let info = {
        token: "",
        message: "",
        success: false,
    };

    if (!user) {
        info.message = "User not found!";
        return info;
    }
    if(await bcrypt.compare(password, user.password)){
        let token = makeid(64)
        let currentToken = user.sessionTokens
        currentToken.push(token)
        user.sessionTokens = currentToken
        await user.save()
        info.token = token;
        info.success = true;
        info.message = "User logged in!";
        return info;
    }
}

// TODO: Create a user and return a token
async function register(username: string, password: string, personal_email: string) {
    let alrUsername = await User.findOne({ username: username });
    let alrPersonalEmail = await User.findOne({ personalEmail: personal_email });

    let info = {
        token: "",
        message: "",
        success: false,
    };


    if (alrUsername || alrPersonalEmail) {
        info.message = "Username or personal email already exists!";
        return info;
    }

    const token = makeid(64);
    // create user with a default structure
    let user = new User({
        username: username,
        password: await bcrypt.hash(password, 10),
        personalEmail: personal_email,
        token: token,
    });

    await user.save();
    
    info.token = token;
    info.success = true;
    info.message = "User created!";
    return info;
}



export { login, register };
