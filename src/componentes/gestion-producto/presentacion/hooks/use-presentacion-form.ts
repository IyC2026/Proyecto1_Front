import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PresentacionService from "../services/presentacion-service";
import {
  FormValues,
  schema,
  transformData,
} from "../interfaces/interfaces-validaciones-presentacion";
import { Presentacion } from "../../../../interfaces/gestion-producto/presentacion/interfaces-presentacion";
import { parseApiError } from "../../../../utils/errores";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import { getUsuarioId } from "../../../../utils/auth";

export function usePresentacionForm(
  presentacion: Presentacion | undefined,
  onClose: () => void,
  onSuccess: (mensajeAlerta: string) => void
) {
  const usuarioId = getUsuarioId();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: presentacion ? transformData(presentacion) : {},
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;

    try {
      if (presentacion) {
        const payload = {
          denominacion: formData.denominacion,
          observacion: formData.observacion,
          usuarioUpdatedId: usuarioId,
        };

        response = await PresentacionService.actualizar(presentacion.id, payload);
      } else {
        const payload = {
          ...formData,
          usuarioCreatedId: usuarioId,
        };

        response = await PresentacionService.nuevo(payload);
      }

      onClose();
      onSuccess(response.mensaje);
    } catch (error) {
      const errorMessage = parseApiError(error);

      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return {
    methods,
    handleSubmit,
    onSubmit,
    isSubmitting,
    errors,
  };
}
