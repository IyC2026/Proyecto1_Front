import { useEffect, useState } from "react";
import SuperLineaService from "../services/super-linea-service";
import type { Superlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import Paginacion from "../../../herramientas/reutilizables/paginacion";
import { Card, CardContent, CardHeader } from "../../../ui/Card";
import { useFiltrosContext } from "../../../../context/filtros-contesxt";
import { Alertas, TipoAlerta, TituloAlerta, useAlerts } from "../../../herramientas/alertas/alertas";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";

import { HeaderLg } from "../componentes/header-lg";
import { Header } from "../componentes/header";

import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import { useSuperLineaModal } from "../hooks/use-super-linea-modal";
import { SuperLineaModal } from "../modales/super-linea-modal";
import { DatosTabla } from "../componentes/datos-tabla";
import { DatosCards } from "../componentes/datos-card";
import { getUsuarioId } from "../../../../utils/auth";
import { parseApiError } from "../../../../utils/errores";

const NOMBRE_COMPONENTE = "consultar-super-linea";

export default function ConsultarSuperLinea() {
  const [superlineas, setSuperlineas] = useState<Superlinea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const { alerts, addAlert, removeAlert } = useAlerts();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const modal = useSuperLineaModal();
  const usuarioId = getUsuarioId();

  // PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const [entidadesTotales, setEntidadesTotales] = useState(0);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);

  // FILTROS
  const [filtrosInicializados, setFiltrosInicializados] = useState(false);
  const { filtros, setFiltrosNecesarios, limpiarFiltros, buscar, setBuscar } =
    useFiltrosContext();

  useEffect(() => {
    limpiarFiltros();
    setBuscar({ cont: 0, componente: NOMBRE_COMPONENTE });
    setFiltrosNecesarios({ denominacion: true });
    setFiltrosInicializados(true);
  }, []);

  useEffect(() => {
    if (buscar.cont > 0 && buscar.componente === NOMBRE_COMPONENTE) {
      handleBuscarSuperlineas(true);
    }
  }, [buscar]);

  // CRUD / ACCIONES
  const handleAlta = () => {
    modal.abrirAlta();
  };

  const handleAbrirActualizar = async (id: number) => {
    const item = await SuperLineaService.obtenerId(id);
    modal.abrirEdicion(item);
  };

  const handleMostrarInfo = async (id: number) => {
    const auditoria = await SuperLineaService.obtenerAuditoria(id);
    modal.abrirAuditoria(auditoria);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message: "¿Estás seguro de que quieres eliminar esta SuperLínea?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (!confirmed) return;

    try {
      const response: ResponsePost = await SuperLineaService.eliminar(id, usuarioId);
      setSuperlineas((prev) => prev.filter((m) => m.id !== id));

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: response.mensaje,
        autoClose: true,
      });
    } catch (err) {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message: parseApiError(err) || "No se puede eliminar la SuperLínea porque tiene líneas asociadas.",
        autoClose: true,
      });
    }
  };

  // BÚSQUEDA
  const handleBuscarSuperlineas = async (botonBuscar?: boolean) => {
    if (botonBuscar) {
      setSkip(0);
      setPaginaActual(1);
    }

    setLoading(true);

    const filtrosConPaginacion = {
      denominacion: filtros.denominacion || "",
      skip: botonBuscar ? 0 : skip,
      take,
    };

    try {
      const response = await SuperLineaService.obtener(filtrosConPaginacion);
      setSuperlineas(response.data);
      setEntidadesTotales(response.total);
    } catch (err) {
      console.error("Error al obtener SuperLíneas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperlineas();
    }
  }, [paginaActual, filtrosInicializados]);

  const handleImprimirTodo = async () => {
    const pdfBlob = await SuperLineaService.imprimirTodo();
    const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
    window.open(fileURL, "_blank");
  };

  const handleImprimirPagina = async () => {
    const pdfBlob = await SuperLineaService.imprimirPagina();
    const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
    window.open(fileURL, "_blank");
  };

  const handlePageChange = (newSkip: number, newTake: number, newPaginaActual: number) => {
    setSkip(newSkip);
    setTake(newTake);
    setPaginaActual(newPaginaActual);
  };

  const handleSuccess = async (mensajeAlerta: string) => {
    modal.cerrar();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
    });

    await handleBuscarSuperlineas();
  };

  if (error) {
    return (
      <div className="w-full p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <Card>
        <CardHeader className="flex justify-between">
          <div className="hidden lg:block">
            <Header
              entidadesTotales={entidadesTotales}
              datosLength={superlineas.length}
              paginaActual={paginaActual}
              openModal={handleAlta}
              handleImprimirTodo={handleImprimirTodo}
              handleImprimirPagina={handleImprimirPagina}
            />
          </div>

          <div className="lg:hidden">
            <HeaderLg
              entidadesTotales={entidadesTotales}
              datosLength={superlineas.length}
              paginaActual={paginaActual}
              openModal={handleAlta}
              handleImprimirTodo={handleImprimirTodo}
              handleImprimirPagina={handleImprimirPagina}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
              <p className="text-gray-600 text-lg">Cargando SuperLíneas...</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DatosTabla
                  superlineas={superlineas}
                  onEditar={handleAbrirActualizar}
                  onInfo={handleMostrarInfo}
                  onDelete={handleDelete}
                />
              </div>

              <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                {superlineas.map((item) => (
                  <DatosCards
                    key={item.id}
                    superlinea={item}
                    onEditar={handleAbrirActualizar}
                    onInfo={handleMostrarInfo}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <Paginacion
                paginaActual={paginaActual}
                totalElementos={entidadesTotales}
                take={take}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <SuperLineaModal
        open={modal.tipo !== null}
        tipo={modal.tipo}
        superlinea={modal.superlinea}
        auditoria={modal.auditoria}
        onClose={modal.cerrar}
        onSuccess={handleSuccess}
      />

      <AlertasConfirmacion />
      <Alertas alerts={alerts} onRemove={removeAlert} />
    </div>
  );
}
