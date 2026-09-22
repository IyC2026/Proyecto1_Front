import { FormValues } from "../interfaces/interfaces-validaciones-super-linea";
import { createCrudService } from "../../../../utils/crudFactory";

const baseService = createCrudService<FormValues>("super-linea");

const SuperLineaService = {
  ...baseService,
};

export default SuperLineaService;
