import functions from "firebase-functions";
import admin from "firebase-admin";
import authMethods from "./auth/index.js";
import transactionsMethods from "./transactions/index.js";
import gameMethods from "./game/index.js";
import userMethods from "./user/index.js";
import chartMethods from "./chart/index.js";
//
admin.initializeApp();

export const auth = authMethods;
export const transactions = transactionsMethods;
export const game = gameMethods;
export const user = userMethods;
export const chart = chartMethods;