import { groutMassKg } from './grout';
import type { MeasurementMap } from '@/types/calculator';

export const KITCHEN_JOB_ID = 'kitchen-backsplash';
export const KITCHEN_EPOXY_DENSITY = 1600;
export function kitchenTileDimensions(m: MeasurementMap) {
  return { width: m.tileWidthCm ?? 25, height: m.tileHeightCm ?? 40, depth: m.tileThicknessMm ?? 8, joint: m.groutWidthMm ?? 2 };
}
/** Reviewed upper consumption row for a level wall; combined application and
 * uneven substrates require more. This is the WHITE product's own table.
 * source: https://www.atlas.com.pl/produkt/atlas-plus-bialy/
 */
export function kitchenWhiteAdhesiveRate(width: number, height: number) {
  if (![width,height].every(value=>Number.isFinite(value)&&value>0)) throw Error('invalid_kitchen_tile_dimensions');
  const long = Math.max(width,height), short = Math.min(width,height);
  return long <= 30 || long <= 40 && short <= 25 ? 2.2 : long <= 50 || long <= 60 && short <= 40 ? 2.8 : long <= 60 ? 3.4 : 5.1;
}
export function kitchenWhiteAdhesiveKg(m: MeasurementMap, reserve: number) {
  const {width,height}=kitchenTileDimensions(m),area=m.wallArea;
  if (!Number.isFinite(area)||area<0||!Number.isFinite(reserve)||reserve<=0) throw Error('invalid_kitchen_tile_dimensions');
  return Number((area*kitchenWhiteAdhesiveRate(width,height)*reserve).toFixed(8));
}
/** The manufacturer's geometric formula uses coefficient 1.6 (dimensions in
 * mm), equivalent to 1600 kg/m³. Never borrow cement grout's 1650 density.
 * Defaults describe the listed 25×40×8 mm wall tile and an explicit 2 mm joint.
 * source: https://cdnmedia.mapei.com/docs/librariesprovider22/products-documents/1_kerapoxy-easy-design-technical-datasheet_fc79c10daf51469f8812c506bf9f873f.pdf?sfvrsn=b0cd497e_0
 */
export function kitchenEpoxyGroutKg(m: MeasurementMap, reserve: number) {
  const {width,height,depth,joint}=kitchenTileDimensions(m);
  if (joint<1||joint>15) throw Error('invalid_kitchen_joint');
  return groutMassKg(m.wallArea,width,height,depth,joint,KITCHEN_EPOXY_DENSITY,reserve);
}
export function kitchenSpacerPieces(m: MeasurementMap) {
  const {width,height}=kitchenTileDimensions(m),area=m.wallArea;
  if (![width,height].every(value=>Number.isFinite(value)&&value>0)||!Number.isFinite(area)||area<0) throw Error('invalid_kitchen_tile_dimensions');
  return Math.ceil(area/(width/100*height/100)*2);
}
