import bcrypt from "bcrypt";
import { User } from "../models/User";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";

function createID(length: number): string {
    let result = "";
    let pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++)
        result += pool.charAt(Math.floor(Math.random() * pool.length));
    return result;
}

// TODO: VALIDATE DATA!!!!!!!!!!!!!!!!!!!
async function login(username: string, password: string) {
    let info = {
        token: "",
        message: "",
        success: false,
    };

    if (!checkHTML(username) || !checkMongoDB(username)) {
        info.message = "Invalid username!";
        return info;
    }

    if (!checkHTML(password) || !checkMongoDB(password)) {
        info.message = "Invalid password!";
        return info;
    }

    let user = await User.findOne({ username: username });
    if (!user) {
        info.message = "User not found!";
        return info;
    }
    if (await bcrypt.compare(password, user.password)) {
        let token = createID(64);
        let currentToken = user.sessionTokens;
        currentToken.push(token);
        user.sessionTokens = currentToken;
        await user.save();
        info.token = token;
        info.success = true;
        info.message = "User logged in!";
        return info;
    }
}

// TODO: Create a user and return a token
async function register(
    username: string,
    password: string,
    personal_email: string
) {
    let info = {
        token: "",
        message: "",
        success: false,
    };

    if (!checkHTML(username) || !checkMongoDB(username)) {
        info.message = "Invalid username!";
        return info;
    }

    if (!checkHTML(password) || !checkMongoDB(password)) {
        info.message = "Invalid password!";
        return info;
    }
    if (!checkHTML(personal_email) || !checkMongoDB(personal_email)) {
        info.message = "Invalid personal e-mail!";
        return info;
    }

    let alrUsername = await User.findOne({ username: username });
    let alrPersonalEmail = await User.findOne({
        personalEmail: personal_email,
    });
    if (alrUsername || alrPersonalEmail) {
        info.message = "Username or personal email already exists!";
        return info;
    }

    const token = createID(64);
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
