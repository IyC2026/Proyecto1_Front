import { useEffect, useState } from "react";
import { BadgePercent, Calculator, CircleAlert, Save } from "lucide-react";
import LineaService from "../../../linea/services/linea-service";
import { formatPrice } from "../../../../herramientas/formateo-de-campos/fucion-formateo";
import { parseApiError } from "../../../../../utils/errores";
import { Button } from "../../../../ui/Button";
import { useCambioPrecios, type AjusteMasivo } from "../hooks/useCambioPrecios";

type LineaOption = { id: number; denominacion: string };

export default function CambioPreciosMasivo() {
  const [alcance, setAlcance] = useState<"global" | "linea">("global");
  const [lineaId, setLineaId] = useState("");
  const [lineas, setLineas] = useState<LineaOption[]>([]);
  const [tipoAjuste, setTipoAjuste] = useState<"porcentaje" | "montoFijo">("porcentaje");
  const [valorAjuste, setValorAjuste] = useState("0");
  const [errorLineas, setErrorLineas] = useState<string | null>(null);
  const {
    productos,
    loading,
    error,
    ajustePrevisualizado,
    guardado,
    previsualizarCambios,
    guardarCambios,
    limpiarPreview,
  } = useCambioPrecios();

  useEffect(() => {
    let activo = true;

    LineaService.obtener({ denominacion: "", skip: 0, take: 1000 })
      .then((respuesta) => {
        if (activo) setLineas(respuesta?.data ?? []);
      })
      .catch((requestError) => {
        if (activo) setErrorLineas(parseApiError(requestError));
      });

    return () => {
      activo = false;
    };
  }, []);

  const invalidarPreview = () => {
    if (ajustePrevisualizado) limpiarPreview();
  };

  const construirAjuste = (): AjusteMasivo | null => {
    const valor = Number(valorAjuste);
    if (!Number.isFinite(valor)) return null;
    if (alcance === "linea" && !lineaId) return null;

    return {
      alcance,
      ...(alcance === "linea" ? { lineaId: Number(lineaId) } : {}),
      tipoAjuste,
      ...(tipoAjuste === "porcentaje" ? { porcentaje: valor } : { valor }),
    };
  };

  const handlePreview = async () => {
    const ajuste = construirAjuste();
    if (!ajuste) return;
    await previsualizarCambios(ajuste);
  };

  const handleSave = async () => {
    if (!window.confirm(`¿Guardar el nuevo precio de ${productos.length} productos?`)) return;
    try {
      await guardarCambios();
    } catch {
      // The hook exposes the API error in the page.
    }
  };

  const puedePrevisualizar = !loading && Number.isFinite(Number(valorAjuste)) &&
    (alcance === "global" || Boolean(lineaId));
  const puedeGuardar = !loading && !guardado && productos.length > 0 &&
    Boolean(ajustePrevisualizado);

  return (
    <section className="w-full space-y-5 p-4 md:p-6">
      <header className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-slate-700">
        <BadgePercent className="h-7 w-7 text-blue-600" aria-hidden="true" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Cambio masivo de precios</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Calcula y revisa los precios antes de guardarlos.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          Alcance
          <select
            value={alcance}
            onChange={(event) => {
              invalidarPreview();
              setAlcance(event.target.value as "global" | "linea");
            }}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="global">Todo el sistema</option>
            <option value="linea">Una línea</option>
          </select>
        </label>

        {alcance === "linea" && (
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            Línea
            <select
              value={lineaId}
              onChange={(event) => {
                invalidarPreview();
                setLineaId(event.target.value);
              }}
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Selecciona una línea</option>
              {lineas.map((linea) => (
                <option key={linea.id} value={linea.id}>{linea.denominacion}</option>
              ))}
            </select>
            {errorLineas && <span className="text-xs font-normal text-red-600">{errorLineas}</span>}
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          Tipo de ajuste
          <select
            value={tipoAjuste}
            onChange={(event) => {
              invalidarPreview();
              setTipoAjuste(event.target.value as "porcentaje" | "montoFijo");
            }}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            <option value="porcentaje">Porcentaje</option>
            <option value="montoFijo">Monto fijo</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
          {tipoAjuste === "porcentaje" ? "Porcentaje" : "Monto a sumar o restar"}
          <input
            type="number"
            min={tipoAjuste === "porcentaje" ? "-100" : undefined}
            step="0.01"
            value={valorAjuste}
            onChange={(event) => {
              invalidarPreview();
              setValorAjuste(event.target.value);
            }}
            className="h-10 rounded-md border border-gray-300 bg-white px-3 text-right text-gray-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </label>

        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-4">
          <Button onClick={handlePreview} disabled={!puedePrevisualizar}>
            <Calculator className="mr-2 h-4 w-4" />
            Previsualizar lote
          </Button>
          <Button onClick={handleSave} disabled={!puedeGuardar}>
            <Save className="mr-2 h-4 w-4" />
            {guardado ? "Cambios guardados" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-slate-700">
          <h2 className="font-medium text-gray-900 dark:text-white">Productos alcanzados</h2>
          <span className="text-sm text-gray-600 dark:text-gray-300">{productos.length} productos</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-600 dark:text-gray-300">Procesando lote...</div>
        ) : productos.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-600 dark:text-gray-300">
            Configura el alcance y el ajuste, luego previsualiza el lote.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Producto</th>
                  <th className="px-4 py-3 text-right font-medium">Precio actual</th>
                  <th className="px-4 py-3 text-right font-medium">Precio nuevo</th>
                  <th className="px-4 py-3 text-right font-medium">Variación</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-t border-gray-100 text-gray-800 dark:border-slate-800 dark:text-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-medium">{producto.denominacion}</div>
                      <div className="text-xs text-gray-500">ID {producto.id}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatPrice(producto.precioAnterior, "ARS")}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(producto.precioNuevo, "ARS")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(producto.precioNuevo - producto.precioAnterior, "ARS")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
