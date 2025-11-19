export interface Settings {
  apiKey: string;
}

export interface SketchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
  sketchUrl?: string;
}

export interface GalleryItem {
  id: string;
  sketchUrl: string;
  timestamp: number;
}

export type RoofMaterial = 'Asphalt Shingles' | 'Clay Tile' | 'Metal Standing Seam';

export const MANDATORY_PROMPT = `
Generate a high-precision architectural line drawing of this roof.

**CRITICAL REQUIREMENT: REALISTIC ROOFING TEXTURE**
1.  **Material Specificity**: The texture MUST look like the actual roofing material.
    - **Asphalt Shingles**: Draw distinct, staggered rectangular units (brick pattern) to mimic individual shingles.
    - **Tile**: Draw repeated semi-circles or rectangular grids.
    - **Metal**: Draw long, continuous vertical standing seams.
2.  **No Abstract Hatching**: Do NOT use generic cross-hatching or random scribbles. Every line must represent a physical edge of a shingle or tile.
3.  **100% Coverage**: The texture must cover the ENTIRE roof surface area. Do not fade out in the middle.
4.  **Perspective Alignment**: All texture lines must align perfectly with the roof slope (parallel to eaves/ridges).

**STRUCTURAL HIERARCHY:**
- **Primary Lines (Bold)**: Use thick, heavy black lines for the roof perimeter, ridges, hips, and valleys.
- **Secondary Lines (Fine)**: Use thinner, delicate lines for the shingles/texture to prevent the drawing from becoming too dark or messy.

**STYLE:**
- Technical Sketch / CAD Wireframe style.
- Black ink on pure white.
- High contrast.
- No greyscale shading, only black lines.
`;