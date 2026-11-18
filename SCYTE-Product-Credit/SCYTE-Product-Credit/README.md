# SCYTE Product Credit

Reusable footer credit using SCYTE's exact SVG wordmark.

## React / Next.js

1. Copy `ScyteProductCredit.tsx` and `scyte-product-credit.css` into the project.
2. Import and render it immediately above the footer's bottom divider:

```tsx
import { ScyteProductCredit } from "./ScyteProductCredit";

<div className="scyte-product-credit-row">
  <ScyteProductCredit />
</div>
```

If the application does not allow CSS imports inside components, remove the CSS import from the TSX file and import the stylesheet from the application's root layout.

## Plain HTML

1. Copy the markup from `plain-html.html` into the footer.
2. Link or paste `scyte-product-credit.css` into the page.

## Placement

The optional `.scyte-product-credit-row` wrapper aligns the credit to the bottom-right. Put it immediately above the footer divider.

## Brand colour

The component uses SCYTE's original accent `#c2b897`. Override locally if contrast requires it:

```css
.scyte-product-credit {
  --scyte-credit-color: #c2b897;
  --scyte-credit-hover: #e6d5b8;
}
```
