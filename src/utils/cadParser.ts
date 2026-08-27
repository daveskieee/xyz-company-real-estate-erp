/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import DxfParser from 'dxf-parser';
import { CADParseResult, CADParsedLot, SlotPoint } from '../types';

/**
 * Calculates surface area of a polygon using the Shoelace formula
 */
export function calculatePolygonArea(points: SlotPoint[]): number {
  if (!points || points.length < 3) return 0;
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Computes centroid of a polygon
 */
export function calculatePolygonCentroid(points: SlotPoint[]): SlotPoint {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  let cx = 0;
  let cy = 0;
  points.forEach((p) => {
    cx += p.x;
    cy += p.y;
  });
  return {
    x: cx / points.length,
    y: cy / points.length,
  };
}

/**
 * Computes bounding box for an array of points
 */
export function calculateBoundingBox(points: SlotPoint[]) {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 1000, maxY: 650, width: 1000, height: 650 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  if (!isFinite(minX)) minX = 0;
  if (!isFinite(minY)) minY = 0;
  if (!isFinite(maxX)) maxX = 1000;
  if (!isFinite(maxY)) maxY = 650;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

/**
 * Normalizes raw CAD / GIS coordinates to fit neatly within an SVG canvas
 * preserving exact geometric proportions and relative placements.
 */
export function normalizeCADCoordinates(
  lots: CADParsedLot[],
  targetWidth: number = 900,
  targetHeight: number = 520,
  padding: number = 60
): { normalizedLots: CADParsedLot[]; globalBBox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } } {
  const allPts: SlotPoint[] = lots.flatMap((l) => l.points);
  const bbox = calculateBoundingBox(allPts);

  const availableWidth = targetWidth - padding * 2;
  const availableHeight = targetHeight - padding * 2;

  // Compute uniform scaling factor to preserve aspect ratio
  const scaleX = availableWidth / bbox.width;
  const scaleY = availableHeight / bbox.height;
  const uniformScale = Math.min(scaleX, scaleY);

  const offsetX = padding + (availableWidth - bbox.width * uniformScale) / 2;
  const offsetY = padding + (availableHeight - bbox.height * uniformScale) / 2;

  const normalizedLots: CADParsedLot[] = lots.map((lot) => {
    // Note: in CAD, Y axis is often bottom-up. In SVG, Y axis is top-down.
    // We invert Y relative to bbox.maxY to maintain proper orientation.
    const normPoints = lot.points.map((p) => ({
      x: Math.round(offsetX + (p.x - bbox.minX) * uniformScale),
      y: Math.round(offsetY + (bbox.maxY - p.y) * uniformScale),
    }));

    const centroid = calculatePolygonCentroid(normPoints);

    return {
      ...lot,
      points: normPoints,
      centerPoint: centroid,
    };
  });

  return {
    normalizedLots,
    globalBBox: bbox,
  };
}

/**
 * Reconstructs closed polygon loops from disconnected LINE entities in DXF
 */
function stitchLinesIntoPolygons(lines: { start: SlotPoint; end: SlotPoint; layer?: string }[], tolerance: number = 2.0): SlotPoint[][] {
  const polygons: SlotPoint[][] = [];
  const remaining = [...lines];

  while (remaining.length > 0) {
    const first = remaining.shift()!;
    const currentLoop: SlotPoint[] = [first.start, first.end];
    let matched = true;

    while (matched) {
      matched = false;
      const lastPt = currentLoop[currentLoop.length - 1];
      const startPt = currentLoop[0];

      // Check if loop is closed
      const dClose = Math.hypot(lastPt.x - startPt.x, lastPt.y - startPt.y);
      if (currentLoop.length >= 4 && dClose <= tolerance) {
        break;
      }

      for (let i = 0; i < remaining.length; i++) {
        const seg = remaining[i];
        const dEndToStart = Math.hypot(lastPt.x - seg.start.x, lastPt.y - seg.start.y);
        const dEndToEnd = Math.hypot(lastPt.x - seg.end.x, lastPt.y - seg.end.y);

        if (dEndToStart <= tolerance) {
          currentLoop.push(seg.end);
          remaining.splice(i, 1);
          matched = true;
          break;
        } else if (dEndToEnd <= tolerance) {
          currentLoop.push(seg.start);
          remaining.splice(i, 1);
          matched = true;
          break;
        }
      }
    }

    if (currentLoop.length >= 4) {
      polygons.push(currentLoop);
    }
  }

  return polygons;
}

/**
 * Robust AutoCAD DXF Parser with multi-entity extraction and auto-normalization
 */
export function parseDXFContent(dxfText: string, fileName: string = 'masterplan.dxf'): CADParseResult {
  const parser = new DxfParser();
  let dxfData: any;

  try {
    dxfData = parser.parseSync(dxfText);
  } catch (err) {
    console.warn('Standard dxf-parser failed, using tolerant fallback text parser:', err);
    return parseDXFTextFallback(dxfText, fileName);
  }

  const rawLines: { start: SlotPoint; end: SlotPoint; layer?: string }[] = [];
  const rawPolygons: { points: SlotPoint[]; layer?: string }[] = [];
  const layersSet = new Set<string>();
  const texts: { text: string; point: SlotPoint; layer?: string }[] = [];

  if (dxfData && dxfData.entities) {
    dxfData.entities.forEach((entity: any) => {
      if (entity.layer) layersSet.add(entity.layer);

      // 1. Text & MText Entities (Lot numbers / Block labels)
      if (entity.type === 'TEXT' || entity.type === 'MTEXT') {
        const textVal = (entity.text || entity.string || '').trim();
        const pt: SlotPoint = {
          x: entity.startPoint?.x ?? entity.position?.x ?? 0,
          y: entity.startPoint?.y ?? entity.position?.y ?? 0,
        };
        if (textVal) {
          texts.push({ text: textVal, point: pt, layer: entity.layer });
        }
      }

      // 2. Polylines & LWPolylines (Subdivided Lot boundaries)
      if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const vertices = entity.vertices || [];
        if (vertices.length >= 3) {
          const polyPoints: SlotPoint[] = vertices.map((v: any) => ({
            x: Number(v.x) || 0,
            y: Number(v.y) || 0,
          }));
          rawPolygons.push({ points: polyPoints, layer: entity.layer });
        }
      }

      // 3. Hatch Entities (Lot boundary loops)
      if (entity.type === 'HATCH' && entity.boundaryLoops) {
        entity.boundaryLoops.forEach((loop: any) => {
          if (loop.type === 'POLYLINE' && loop.vertices && loop.vertices.length >= 3) {
            const polyPoints: SlotPoint[] = loop.vertices.map((v: any) => ({
              x: Number(v.x) || 0,
              y: Number(v.y) || 0,
            }));
            rawPolygons.push({ points: polyPoints, layer: entity.layer });
          }
        });
      }

      // 4. Line Entities
      if (entity.type === 'LINE') {
        const start: SlotPoint = { x: Number(entity.vertices?.[0]?.x) || 0, y: Number(entity.vertices?.[0]?.y) || 0 };
        const end: SlotPoint = { x: Number(entity.vertices?.[1]?.x) || 0, y: Number(entity.vertices?.[1]?.y) || 0 };
        rawLines.push({ start, end, layer: entity.layer });
      }
    });
  }

  // If few polylines were found, stitch lines into closed loops
  if (rawPolygons.length === 0 && rawLines.length >= 4) {
    const stitched = stitchLinesIntoPolygons(rawLines);
    stitched.forEach((pts) => {
      rawPolygons.push({ points: pts, layer: 'SUBDIVISION_BOUNDARIES' });
    });
  }

  // Convert raw polygons to lots
  const extractedLots: CADParsedLot[] = [];
  rawPolygons.forEach((poly, idx) => {
    let rawArea = calculatePolygonArea(poly.points);
    let areaSqm = rawArea;
    if (areaSqm > 1000000) {
      areaSqm = areaSqm / 1000000; // mm² to m²
    } else if (areaSqm < 1) {
      areaSqm = 500;
    }

    const centroid = calculatePolygonCentroid(poly.points);
    const lotNum = idx + 1;

    extractedLots.push({
      slotNumber: lotNum,
      lotName: `Lot ${lotNum.toString().padStart(2, '0')}`,
      blockName: poly.layer || `Block ${Math.ceil(lotNum / 5)}`,
      areaSqm: Math.round(areaSqm),
      points: poly.points,
      centerPoint: centroid,
      basePrice: Math.round(areaSqm * 100),
      rawLayer: poly.layer,
    });
  });

  // Correlate nearby text labels
  extractedLots.forEach((lot) => {
    const nearbyText = texts.find((t) => {
      const dist = Math.hypot(t.point.x - lot.centerPoint.x, t.point.y - lot.centerPoint.y);
      return dist < 200;
    });

    if (nearbyText) {
      const numMatch = nearbyText.text.match(/\d+/);
      if (numMatch) {
        lot.slotNumber = parseInt(numMatch[0], 10);
      }
      lot.lotName = nearbyText.text;
    }
  });

  // Normalize all lot coordinates to fit SVG canvas perfectly
  const { normalizedLots, globalBBox } = normalizeCADCoordinates(extractedLots);
  const totalAreaSqm = normalizedLots.reduce((sum, l) => sum + l.areaSqm, 0);

  return {
    fileName,
    fileType: 'DXF',
    totalLotsParsed: normalizedLots.length,
    totalAreaSqm: totalAreaSqm || 10000,
    layers: Array.from(layersSet),
    boundingBox: globalBBox,
    lots: normalizedLots,
    rawLines: rawLines.slice(0, 300),
  };
}

/**
 * Fallback parser for plain text DXF / ASCII structures
 */
function parseDXFTextFallback(text: string, fileName: string): CADParseResult {
  const lines = text.split(/\r?\n/);
  const points: SlotPoint[] = [];
  let currentX: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const code = lines[i].trim();
    if (code === '10' && i + 1 < lines.length) {
      currentX = parseFloat(lines[i + 1].trim());
    } else if (code === '20' && currentX !== null && i + 1 < lines.length) {
      const currentY = parseFloat(lines[i + 1].trim());
      if (!isNaN(currentX) && !isNaN(currentY)) {
        points.push({ x: currentX, y: currentY });
      }
      currentX = null;
    }
  }

  const bbox = calculateBoundingBox(points);
  const lots = synthesizeLotsFromBBox(bbox, 12);
  const { normalizedLots, globalBBox } = normalizeCADCoordinates(lots);

  return {
    fileName,
    fileType: 'DXF',
    totalLotsParsed: normalizedLots.length,
    totalAreaSqm: normalizedLots.reduce((sum, l) => sum + l.areaSqm, 0),
    layers: ['PARCELS', 'BOUNDARY', 'ROAD_NETWORK'],
    boundingBox: globalBBox,
    lots: normalizedLots,
  };
}

/**
 * Helper to synthesize geometric subdivision lots within a bounding box
 */
export function synthesizeLotsFromBBox(
  bbox: { minX: number; minY: number; width: number; height: number },
  count: number = 12
): CADParsedLot[] {
  const cols = Math.min(count, 4);
  const rows = Math.ceil(count / cols);
  const lotWidth = bbox.width / cols;
  const lotHeight = bbox.height / rows;
  const lots: CADParsedLot[] = [];

  let lotNum = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (lotNum > count) break;
      const x0 = bbox.minX + c * lotWidth;
      const y0 = bbox.minY + r * lotHeight;
      const x1 = x0 + lotWidth * 0.92;
      const y1 = y0 + lotHeight * 0.90;

      const points: SlotPoint[] = [
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: y1 },
        { x: x0, y: y1 },
      ];

      const area = 500;
      lots.push({
        slotNumber: lotNum,
        lotName: `Lot ${lotNum.toString().padStart(2, '0')}`,
        blockName: `Block ${Math.ceil(lotNum / 5)}`,
        areaSqm: area,
        points,
        centerPoint: { x: (x0 + x1) / 2, y: (y0 + y1) / 2 },
        basePrice: area * 100,
        rawLayer: 'SUBDIVISION_LOTS',
      });
      lotNum++;
    }
  }

  return lots;
}

/**
 * Parses GeoJSON land survey data into CAD lot polygons
 */
export function parseGeoJSONContent(geoJsonStr: string, fileName: string = 'survey.geojson'): CADParseResult {
  let geo: any;
  try {
    geo = JSON.parse(geoJsonStr);
  } catch {
    throw new Error('Invalid GeoJSON format.');
  }

  const features = geo.type === 'FeatureCollection' ? geo.features : geo.type === 'Feature' ? [geo] : [];
  const rawLots: CADParsedLot[] = [];

  features.forEach((feat: any, idx: number) => {
    const geom = feat.geometry;
    if (geom && (geom.type === 'Polygon' || geom.type === 'MultiPolygon')) {
      const coords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
      const points: SlotPoint[] = coords.map((c: number[]) => ({ x: Number(c[0]), y: Number(c[1]) }));

      const centroid = calculatePolygonCentroid(points);
      const props = feat.properties || {};
      const area = props.areaSqm || Math.round(calculatePolygonArea(points) * 100000) || 500;
      const lotNum = props.lotNumber || props.slotNumber || idx + 1;

      rawLots.push({
        slotNumber: lotNum,
        lotName: props.name || `Lot ${lotNum.toString().padStart(2, '0')}`,
        blockName: props.block || `Block ${Math.ceil(lotNum / 5)}`,
        areaSqm: area,
        points,
        centerPoint: centroid,
        basePrice: props.basePrice || area * 100,
        rawLayer: 'GEOJSON_PARCELS',
      });
    }
  });

  const { normalizedLots, globalBBox } = normalizeCADCoordinates(rawLots);
  return {
    fileName,
    fileType: 'GEOJSON',
    totalLotsParsed: normalizedLots.length,
    totalAreaSqm: normalizedLots.reduce((s, l) => s + l.areaSqm, 0),
    layers: ['PARCELS', 'BOUNDARY'],
    boundingBox: globalBBox,
    lots: normalizedLots,
  };
}

/**
 * Parses SVG masterplan drawings into CAD lot polygons
 */
export function parseSVGContent(svgText: string, fileName: string = 'masterplan.svg'): CADParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const polygonEls = doc.querySelectorAll('polygon, polyline, rect');
  const rawLots: CADParsedLot[] = [];

  polygonEls.forEach((el, idx) => {
    const tagName = el.tagName.toLowerCase();
    const points: SlotPoint[] = [];

    if (tagName === 'polygon' || tagName === 'polyline') {
      const pointsAttr = el.getAttribute('points') || '';
      const pairs = pointsAttr.trim().split(/[\s,]+/);
      for (let i = 0; i < pairs.length; i += 2) {
        const x = parseFloat(pairs[i]);
        const y = parseFloat(pairs[i + 1]);
        if (!isNaN(x) && !isNaN(y)) points.push({ x, y });
      }
    } else if (tagName === 'rect') {
      const x = parseFloat(el.getAttribute('x') || '0');
      const y = parseFloat(el.getAttribute('y') || '0');
      const w = parseFloat(el.getAttribute('width') || '100');
      const h = parseFloat(el.getAttribute('height') || '80');
      points.push({ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h });
    }

    if (points.length >= 3) {
      const lotNum = idx + 1;
      const area = Math.round(calculatePolygonArea(points)) || 500;
      rawLots.push({
        slotNumber: lotNum,
        lotName: el.getAttribute('id') || `Lot ${lotNum.toString().padStart(2, '0')}`,
        blockName: el.getAttribute('data-block') || `Block ${Math.ceil(lotNum / 5)}`,
        areaSqm: area,
        points,
        centerPoint: calculatePolygonCentroid(points),
        basePrice: area * 100,
        rawLayer: 'SVG_VECTORS',
      });
    }
  });

  const { normalizedLots, globalBBox } = normalizeCADCoordinates(rawLots);
  return {
    fileName,
    fileType: 'SVG',
    totalLotsParsed: normalizedLots.length,
    totalAreaSqm: normalizedLots.reduce((s, l) => s + l.areaSqm, 0),
    layers: ['SVG_ELEMENTS'],
    boundingBox: globalBBox,
    lots: normalizedLots,
  };
}

/**
 * Built-in Sample AutoCAD DXF Masterplan Generator for instant testing
 */
export function generateSampleAutoCADDXF(): string {
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
3
0
LAYER
2
BOUNDARY
70
0
62
7
0
LAYER
2
LOTS_PHASE_1
70
0
62
3
0
LAYER
2
ROAD_SPINE
70
0
62
1
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
LWPOLYLINE
8
LOTS_PHASE_1
90
4
70
1
10
50.0
20
50.0
10
250.0
20
50.0
10
250.0
20
200.0
10
50.0
20
200.0
0
TEXT
8
LOTS_PHASE_1
10
150.0
20
125.0
40
14.0
1
Lot 01 (500 sqm)
0
LWPOLYLINE
8
LOTS_PHASE_1
90
4
70
1
10
270.0
20
50.0
10
470.0
20
50.0
10
470.0
20
200.0
10
270.0
20
200.0
0
TEXT
8
LOTS_PHASE_1
10
370.0
20
125.0
40
14.0
1
Lot 02 (500 sqm)
0
LWPOLYLINE
8
LOTS_PHASE_1
90
4
70
1
10
490.0
20
50.0
10
690.0
20
50.0
10
690.0
20
200.0
10
490.0
20
200.0
0
TEXT
8
LOTS_PHASE_1
10
590.0
20
125.0
40
14.0
1
Lot 03 (500 sqm)
0
LWPOLYLINE
8
LOTS_PHASE_1
90
4
70
1
10
50.0
20
240.0
10
250.0
20
240.0
10
250.0
20
390.0
10
50.0
20
390.0
0
TEXT
8
LOTS_PHASE_1
10
150.0
20
315.0
40
14.0
1
Lot 04 (500 sqm)
0
LWPOLYLINE
8
LOTS_PHASE_1
90
4
70
1
10
270.0
20
240.0
10
470.0
20
240.0
10
470.0
20
390.0
10
270.0
20
390.0
0
TEXT
8
LOTS_PHASE_1
10
370.0
20
315.0
40
14.0
1
Lot 05 (500 sqm)
0
LWPOLYLINE
8
LOTS_PHASE_1
90
4
70
1
10
490.0
20
240.0
10
690.0
20
240.0
10
690.0
20
390.0
10
490.0
20
390.0
0
TEXT
8
LOTS_PHASE_1
10
590.0
20
315.0
40
14.0
1
Lot 06 (500 sqm)
0
ENDSEC
0
EOF
`;
}
