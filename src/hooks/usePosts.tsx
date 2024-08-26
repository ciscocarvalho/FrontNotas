import { collection, addDoc } from "firebase/firestore";
import { db } from '../api/firebaseConfig';
import { createNotas } from "../lib/elasticApi";

export type Post = {
  title: string;
  text?: string;
  media: string[];
  color: string;
  favorite: boolean;
}

interface PostResult {
  authenticationP: (post: Post) => Promise<string>;
}

export const usePosts = (): PostResult => {

  const authenticationP = async (post: Post): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        title: post.title,
        text: post.text,
        favorite: post.favorite,
        color: post.color,
        date: new Date().toISOString(),
        media: post.media,
       
      });
      createNotas(
        docRef.id,
        post.title,
        post.text,
        post.media,
        post.color,
        post.favorite)
      return `Post created successfully.`;
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error adding document: ", e.message);
        return `Error adding document: ${e.message}`;
      } else {
        console.error("Unknown error:", e);
        return `Unknown error occurred while adding document.`;
      }
    }
  };

  return { authenticationP };
};
