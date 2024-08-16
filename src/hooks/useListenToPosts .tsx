import { collection, onSnapshot } from "firebase/firestore";
import { db } from '../api/firebaseConfig';

export const useListenToPosts = (callback: (posts: any[]) => void) => {

  const startListening = () => {
   
    const postsCollection = collection(db, "posts");

    const unsubscribe = onSnapshot(postsCollection, (snapshot) => {

      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      callback(posts);
    }, (error) => {
      console.error("Error listening to collection: ", error);
    });

    return unsubscribe;
  };

  return { startListening };
};
