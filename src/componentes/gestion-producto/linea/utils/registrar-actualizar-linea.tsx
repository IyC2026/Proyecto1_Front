import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import { Card } from "../../../ui/Card";
import { FormValues, schema, transformData } from "../interfaces/interfaces-validaciones-linea";
import LineaService from "../services/linea-service";
import SuperLineaService from "../../super-linea/services/super-linea-service";
import { Linea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";
import { Superlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import Select from "react-select";

import { Layers } from "lucide-react";
import { parseApiError } from "../../../../utils/errores";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import CantidadesInput from "../../../herramientas/formateo-de-campos/cantidades-input";
import { getUsuarioId } from "../../../../utils/auth";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";

export default function RegistrarActualizarLineaForm({
  linea,
  onClose,
  onSuccess,
}: {
  linea?: Linea;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  const usuarioId = getUsuarioId();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();
  const [rStockCritico, setStockCritico] = useState(false);
  const [superlineas, setSuperlineas] = useState<Superlinea[]>([]);
  const [selectedSuperLinea, setSelectedSuperLinea] = useState<{ value: number; label: string } | null>(null);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico)) as any,
    defaultValues: linea ? transformData(linea) : {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    setError,
  } = methods;

  const stockMinimo = watch("stockMinimo");
  const utilizaStockMinimo = watch("utilizaStockMinimo");

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
  }, [utilizaStockMinimo, setValue]);

  useEffect(() => {
    setStockCritico(utilizaStockMinimo || false);
  }, [utilizaStockMinimo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await SuperLineaService.obtener({ take: 100 });
        const list: Superlinea[] = res?.data || [];
        setSuperlineas(list);

        if (linea) {
          setValue("denominacion", linea.denominacion || "");
          setValue("observacion", linea.observacion || null);
          setValue("stockMinimo", linea.stockMinimo || 0);
          setValue("utilizaStockMinimo", linea.utilizaStockMinimo || false);

          const supId = linea.superLineaId ?? linea.superlinea?.id;
          if (supId) {
            setValue("superLineaId", supId);
            const found = list.find((s) => s.id === supId);
            if (found) {
              setSelectedSuperLinea({ value: found.id, label: found.denominacion });
            } else if (linea.superLineaNombre || linea.superlinea?.denominacion) {
              setSelectedSuperLinea({
                value: supId,
                label: linea.superLineaNombre || linea.superlinea?.denominacion || "",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };
    fetchData();
  }, [linea]);

  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;
    try {
      if (linea) {
        const payload = { ...formData, usuarioUpdatedId: usuarioId };
        response = await LineaService.actualizar(linea.id, payload);
      } else {
        const payload = { ...formData, usuarioCreatedId: usuarioId };
        response = await LineaService.nuevo(payload);
      }
      onClose();
      onSuccess(response.mensaje);
    } catch (error) {
      setError("root", { type: "manual", message: parseApiError(error) });
    }
  };

  const handleOnClose = async () => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DEFAULT,
      title: TituloAlertaConfirmacion.DEFAULT,
      message: "¿Estás seguro de que quieres cerrar el formulario? NO se guardarán los cambios.",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });
    if (confirmed) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="relative w-full max-w-7xl bg-white mx-auto shadow-lg rounded-lg overflow-hidden mt-10 mb-12">
        <EncabezadoFormularios
          title={linea ? "Actualizar Línea" : "Registrar Línea"}
          subtitle={linea ? "Modifica los detalles de la línea." : "Ingresa los datos de la nueva línea."}
          icon={<Layers className="form-icon" />}
          onClose={handleOnClose}
        />

        <fieldset disabled={linea?.sistema === 1}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 px-6 py-4">
                <div className="lg:col-span-2">
                  <FormInput name="denominacion" label="Denominación" placeholder="Ingresa la denominación" />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">SuperLínea</label>
                  <Select
                    options={superlineas.map((s) => ({ value: s.id, label: s.denominacion }))}
                    value={selectedSuperLinea}
                    onChange={(option) => {
                      setValue("superLineaId", option ? option.value : null);
                      setSelectedSuperLinea(option);
                    }}
                    isClearable
                    placeholder="Seleccionar SuperLínea..."
                    className="text-sm"
                  />
                </div>

                <div className="lg:col-span-2">
                  <FormInput name="observacion" label="Observación" placeholder="Ingresa una observación (opcional)" />
                </div>

                <div className="flex items-end gap-2 lg:col-span-2">
                  <label className="flex items-center pb-2">
                    <input
                      type="checkbox"
                      {...methods.register("utilizaStockMinimo")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  <CantidadesInput
                    name="stockMinimo"
                    label="Stock Crítico"
                    value={stockMinimo || 0}
                    onChange={(value) => setValue("stockMinimo", Number(value))}
                    disabled={!utilizaStockMinimo}
                  />
                </div>
              </CardContent>

              {errors.root?.message && (
                <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>
              )}

              <CardFooter className="flex justify-center">
                <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                  {isSubmitting ? (linea ? "Actualizando..." : "Registrando...") : linea ? "Actualizar" : "Registrar"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </fieldset>
        <AlertasConfirmacion />
      </Card>
    </div>
  );
}
