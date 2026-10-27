import admin from "firebase-admin";
import {onCall} from "firebase-functions/v2/https";
import {USER_NAMESPACE, uuid} from "../../utils.js";


const signIn = onCall(async (event) => {
    const address = event.data.address;
    const signature = event.data.signature;
    //todo: check signature / address;
    const uid = uuid(address, USER_NAMESPACE);
    const token = admin.auth().createCustomToken(uid);
    const firestore = admin.firestore();

    await firestore.collection('users').doc(uid).set({
        last_login: admin.firestore.FieldValue.serverTimestamp(),
        username: uid,
        address,
        uid,
    }, {
        merge: true,
        mergeFields: ["last_login"]
    });

    return {
        token
    }
})

export default signIn;