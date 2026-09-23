import { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import { Card, CardContent } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import ProductoService from "../services/producto-service";
import { formatPrice } from "../../../herramientas/formateo-de-campos/fucion-formateo";

interface Props {
  producto: Producto;
  onClose: () => void;
}

interface HistorialPrecio {
  id: number;
  precioAnterior: number;
  precioNuevo: number;
  motivo: string;
  fecha: string;
  usuarioCreatedId: number;
}

export function HistorialPrecioModal({ producto, onClose }: Props) {
  const [historial, setHistorial] = useState<HistorialPrecio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        setLoading(true);
        const data = await ProductoService.obtenerHistorialPrecios(producto.id);
        setHistorial(data);
      } catch (err) {
        setError("Error al cargar el historial de precios.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [producto.id]);

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="w-full max-w-4xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative mt-10 mb-12">
        <EncabezadoFormularios
          title="Historial de Precios"
          subtitle={`Producto: ${producto.denominacion}`}
          icon={<History className="form-icon" />}
          onClose={onClose}
        />

        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : historial.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No hay historial de cambios de precio para este producto.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Precio Anterior</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Precio Nuevo</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historial.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(item.fecha).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        ${formatPrice(item.precioAnterior)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                        ${formatPrice(item.precioNuevo)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.motivo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
