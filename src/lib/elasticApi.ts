import axios from "axios";


export async function createNotas(id:string, titulo: string, conteudo: string|undefined, media: string[], color: string, favorite: boolean) {
  console.log(titulo)
	try {
    const response = await axios.post('http://localhost:3000/create', {
      id:id,
      titulo: titulo,
      conteudo: conteudo,
      media: media,
      cor: color,
      favorito: favorite,
    });
    console.log('Documento criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}

export async function getNotas(query:string|undefined) {
  
	try {
    const response = await axios.get(`http://localhost:3000/documents/${query}`);
    return response
    // console.log('Documento criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}

export async function DeleteNotas(postId:string|undefined) {
  
	try {
    const response = await axios.delete(`http://localhost:3000/document/${postId}`);
    return response
    // console.log('Documento criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}