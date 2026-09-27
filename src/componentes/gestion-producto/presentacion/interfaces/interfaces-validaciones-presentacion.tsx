import * as yup from "yup";
import { Presentacion } from "../../../../interfaces/gestion-producto/presentacion/interfaces-presentacion";

//===================== schema de validacion ============================================//

export const schema = yup.object().shape({
  denominacion: yup
    .string()
    .trim()
    .required("La denominación es obligatoria.")
    .max(100, "La denominación no puede superar los 100 caracteres."),

  observacion: yup.string().nullable().optional(),
});

export type FormValues = yup.InferType<typeof schema>;

//===================== transform data ============================================//

export const transformData = (presentacion: Presentacion): FormValues => {
  return {
    denominacion: presentacion.denominacion,
    observacion: presentacion.observacion ?? null,
  };
};
