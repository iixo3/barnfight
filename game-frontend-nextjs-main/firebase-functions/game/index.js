import { onGameCreated, onGameDeleted, onGameUpdated } from "./modules/onGameCreatedOrDeleted.js";
import requestGameStream from "./modules/requestGameStream.js";
import setGameSettings from "./modules/setGameSettings.js";

export default {
    onGameCreated,
    onGameDeleted,
    //rember to remove this in prod
    onGameUpdated,
    requestGameStream,
    setGameSettings
}