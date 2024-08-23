import axios from "axios";


export async function createNotas(titulo: string, conteudo: string|undefined, media: string[], color: string, favorite: boolean) {
  console.log(titulo)
	try {
    const response = await axios.post('https://elastic-cloud.onrender.com/create', {
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

export async function getNotas() {
  
	try {
    const response = await axios.get(`https://elastic-cloud.onrender.com/documents/`);
    return response
    // console.log('Documento criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar o documento:', error);
  }
}