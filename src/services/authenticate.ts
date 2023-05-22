import bcrypt from "bcrypt";
import { User } from "../models/User";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";
import { createToken } from "./token";

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
    let email = await User.findOne({ personalEmail: username });

    if (!user && !email) {
        info.message = "User/Email not found!";
        return info;
    }
    let userResult = user ? user : email;
    if (!userResult) {
        info.message = "User/Email not found!";
        return info;
    }
    
    let passwordResult = await bcrypt.compare(password, userResult.password);
    if (!passwordResult) {
        info.message = "Incorrect Password!";
        return info;
    }
    let token = await createToken(128);
    let hashedToken = await bcrypt.hash(token, 8);
    let currentToken = userResult.sessionTokens;
    currentToken.push(hashedToken);
    userResult.sessionTokens = currentToken;
    await userResult.save();
    info.token = token;
    info.success = true;
    info.message = "User logged in!";
    return info;
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

    let token = await createToken(128);
    let hashedToken = await bcrypt.hash(token, 8);
    // create user with a default structure
    let user = new User({
        username: username,
        password: await bcrypt.hash(password, 10),
        personalEmail: personal_email,
        sessionTokens: [hashedToken],
    });

    await user.save();

    info.token = token;
    info.success = true;
    info.message = "User created!";
    return info;
}

export { login, register };
