import { doc, updateDoc } from "firebase/firestore";
import { db } from '../api/firebaseConfig';
import { PutNotas } from "../lib/elasticApi";

export type PostUpdate = {
  title?: string;
  text?: string;
  media?: string[];
  color?: string;
  favorite?: boolean;
  id: string;
  date?: string;
}

interface PutResult {
  authenticationPU: (updates: PostUpdate) => Promise<string>;
}

export const usePutPosts = (): PutResult => {

  const authenticationPU = async ( updates: PostUpdate): Promise<string> => {
    try {
      const docRef = doc(db, "posts", updates.id);
      const result = await PutNotas(updates.id, updates.title, updates.text, updates.media, updates.color, updates.favorite);
      await updateDoc(docRef, updates);
      
      if (typeof result === "string" && result === "Documento atualizado com sucesso") {
        return "Post updated successfully.";
      } else {
        return "Erro";
      }
      
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

