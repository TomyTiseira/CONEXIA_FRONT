'use client';

import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
  ChevronDown,
  UserCheck,
  Briefcase,
  FolderKanban,
  Eye,
  MessageCircle,
  Heart,
  Star,
  BarChart2,
  Rocket,
  BadgeCheck,
} from 'lucide-react';

export default function PlanCard({ plan, onEdit, onDelete, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const formatPrice = (price) => {
    const amount = Number.parseFloat(price ?? 0);
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `ARS ${amount.toFixed(2)}`;
    }
  };

  const capitalize = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Traducciones y formateo de beneficios
  const BENEFIT_LABELS = {
    public_profile: 'Perfil público',
    publish_services: 'Publicar servicios',
    publish_projects: 'Publicar proyectos',
    search_visibility: 'Visibilidad en búsquedas',
    internal_chat: 'Chat interno',
    community_reactions: 'Reacciones de la comunidad',
    highlight_services: 'Destacar servicios',
    metrics_access: 'Acceso a métricas',
    early_access: 'Acceso anticipado',
    verified_reviews: 'Reseñas verificadas',
  };

  const mapEnumValue = (key, value) => {
    if (value === undefined || value === null) return '';
    // Normaliza valores con guiones bajos y aplica tildes comunes
    const normalize = (v) => {
      const base = String(v).toLowerCase().replace(/_/g, ' ');
      const fixes = {
        basicas: 'Básicas',
        básicas: 'Básicas',
        estandar: 'Estándar',
        estándar: 'Estándar',
        avanzada: 'Avanzada',
        avanzadas: 'Avanzadas',
        maxima: 'máxima',
        mínima: 'mínima',
        minima: 'mínima',
        media: 'media',
        prioridad: 'Prioridad',
      };
      return base
        .split(' ')
        .map((w) => fixes[w] || w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    };
    const v = normalize(value);
    return v;
  };

  const renderBenefit = (benefit) => {
    const key = benefit.key;
    const label = BENEFIT_LABELS[key] || capitalize(key.replace(/_/g, ' '));
    let valueDisplay = '';
    if (typeof benefit.value === 'boolean') {
      valueDisplay = benefit.value ? '✓' : '✗';
    } else if (typeof benefit.value === 'number') {
      valueDisplay = String(benefit.value);
    } else if (typeof benefit.value === 'string') {
      valueDisplay = mapEnumValue(key, benefit.value);
    }
    return { label, valueDisplay };
  };

  // removed old getBenefitValue; using renderBenefit instead

  // iconos por beneficio
  const ICONS = {
    public_profile: UserCheck,
    publish_services: Briefcase,
    publish_projects: FolderKanban,
    search_visibility: Eye,
    internal_chat: MessageCircle,
    community_reactions: Heart,
    highlight_services: Star,
    metrics_access: BarChart2,
    early_access: Rocket,
    verified_reviews: BadgeCheck,
  };

  const capitalizeFull = (s) => {
    if (!s) return '';
    const base = String(s).toLowerCase().replace(/_/g, ' ');
    const fixes = {
      basicas: 'Básicas',
      básicas: 'Básicas',
      estandar: 'Estándar',
      estándar: 'Estándar',
      avanzadas: 'Avanzadas',
      maxima: 'máxima',
      mínima: 'mínima',
      minima: 'mínima',
      prioridad: 'Prioridad',
    };
    return base
      .split(' ')
      .map((w) => fixes[w] || w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const pluralize = (word, count) => {
    if (count === 1) return word;
    // Reglas simples para palabras usadas aquí
    if (word === 'Publicación') return 'Publicaciones';
    if (word === 'Servicio destacado') return 'Servicios destacados';
    return `${word}s`;
  };

  const benefitPhrase = (b) => {
    const v = b.value;
    switch (b.key) {
      case 'public_profile':
        return 'Perfil público';
      case 'publish_services':
        return `${v} ${pluralize('Publicación', v)} de servicios`;
      case 'publish_projects':
        return `${v} ${pluralize('Publicación', v)} de proyectos`;
      case 'search_visibility':
        return `Visibilidad en búsquedas: ${capitalizeFull(v)}`;
      case 'internal_chat':
        return 'Chat interno';
      case 'community_reactions':
        return 'Reacciones de la comunidad';
      case 'highlight_services':
        return `${v} ${pluralize('Servicio destacado', v)}`;
      case 'metrics_access':
        return `Acceso a métricas: ${capitalizeFull(v)}`;
      case 'early_access':
        return 'Acceso anticipado';
      case 'verified_reviews':
        return 'Reseñas verificadas';
      default:
        return renderBenefit(b).label; // fallback a etiqueta legible
    }
  };

  // Render con énfasis en las diferencias: resalta valores/números en verde petróleo y negrita
  const benefitContent = (b) => {
    const v = b.value;
    const Strong = ({ children }) => (
      <span className="font-semibold text-conexia-green">{children}</span>
    );
    switch (b.key) {
      case 'publish_services': {
        return (
          <>
            <Strong>{v}</Strong> {pluralize('Publicación', v)} de servicios
          </>
        );
      }
      case 'publish_projects': {
        return (
          <>
            <Strong>{v}</Strong> {pluralize('Publicación', v)} de proyectos
          </>
        );
      }
      case 'highlight_services': {
        return (
          <>
            <Strong>{v}</Strong> {pluralize('Servicio destacado', v)}
          </>
        );
      }
      case 'search_visibility': {
        return (
          <>
            Visibilidad en búsquedas: <Strong>{capitalizeFull(v)}</Strong>
          </>
        );
      }
      case 'metrics_access': {
        return (
          <>
            Acceso a métricas: <Strong>{capitalizeFull(v)}</Strong>
          </>
        );
      }
      // Resto de beneficios: texto simple en español
      case 'public_profile':
        return <>Perfil público</>;
      case 'internal_chat':
        return <>Chat interno</>;
      case 'community_reactions':
        return <>Reacciones de la comunidad</>;
      case 'early_access':
        return <>Acceso anticipado</>;
      case 'verified_reviews':
        return <>Reseñas verificadas</>;
      default:
        return <>{benefitPhrase(b)}</>;
    }
  };

  return (
    <div className={`relative bg-white border-2 rounded-lg p-6 shadow-md transition-all hover:shadow-lg ${
      plan.active ? 'border-conexia-green' : 'border-gray-300 opacity-90'
    }`}>
      {/* Botón de menú en posición absoluta para no empujar el contenido */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Abrir menú de acciones"
        >
          <MoreVertical size={20} className="text-gray-600" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 py-1">
            <button
              onClick={() => {
                onEdit(plan);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-conexia-green"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              onClick={() => {
                onToggleStatus(plan);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-gray-700"
            >
              {plan.active ? <PowerOff size={16} /> : <Power size={16} />}
              {plan.active ? 'Desactivar' : 'Activar'}
            </button>
            <button
              onClick={() => {
                onDelete(plan);
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-50 text-red-600"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Estado primero, luego el título */}
      <div
        className={`text-xs inline-flex px-2 py-1 rounded-full font-medium mb-2 ${
          plan.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'
        }`}
      >
        {plan.active ? 'Activo' : 'Inactivo'}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 break-words mb-2 pr-8">{plan.name}</h3>
      {/* Estado debajo del título para evitar superposición */}

      {plan.description && (
        <p className="text-sm text-gray-700 mb-4">{plan.description}</p>
      )}
      

      {/* Precios */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-conexia-green">{formatPrice(plan.monthlyPrice)}</span>
          <span className="text-sm text-gray-600">ARS / mes</span>
        </div>
        <div className="text-sm text-gray-600">o {formatPrice(plan.annualPrice)} ARS / año</div>
      </div>

      {/* Beneficios */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Beneficios incluidos:</h4>
        <ul className="space-y-2">
          {plan.benefits && plan.benefits.length > 0 ? (
            (expanded ? plan.benefits : plan.benefits.slice(0, 5)).map((benefit, index) => {
              const { label, valueDisplay } = renderBenefit(benefit);
              const Icon = ICONS[benefit.key] || Star;
              const text = benefitPhrase(benefit);
              return (
                <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                  <Icon className="w-4 h-4 text-conexia-green shrink-0" />
                  <span>{benefitContent(benefit)}</span>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-gray-500 italic">Sin beneficios configurados</li>
          )}
          {!expanded && plan.benefits && plan.benefits.length > 5 && (
            <li>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 text-sm text-conexia-green font-medium hover:underline"
              >
                +{plan.benefits.length - 5} beneficios más <ChevronDown size={14} />
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div>Creado: {new Date(plan.createdAt).toLocaleDateString()}</div>
        {plan.updatedAt !== plan.createdAt && (
          <div>Actualizado: {new Date(plan.updatedAt).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}
