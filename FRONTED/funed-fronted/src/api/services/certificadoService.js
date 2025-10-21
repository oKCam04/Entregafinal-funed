import axiosClient from '../axiosClient';

const certificadoService = {
  // Genera y descarga el PDF del certificado para una matrícula aprobada
  generateAndDownload: async (id_curso_matriculado) => {
    const body = { id_curso_matriculado: Number(id_curso_matriculado) };
    const response = await axiosClient.post('/api/certificado/generar', body, {
      responseType: 'blob',
    });
    const blob = response?.data;
    if (!blob) throw new Error('No se recibió el PDF del servidor');
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${id_curso_matriculado}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default certificadoService;