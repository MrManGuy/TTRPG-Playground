import { initializeApp} from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
})

export const auth = getAuth()
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider)

export const db = getFirestore()

export const createUserDocumentFromAuth = async (userAuth, additionalInformation = {}) => {
    if(!userAuth){
        return
    }
    const userDoc = doc(db, 'users', userAuth.uid)
    const userSnapshot = await getDoc(userDoc)
    
    if(!userSnapshot.exists()){
        const { displayName, email } = userAuth;
        const createdAt = new Date();

        try{
            await setDoc(userDoc, {
                displayName,
                email,
                createdAt,
                ...additionalInformation
            })
        }catch (error){
            console.log("Error creating the user", error.message)
        }
    }

    return userDoc
}

export const createAuthUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) return;

    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
    if (!email || !password) return;

    return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {return await signOut(auth)}

export const onAuthStateChangedListener = (callback) => onAuthStateChanged(auth, callback);