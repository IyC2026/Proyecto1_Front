import { FormProvider } from "react-hook-form";
import { CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import { Card } from "../../../ui/Card";
import { Superlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";
import { Layers } from "lucide-react";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import { useSuperLineaForm } from "../hooks/use-super-linea-form";

const NOMBRE_ENTIDAD = "SuperLínea";

export default function RegistrarActualizarSuperLineaForm({
  superlinea,
  onClose,
  onSuccess,
}: {
  superlinea?: Superlinea;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  const { methods, handleSubmit, onSubmit, isSubmitting, errors } =
    useSuperLineaForm(superlinea, onClose, onSuccess);

  const isEdit = !!superlinea;
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const handleOnClose = async () => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DEFAULT,
      title: TituloAlertaConfirmacion.DEFAULT,
      message:
        "¿Estás seguro de que quieres cerrar el formulario? NO se guardarán los cambios.",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (confirmed) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Card className="w-full max-w-2xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden transform transition-all duration-300 ease-in-out">
        <EncabezadoFormularios
          title={superlinea ? `Actualizar ${NOMBRE_ENTIDAD}` : `Nueva ${NOMBRE_ENTIDAD}`}
          subtitle={
            superlinea
              ? "Modifica los datos de la SuperLínea."
              : "Ingresa los datos para registrar una nueva SuperLínea."
          }
          icon={<Layers className="form-icon" />}
          onClose={handleOnClose}
        />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-3 px-3 py-2">
              <FormInput
                name="denominacion"
                label="Denominación"
                placeholder="Ingresa la denominación (ej: Bebidas, Almacén...)"
                disabled={!!superlinea?.sistema}
              />
              <FormInput
                name="observacion"
                label="Observación"
                placeholder="Ingresa una observación (opcional)"
              />
            </CardContent>

            {errors.root?.message && (
              <div className="text-red-600 text-center mb-4">
                {String(errors.root.message)}
              </div>
            )}

            <CardFooter className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-dark"
              >
                {isSubmitting
                  ? isEdit
                    ? "Actualizando..."
                    : "Registrando..."
                  : isEdit
                  ? "Actualizar"
                  : "Registrar"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
        <AlertasConfirmacion />
      </Card>
    </div>
  );
}
