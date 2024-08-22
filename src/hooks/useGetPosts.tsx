import { collection, getDocs } from "firebase/firestore";
import { db } from '../api/firebaseConfig';

export type postGet = {
  title: string;
  text?: string;
  media: string[];
  color: string;
  favorite: boolean;
  id: string; 
  date: string; 
  currentEditors?: string[];
}

interface GetResult {
  authenticationGP: () => Promise<postGet[]>;
}

export const useGetPosts = (): GetResult => {

  const authenticationGP = async (): Promise<postGet[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      
      const posts: postGet[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,  
        ...doc.data() as Omit<postGet, 'id'> 
      }));

      return posts;
    } catch (e) {
      console.error("Error fetching documents: ", e);
      return [];  
    }
  };

  return { authenticationGP };
};
