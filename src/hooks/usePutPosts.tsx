import { doc, updateDoc } from "firebase/firestore";
import { db } from '../api/firebaseConfig';

export type PostUpdate = {
  title?: string;
  text?: string;
  media?: string[];
  color?: string;
  favorite?: boolean;
  id: string;
}

interface PutResult {
  authenticationPU: (updates: PostUpdate) => Promise<string>;
}

export const usePutPosts = (): PutResult => {

  const authenticationPU = async ( updates: PostUpdate): Promise<string> => {
    try {
      const docRef = doc(db, "posts", updates.id);

      await updateDoc(docRef, updates);

      return "Post updated successfully.";
    } catch (e) {
      if (e instanceof Error) {
        return `Error updating document: ${e.message}`;
      } else {
        return `Error updating document: Unknown error`;
      }
    }
  };

  return { authenticationPU };
};

