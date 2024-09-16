import { getFirestore, addDoc, collection, getCountFromServer, query, initializeFirestore, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getStorage } from "firebase/storage";
import { app } from "./firebase";
import { v4 as uuidv4 } from 'uuid';

const db = getFirestore(app);
const storage = getStorage(app);
const firestore = initializeFirestore(app, {});

const recieveData = async (blob, label, email) => {
    const uuid = uuidv4();
    await saveStore(uuid, label, email);
    await saveImage(blob, uuid);
}

const saveImage = async (blob, uuid) => {
    const fileName = `${uuid}.png`;
    const storageRef = ref(storage, `images/${fileName}`);
    const result = await uploadBytes(storageRef, blob);
    console.log(result);
}

const saveStore = async (uuid, label, email) => {
    const RefId = await addDoc(collection(db, 'users', email, 'model', 'images', label), {
        fileName: `${uuid}.png`,
    });
    RefId;
}

const countData = async (email, label) => {
    const collections = collection(firestore, 'users', email, 'model', 'images', label);
    
    const count = await getCountFromServer(query(collections));
    console.log(count.data());
    return count.data().count;
}

const getCollectionData = async (email, label) => {
    
    const collections = collection(db, 'users', email, 'model', 'images', label);
    const datas = [];
    
    const query = await getDocs(collections);
    console.log("asd");
    query.forEach((doc) => {
        datas.push(doc.data().fileName);
    })
    return datas;
}

export { recieveData, countData, getCollectionData }
