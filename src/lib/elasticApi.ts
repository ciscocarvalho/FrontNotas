import axios from "axios";
import { ELASTIC_SEARCH_URL } from "../constants";

export async function createNotas(id:string, titulo: string, conteudo: string|undefined, media: string[], color: string, favorite: boolean) {
  console.log(titulo)
	try {
    const response = await axios.post(`${ELASTIC_SEARCH_URL}/create`, {
      id:id,
      titulo: titulo,
      conteudo: conteudo,
      media: media,
      cor: color,
      favorito: favorite,
    });
    console.log(response)
    return `Documento criado com sucesso`
  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}

export async function getNotas(query:string|undefined) {
  
	try {
    const response = await axios.get(`${ELASTIC_SEARCH_URL}/documents/${query}`);
    return response

  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}

export async function DeleteNotas(postId:string|undefined) {
  
	try {
    const response = await axios.delete(`${ELASTIC_SEARCH_URL}/document/${postId}`);
    console.log(response)
    return response

  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}

export async function PutNotas(id:string, titulo?: string, conteudo?: string, media?: string[], color?: string, favorite?: boolean) {
  
	try {
    const response = await axios.put(`${ELASTIC_SEARCH_URL}/update/${id}`, {
      id:id,
      titulo: titulo,
      conteudo: conteudo,
      media: media,
      cor: color,
      favorito: favorite,
    });
    return response.data

  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}
