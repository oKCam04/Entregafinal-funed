import axiosClient from "../axiosClient";

const cursoPersonaService = {
  getByPersona: async (idPersona) => {
    const { data } = await axiosClient.get(`/api/cursosPersonas/${idPersona}`);
    return data;
  },
};

export default cursoPersonaService;

