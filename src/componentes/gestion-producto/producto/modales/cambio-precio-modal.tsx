import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Layers } from "lucide-react";
import { Card, CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import PriceInput from "../../../herramientas/formateo-de-campos/price-input";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import ProductoService from "../services/producto-service";
import { getUsuarioId } from "../../../../utils/auth";
import { parseApiError } from "../../../../utils/errores";

interface Props {
  producto: Producto;
  onClose: () => void;
  onSuccess: (mensaje: string) => void;
}

interface FormValues {
  precioNuevo: number;
  motivo: string;
}

const schema = yup.object().shape({
  precioNuevo: yup
    .number()
    .typeError("El precio debe ser numérico")
    .moreThan(0, "El precio debe ser mayor a 0")
    .required("El precio es obligatorio"),
  motivo: yup.string().trim().required("El motivo es obligatorio"),
});

export function CambioPrecioModal({ producto, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const usuarioId = getUsuarioId();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      precioNuevo: producto.precio || 0,
      motivo: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = methods;

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        precioNuevo: data.precioNuevo,
        motivo: data.motivo,
        usuarioId: usuarioId,
      };
      
      const res = await ProductoService.actualizarPrecio(producto.id, payload);
      onSuccess(res?.mensaje || "Precio actualizado exitosamente");
      onClose();
    } catch (error) {
      setError("root", { type: "manual", message: parseApiError(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="w-full max-w-md bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative mt-20 mb-12">
        <EncabezadoFormularios
          title="Cambiar Precio"
          subtitle={`Producto: ${producto.denominacion}`}
          icon={<Layers className="form-icon" />}
          onClose={onClose}
        />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Precio Anterior</p>
                <p className="text-xl font-bold text-gray-500">${producto.precio}</p>
              </div>
              
              <div>
                <PriceInput
                  name="precioNuevo"
                  label="Nuevo Precio"
                  value={watch("precioNuevo") || 0}
                  onChange={(val) => setValue("precioNuevo", val, { shouldValidate: true })}
                  maxDigits={9}
                />
                {errors.precioNuevo && (
                  <p className="text-red-500 text-sm mt-1">{errors.precioNuevo.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Motivo del cambio</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300 transition-colors"
                  rows={3}
                  placeholder="Ingresa el motivo del cambio..."
                  {...register("motivo")}
                ></textarea>
                {errors.motivo && (
                  <p className="text-red-500 text-sm mt-1">{errors.motivo.message}</p>
                )}
              </div>

              {errors.root && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
                  {errors.root.message}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-2 p-4 bg-gray-50 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} className="btn btn-light">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                {isSubmitting ? "Guardando..." : "Confirmar Cambio"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
