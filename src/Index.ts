import { Turkie } from "./Bot";
import { Token } from "./Configuration/Configuration";
import Log from "./Utility/Log";

// get some prototype addition
require("./Prototypes/Array.prototype");
require("./Prototypes/String.prototype");

const TurkieBot = new Turkie(Token);
TurkieBot.login();

process.on("uncaughtException", (error) => {
	const l: Log = new Log(error);
	l.logErrorMessage();
});

process.on("unhandledRejection", (error) => {
	const l: Log = new Log(error as Error);
	l.logErrorMessage();
});