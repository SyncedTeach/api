import { User } from "../models/User";
import { logWrite } from "../utilities/log";
import { checkHTML, checkMongoDB } from "../utilities/sanitize";
const RANKS = {
    superAdministrator: "isSuperAdministrator",
    administrator: "isAdministrator",
    teacher: "isTeacher",
    student: "isStudent",
    parent: "isParent",
};
enum Rank {
    superAdministrator = "superAdministrator",
    administrator = "administrator",
    teacher = "teacher",
    student = "student",
    parent = "parent",
}
async function checkRank(username: string, rank: string | string[]) {
    let result = {
        success: false,
    };
    if (!checkHTML(username) || !checkMongoDB(username)) {
        return result;
    }
    let ranks = await getRanks(username);
    if (ranks.length === 0) {
        return result;
    }
    // case 1: if rank is a string
    if (typeof rank === "string") {
        result.success = ranks.indexOf(rank) > -1;
        return result;
    }
    // case 2: if rank is an array
    for (let currentRank of rank) {
        if (ranks.indexOf(currentRank) > -1) {
            result.success = true;
        }
    }
    return result;
}

async function getRanks(username: string) {
    let result: Array<string> = [];
    if (!checkHTML(username) || !checkMongoDB(username)) {
        return result;
    }
    let user = await User.findOne({ username: username });
    if (!user) {
        return result;
    }
    // TODO: Clean this
    // I can't find a better way -mistertfy64
    let membership = user.membership;
    if (membership.isSuperAdministrator) {
        result.push("superAdministrator");
    }
    if (membership.isAdministrator) {
        result.push("administrator");
    }
    if (membership.isTeacher) {
        result.push("teacher");
    }
    if (membership.isStudent) {
        result.push("student");
    }
    if (membership.isParent) {
        result.push("parent");
    }
    return result;
}

async function safeFindUserByID(id: string) {
    if (!/^[0-9a-f]{24}$/.test(id)) {
        logWrite.warn(`${id} is not a valid ObjectId string.`);
        return null;
    }
    let user = await User.findOne({ _id: id }).select({
        password: 0,
        personalEmail: 0,
        apiKey: 0,
        sessionTokens: 0,
        sessionTokensWithExpiryTime: 0,
    });
    if (!user) {
        return null;
    }
    return user;
}

export { safeFindUserByID, checkRank, RANKS };
