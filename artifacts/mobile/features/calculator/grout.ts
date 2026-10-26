/** Geometric consumption; the density belongs to a specific grout, not every
 * cement/epoxy product. Dimensions use the units in the names, then metres.
 * source: https://www.atlas.com.pl/produkt/atlas-fuga-ceramiczna-2/
 */
export function groutMassKg(areaM2: number, widthCm: number, heightCm: number, depthMm: number, jointMm: number, densityKgM3: number, reserve = 1) {
  if (!Number.isFinite(areaM2) || areaM2 < 0 || [widthCm, heightCm, depthMm, jointMm, densityKgM3, reserve].some(value => !Number.isFinite(value) || value <= 0)) throw Error('invalid_grout_geometry');
  const width = widthCm / 100, height = heightCm / 100;
  return Number((((width + height) / (width * height)) * areaM2 * (depthMm / 1000) * (jointMm / 1000) * densityKgM3 * reserve).toFixed(8));
}
