// Retorna o caminho correto da imagem levando em conta o base URL do Vite
// Funciona tanto em desenvolvimento (/lista2/) quanto na build final
export const img = (filename: string) => `${import.meta.env.BASE_URL}IMGS/${filename}`
