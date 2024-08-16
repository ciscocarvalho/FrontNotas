import { doc, deleteDoc } from "firebase/firestore";
import { db } from '../api/firebaseConfig';

interface DeleteResult {
  authenticationDE: (id: string) => Promise<string>;
}

export const useDeletePosts = (): DeleteResult => {

  const authenticationDE = async (id: string): Promise<string> => {
    try {
      const docRef = doc(db, "posts", id);

      await deleteDoc(docRef);

      return "Post deleted successfully.";
    } catch (error) {
      console.error('Error deleting document:', error);
      
      if (error instanceof Error) {
        return `Error deleting document: ${error.message}`;
      } else {
        return `Unknown error occurred during deletion.`;
      }
    }
  };

  return { authenticationDE };
};

