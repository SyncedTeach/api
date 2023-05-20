const mongoSanitize = require("express-mongo-sanitize");
import { JSDOM } from "jsdom";
import createDOMPurify, { sanitize } from "dompurify";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

function checkHTML(original: string) {
    return sanitizeHTML(original) === original;
}

function sanitizeHTML(original: string) {
    return DOMPurify.sanitize(original);
}

function checkMongoDB(original: string) {
    return sanitizeMongoDB(original) === original;
}

function sanitizeMongoDB(original: string) {
    return mongoSanitize.sanitize(original);
}

export { checkHTML, sanitizeHTML, checkMongoDB, sanitizeMongoDB };
