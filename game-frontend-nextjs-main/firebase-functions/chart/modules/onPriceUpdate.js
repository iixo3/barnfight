import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import {insertPrice} from "../../utils/db.js";
const onPriceUpdate = onDocumentUpdated("master/{account}", async (event) => {
    const master = event.data;
    if (master.after.exists) {
        const data = master.after.data();
        const price = data?.ticket_buy_price || '0.0';
        if (master.before.exists) {
            const beforeData = master.before.data();
            if (beforeData?.ticket_buy_price === price) {
                return;
            }
        }
        const currentDateTime = new Date().toISOString();
        await insertPrice(price, currentDateTime);
    }
});
export default onPriceUpdate;