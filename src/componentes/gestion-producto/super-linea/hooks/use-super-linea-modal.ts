import { useState } from "react";
import { Superlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import { Auditoria } from "../../../../interfaces/generales/interfaces-generales";

export type SuperLineaModalTipo = "alta" | "edicion" | "auditoria" | null;

export function useSuperLineaModal() {
  const [tipo, setTipo] = useState<SuperLineaModalTipo>(null);
  const [superlinea, setSuperlinea] = useState<Superlinea | null>(null);
  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);

  const abrirAlta = () => {
    setSuperlinea(null);
    setAuditoria(null);
    setTipo("alta");
  };

  const abrirEdicion = (item: Superlinea) => {
    setSuperlinea(item);
    setAuditoria(null);
    setTipo("edicion");
  };

  const abrirAuditoria = (aud: Auditoria) => {
    setAuditoria(aud);
    setSuperlinea(null);
    setTipo("auditoria");
  };

  const cerrar = () => {
    setTipo(null);
    setSuperlinea(null);
    setAuditoria(null);
  };

  return {
    tipo,
    superlinea,
    auditoria,
    abrirAlta,
    abrirEdicion,
    abrirAuditoria,
    cerrar,
  };
}
