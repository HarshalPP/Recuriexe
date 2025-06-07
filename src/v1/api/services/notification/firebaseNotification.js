// firebase.js
import firebaseAdmin from "firebase-admin";
// import serviceAccount from "./notification.service.json"; 

import serviceAccount from "./notification.service.json" with { type: "json" };

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

export default firebaseAdmin;
