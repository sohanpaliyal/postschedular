/** Explicit, tree-shakeable Tailwind compositions. */
export const appInputStyles = [
  '[font:inherit] [-webkit-tap-highlight-color:transparent]',
  '[&:focus]:[outline:none]',
  '[&:focus-visible]:[outline:none]',
  "[&:where([type='url'])]:[width:100%] [&:where([type='url'])]:[border:1px_solid_#e3e3dc] [&:where([type='url'])]:[border-radius:10px] [&:where([type='url'])]:[padding:12px]",
  "[&:where([type='url'])]:[background:#fdfdfb] [&:where([type='url'])]:[color:#555] [&:where([type='url'])]:[font-size:12px]",
  "[&:where([type='datetime-local'])]:[width:100%] [&:where([type='datetime-local'])]:[border:1px_solid_#e3e3dc] [&:where([type='datetime-local'])]:[border-radius:10px]",
  "[&:where([type='datetime-local'])]:[padding:12px] [&:where([type='datetime-local'])]:[background:#fdfdfb] [&:where([type='datetime-local'])]:[color:#555]",
  "[&:where([type='datetime-local'])]:[font-size:12px]",
  "[:root[data-theme='dark']_&:where([type='url'])]:[background:#303a30] [:root[data-theme='dark']_&:where([type='url'])]:[border-color:#4b5942]",
  "[:root[data-theme='dark']_&:where([type='url'])]:[color:#c6d4b8]",
] as const;
export const appTextareaStyles = [
  '[font:inherit] [-webkit-tap-highlight-color:transparent] [width:100%] [border:1px_solid_#e3e3dc] [border-radius:10px] [padding:12px] [background:#fdfdfb]',
  '[color:#555] [font-size:12px] [resize:vertical] [line-height:1.8]',
  '[&:focus]:[outline:none]',
  '[&:focus-visible]:[outline:none]',
  "[:root[data-theme='dark']_&]:[background:#303a30] [:root[data-theme='dark']_&]:[border-color:#4b5942] [:root[data-theme='dark']_&]:[color:#c6d4b8]",
] as const;
export const appSelectStyles = [
  '[font:inherit] [-webkit-tap-highlight-color:transparent] [border:1px_solid_#e5e5e0] [border-radius:8px] [background:white] [padding:8px_10px] [color:#74746c]',
  '[font-size:11px]',
  '[&:focus]:[outline:none]',
  '[&:focus-visible]:[outline:none]',
] as const;
export const appKbdStyles = [
  '[font:inherit] [display:grid] [place-items:center] [min-width:24px] [height:26px] [background:#f6f6f6] [border:1px_solid_#e9e9e9]',
  '[border-bottom:2px_solid_#dedede] [border-radius:7px] [font-size:12px]',
  "[:root[data-theme='dark']_&]:[background:#39423d] [:root[data-theme='dark']_&]:[border-color:#4a544b] [:root[data-theme='dark']_&]:[color:#aab7a8]",
] as const;
export const appH1Styles = [
  '[font-size:39px] [letter-spacing:-1.7px] [font-weight:550] [margin:10px_0]',
  '[&_>_span]:[color:#8b9779]',
  '[@media(max-width:_760px)]:[font-size:32px]',
] as const;
