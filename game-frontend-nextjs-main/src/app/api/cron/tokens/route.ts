import { NextRequest, NextResponse } from "next/server";
import admin, { ServiceAccount } from 'firebase-admin';
import { firebase_admin_config } from "@/shared/utils/firebaseAdmin";


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebase_admin_config as ServiceAccount),
    });
}

const db = admin.firestore();
async function getMostRecentTokenFromFirestore() {
    const tokensRef = db.collection('tokens');
    const recentTokensQuery = await tokensRef.orderBy('created_at', 'desc').limit(1).get();
    
    if (recentTokensQuery.empty) {
        console.log('No tokens found.');
        return null;  // Return null if no tokens are found
    }
    const recentToken = recentTokensQuery.docs[0].data();
    console.log('Most recent token from Firestore:', recentToken);
    
    return recentToken;
}
// Fetch token data from the provided URL
async function fetchTokensFromURL() {
    const response = await fetch('https://tokens.jup.ag/tokens/tradable');
    const tokens = await response.json();
    return tokens;
}
// Convert ISO date string to Firestore Timestamp
function convertToFirestoreTimestamp(isoDateString:string) {
    return admin.firestore.Timestamp.fromDate(new Date(isoDateString));
}
// Insert new token into Firestore
//@ts-ignore
function insertTokenIntoFirestore(token) {
    const { address, created_at, minted_at, ...rest } = token;
    return {
        ...rest,
        address,
        created_at: convertToFirestoreTimestamp(created_at),
        minted_at: minted_at ? convertToFirestoreTimestamp(minted_at) : null,
    }
}
// Main function to compare and insert tokens
async function compareAndInsertTokens() {
    const recentTokenFromFirestore = await getMostRecentTokenFromFirestore();
    
    // Get the most recent created_at date from Firestore (or null if no tokens exist)
    const recentCreatedAt = recentTokenFromFirestore ? recentTokenFromFirestore.created_at.toDate() : null;
    console.log('Most recent created_at date from Firestore:', recentCreatedAt);
   
    // Fetch tokens from the URL
    const tokensFromURL = await fetchTokensFromURL();
    let toInsert = [];
    let a = new Date();
    for (const token of tokensFromURL) {
        // Extract the created_at date from the URL token object
        const tokenCreatedAt = new Date(token['created_at']);
        
        // Check if the token from the URL is newer than the most recent token in Firestore
        if (!recentCreatedAt || tokenCreatedAt > recentCreatedAt) {
            //console.log(`Newer token found: ${token.address}. Inserting into Firestore.`);
            toInsert.push(insertTokenIntoFirestore(token));  // Insert new token into Firestore
        }
        // else {
        //     console.log(`Token ${token.address} is not newer. Skipping.`);
        // }
    }
    const BATCH_SIZE = 500;
    while (toInsert.length > 0) {
        const batch = db.batch();
        const batchItems = toInsert.splice(0, BATCH_SIZE);
        batchItems.forEach((token) => {
                if (token.address) {
                    const tokenRef = db.collection('tokens').doc(token.address);
                    batch.set(tokenRef, token);
                }
        });
        await batch.commit();
        console.log(`Batch of ${batchItems.length} tokens inserted into Firestore.`);
    }
}


export async function GET(
    request: NextRequest,
    context: { params: { period: string } }
  ) {
    // Firestore reference
    // Do whatever you want
    await compareAndInsertTokens();
    return new NextResponse('Tokens updated successfully.', { status: 200 });
  }
  