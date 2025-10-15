"use client";

import { BarChart3 } from "lucide-react";

type IconBubbleButtonProps = {
  onClick?: () => void;     // acción al hacer clic
  size?: number;            // tamaño del ícono
  bg?: string;              // clases tailwind para el fondo
  color?: string;           // clases tailwind para el color del ícono
  label?: string;           // texto opcional junto al ícono
  className?: string;       // clases extra
};

export function IconBubbleButton({
  onClick,
  size = 18,
  bg = "bg-blue-50 hover:bg-blue-100",
  color = "text-blue-600",
  label = "Indicadores",
  className = "",
}: IconBubbleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 gap-1 border border-blue-200 shadow-sm transition-colors ${bg} ${className}`}
    >
      <BarChart3 size={size} className={color} />
      {label && <span className="text-xs font-medium text-blue-700">{label}</span>}
    </button>
  );
}