import { User } from "../models/User";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";

// TODO: Add more overloads
// NOTE: isAdmin is either normal or super admin
async function isAdmin(username: string) {
    let info = {
        message: "",
        success: false,
    };
    if (!checkHTML(username) || !checkMongoDB(username)) {
        info.message = "Invalid username!";
        return info;
    }
    let user = await User.findOne({ username: username });
    if (!user) {
        info.message = "User not found!";
        return info;
    }

    if (
        user.membership.isAdministrator ||
        user.membership.isSuperAdministrator
    ) {
        info.success = true;
    }
    return info;
}

async function isSuperAdmin(username: string) {
    let info = {
        message: "",
        success: false,
    };
    if (!checkHTML(username) || !checkMongoDB(username)) {
        info.message = "Invalid username!";
        return info;
    }
    let user = await User.findOne({ username: username });
    if (!user) {
        info.message = "User not found!";
        return info;
    }

    if (user.membership.isSuperAdministrator) {
        info.success = true;
    }
    return info;
}

export { isSuperAdmin, isAdmin };
