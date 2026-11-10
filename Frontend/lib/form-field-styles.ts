/** Apariencia común de los campos de consulta; conserva disabled/readOnly de cada control. */
export const nonEditableFieldStyles =
  "cursor-not-allowed border-border bg-background opacity-50 focus:border-border focus-visible:border-border focus-visible:ring-0";

/** Tamaño común de los controles de una línea, incluso dentro de grillas estrechas. */
export const singleLineFieldStyles = "h-9 min-w-0 w-full rounded-md border-2";

/** El texto del selector se limita en su propio span para reservar espacio al ícono. */
export const formComboboxStyles = `${singleLineFieldStyles} max-w-full justify-between overflow-hidden px-3 py-1 font-normal text-base md:text-sm`;
