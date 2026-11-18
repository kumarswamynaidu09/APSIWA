import type { CSSProperties } from "react";
import "./scyte-product-credit.css";

export type ScyteProductCreditProps = {
  className?: string;
  href?: string;
  newTab?: boolean;
  style?: CSSProperties;
};

/** Exact SCYTE wordmark credit. Place near the bottom-right of a footer. */
export function ScyteProductCredit({
  className = "",
  href = "https://www.scyte.in/",
  newTab = true,
  style,
}: ScyteProductCreditProps) {
  return (
    <a
      className={`scyte-product-credit ${className}`.trim()}
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label="A SCYTE product — visit SCYTE"
      style={style}
    >
      <span>A</span>
      <svg
        className="scyte-product-credit__logo"
        viewBox="0 -0.264 140 37.264"
        role="img"
        aria-label="SCYTE"
      >
        <path d="M0 0L28 0L28 5L5 5L5 16L29 16L29 37L1 37L1 32L24 32L24 21L0 21ZM32 0L60 0L60 5L37 5L37 32L60 32L60 37L32 37ZM63.533 2.027L67.719 -0.264L74.5 13.189L81.281 -0.264L85.467 2.027L77 18.812L77 36L72 36L72 18.812ZM89 0L116 0L116 5L105 5L105 36L100 36L100 5L89 5ZM120 0L140 0L140 5L125 5L125 16L134.5 16L134.5 21L125 21L125 32L140 32L140 37L120 37Z" />
      </svg>
      <span>PRODUCT ↗</span>
    </a>
  );
}
