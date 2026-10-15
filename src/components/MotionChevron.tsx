export function MotionChevron({ flipped, horizontal = false }: { flipped: boolean; horizontal?: boolean }) {
 return <svg aria-hidden="true" viewBox="0 0 24 24" className={`motion-chevron ${horizontal ? 'horizontal' : 'nav-chevron label'} ${flipped ? 'flipped' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round">
  <g className="chevron-joint">
  <line className="chevron-arm first" x1="12" y1="12" x2="3.515" y2="12" />
  <line className="chevron-arm second" x1="12" y1="12" x2="20.485" y2="12" />
  </g>
 </svg>;
}
