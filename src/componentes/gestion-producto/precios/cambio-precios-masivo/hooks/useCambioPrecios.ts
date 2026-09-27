import { useState } from "react";
import { parseApiError } from "../../../../../utils/errores";
import CambioPreciosMasivoService from "../cambio-precios-masivo-service";

export type AjusteMasivo = {
  alcance: "global" | "linea";
  lineaId?: number;
  tipoAjuste: "porcentaje" | "montoFijo";
  porcentaje?: number;
  valor?: number;
};

export interface CambioPrecioPreview {
  id: number;
  denominacion: string;
  precioAnterior: number;
  precioNuevo: number;
}

export function useCambioPrecios() {
  const [productos, setProductos] = useState<CambioPrecioPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ajustePrevisualizado, setAjustePrevisualizado] = useState<AjusteMasivo | null>(null);
  const [guardado, setGuardado] = useState(false);

  const previsualizarCambios = async (ajuste: AjusteMasivo) => {
    setLoading(true);
    setError(null);
    setGuardado(false);

    try {
      const resultado = await CambioPreciosMasivoService.aplicarCambios(ajuste);
      if (!Array.isArray(resultado)) {
        throw new Error("El servidor devolvió una respuesta de previsualización inválida.");
      }
      setProductos(resultado);
      setAjustePrevisualizado(ajuste);
      return resultado as CambioPrecioPreview[];
    } catch (requestError) {
      setProductos([]);
      setAjustePrevisualizado(null);
      setError(parseApiError(requestError));
      return [];
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    if (!ajustePrevisualizado || productos.length === 0) {
      throw new Error("Primero debes previsualizar un lote válido.");
    }

    setLoading(true);
    setError(null);
    try {
      const respuesta = await CambioPreciosMasivoService.guardarCambios(ajustePrevisualizado);
      setGuardado(true);
      return respuesta as { actualizado: boolean; actualizados: number; mensaje: string };
    } catch (requestError) {
      setError(parseApiError(requestError));
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  const limpiarPreview = () => {
    setProductos([]);
    setAjustePrevisualizado(null);
    setGuardado(false);
    setError(null);
  };

  return {
    productos,
    loading,
    error,
    ajustePrevisualizado,
    guardado,
    previsualizarCambios,
    guardarCambios,
    limpiarPreview,
  };
}
