import { Package, PlusCircle, Search } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "../../../ui/Button";
import { CardHeader, CardTitle } from "../../../ui/Card";
import { Input } from "../../../ui/Input";
import { EstadisticasSimples } from "../../../herramientas/reutilizables/estadisticas-simples";
import { ImpresionForm } from "../../../herramientas/reutilizables/impresion-form";
import { puedeAgregarProducto } from "../domain/permisos-producto";
import ProductoService from "../services/producto-service";
import SuperLineaService from "../../super-linea/services/super-linea-service";
import Select from "react-select";

interface OpcionDropdown {
  id: number;
  denominacion: string;
}

interface Props {
  roles: number[];
  // Búsqueda rápida
  codigo: string;
  exacto: boolean;
  onChangeCodigo: (value: string) => void;
  onChangeExacto: (value: boolean) => void;
  onBuscarRapido: () => void;
  // Filtros
  denominacion: string;
  onChangeDenominacion: (value: string) => void;
  onBuscar: (lineaId?: number, superLineaId?: number) => void;
  // Común
  onNuevo: () => void;
  total: number;
  mostrados: number;
  paginaActual: number;
  onImprimirTodo: () => void;
  onImprimirPagina: () => void;
}

const selectStyles = {
  control: (base: any) => ({ ...base, color: "black", minWidth: 160 }),
  singleValue: (base: any) => ({ ...base, color: "black" }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? "white" : "black",
    backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#93c5fd" : "white",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

export function ProductosHeader({
  roles,
  codigo,
  exacto,
  onChangeCodigo,
  onChangeExacto,
  onBuscarRapido,
  denominacion,
  onChangeDenominacion,
  onBuscar,
  onNuevo,
  total,
  mostrados,
  paginaActual,
  onImprimirTodo,
  onImprimirPagina,
}: Props) {
  // --- Línea ---
  const [lineaInput, setLineaInput] = useState("");
  const [lineaOpciones, setLineaOpciones] = useState<OpcionDropdown[]>([]);
  const [lineaSeleccionada, setLineaSeleccionada] = useState<OpcionDropdown | null>(null);
  const selectLineaRef = useRef<HTMLDivElement>(null);

  // --- SuperLínea ---
  const [superLineaInput, setSuperLineaInput] = useState("");
  const [superLineaOpciones, setSuperLineaOpciones] = useState<OpcionDropdown[]>([]);
  const [superLineaSeleccionada, setSuperLineaSeleccionada] = useState<OpcionDropdown | null>(null);
  const selectSuperLineaRef = useRef<HTMLDivElement>(null);

  const buscarLineas = async () => {
    try {
      const res = await ProductoService.obtenerTotales({ denominacion: lineaInput }, "lineas");
      setLineaOpciones(res.data ?? []);
      setLineaSeleccionada(null);
    } catch (error) {
      console.error("Error al buscar líneas:", error);
    }
  };

  const buscarSuperLineas = async () => {
    try {
      const res = await SuperLineaService.obtener({ denominacion: superLineaInput, skip: 0, take: 20 });
      setSuperLineaOpciones(res.data ?? []);
      setSuperLineaSeleccionada(null);
    } catch (error) {
      console.error("Error al buscar superlíneas:", error);
    }
  };

  const handleEnterEnSelect = async (e: React.KeyboardEvent<HTMLInputElement>, select: "LINEA" | "SUPERLINEA") => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (select === "LINEA") {
        await buscarLineas();
      }

      if (select === "SUPERLINEA") {
        await buscarSuperLineas();
      }

      setTimeout(() => {
        let selectDiv: HTMLDivElement | null = null;

        if (select === "LINEA") {
          selectDiv = selectLineaRef.current;
        }

        if (select === "SUPERLINEA") {
          selectDiv = selectSuperLineaRef.current;
        }

        if (selectDiv) {
          const input = selectDiv.querySelector("input");
          if (input) {
            input.focus();
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
          }
        }
      }, 100);
    }
  };

  const handleBuscar = () => {
    onBuscar(lineaSeleccionada?.id, superLineaSeleccionada?.id);
  };

  return (
    <CardHeader className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex flex-col md:flex-row flex-wrap gap-4 w-full items-end">

        <CardTitle className="flex items-center gap-2 self-center">
          <Package className="consultar-icon" />
          <span>Productos</span>
        </CardTitle>

        {/* Búsqueda rápida */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Búsqueda rápida
          </span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={codigo}
                placeholder="Código..."
                className="text-black pl-10"
                onChange={(e) => onChangeCodigo(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={exacto}
                onChange={(e) => onChangeExacto(e.target.checked)}
              />
              Exacto
            </label>
          </div>
        </div>

        {/* Divisor */}
        <div className="hidden md:block w-px h-10 bg-gray-300 dark:bg-slate-600 self-end mb-1" />

        {/* Filtros */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Filtros
          </span>
          <div className="flex items-end gap-2 flex-wrap">

            {/* Denominación */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={denominacion}
                placeholder="Denominación..."
                className="text-black pl-10"
                onChange={(e) => onChangeDenominacion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              />
            </div>

            {/* Línea */}
            <div className="flex flex-col gap-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={lineaInput}
                  placeholder="Línea..."
                  className="text-black pl-10"
                  onChange={(e) => setLineaInput(e.target.value)}
                  onKeyDown={(e) => handleEnterEnSelect(e, "LINEA")}
                />
              </div>
              <div ref={selectLineaRef}>
                <Select
                  value={lineaSeleccionada ? { value: lineaSeleccionada.id, label: lineaSeleccionada.denominacion } : null}
                  options={lineaOpciones.map((o) => ({ value: o.id, label: o.denominacion }))}
                  onChange={(opt) =>
                    setLineaSeleccionada(opt ? { id: opt.value, denominacion: opt.label } : null)
                  }
                  placeholder="Seleccione..."
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>
            </div>

            {/* SuperLínea */}
            <div className="flex flex-col gap-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={superLineaInput}
                  placeholder="SuperLínea..."
                  className="text-black pl-10"
                  onChange={(e) => setSuperLineaInput(e.target.value)}
                  onKeyDown={(e) => handleEnterEnSelect(e, "SUPERLINEA")}
                />
              </div>
              <div ref={selectSuperLineaRef}>
                <Select
                  value={superLineaSeleccionada ? { value: superLineaSeleccionada.id, label: superLineaSeleccionada.denominacion } : null}
                  options={superLineaOpciones.map((o) => ({ value: o.id, label: o.denominacion }))}
                  onChange={(opt) =>
                    setSuperLineaSeleccionada(opt ? { id: opt.value, denominacion: opt.label } : null)
                  }
                  placeholder="Seleccione..."
                  isClearable
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>
            </div>

            {/* Botón buscar productos */}
            <Button onClick={handleBuscar} className="bg-blue-500 hover:bg-blue-700 text-white mb-0.5">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>

          </div>
        </div>

        <EstadisticasSimples filtrados={total} mostrados={mostrados} />
      </div>

      <div className="flex gap-2">
        <ImpresionForm
          entityName="Productos"
          onImprimirTodo={onImprimirTodo}
          onImprimirPagina={onImprimirPagina}
          totalItems={total}
          currentPage={paginaActual}
        />
        {puedeAgregarProducto(roles) && (
          <Button onClick={onNuevo} className="bg-blue-500 hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
