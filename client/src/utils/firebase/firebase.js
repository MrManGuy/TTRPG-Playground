import { initializeApp} from 'firebase/app'
import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"

import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAuaJuAHAjdedAgZkfROVrshOQsAToDaqA",
  authDomain: "ttrpg-playground.firebaseapp.com",
  projectId: "ttrpg-playground",
  storageBucket: "ttrpg-playground.firebasestorage.app",
  messagingSenderId: "1067150368001",
  appId: "1:1067150368001:web:a3dec41cf9ce55fcdecf00",
  measurementId: "G-L8KRQTZE6V"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAnalytics = getAnalytics(firebaseApp);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: "select_account"
})

export const auth = getAuth()
export const signInWithGooglePopup = () => signInWithPopup(auth, provider)

export const db = getFirestore()

export const creatUserDocumentFromAuth = async (userAuth) => {
    const userDoc = doc(db, 'users', userAuth.uid)
    const userSnapshot = await getDoc(userDoc)
    
    if(!userSnapshot.exists()){
        const { displayName, email } = userAuth;
        const createdAt = new Date();

        try{
            await setDoc(userDoc, {
                displayName,
                email,
                createdAt
            })
        }catch (error){
            console.log("Error creating the user", error.message)
        }
    }

    return userDoc
}
