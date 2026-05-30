import { NextResponse } from 'next/server';
import { predictiveDelayService } from '@/services/predictive-delay-service';
import { logger } from '@/services/observability-service';

/**
 * @file route.ts
 * @description API endpoint for triggering and retrieving shipment delay predictions.
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shipmentId = searchParams.get('shipmentId');

  if (!shipmentId) {
    return NextResponse.json({ 
      success: false, 
      error: { code: 'BAD_REQUEST', message: 'shipmentId is required' } 
    }, { status: 400 });
  }

  try {
    const prediction = await predictiveDelayService.forecastShipmentDelay(shipmentId);
    return NextResponse.json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('API_Intelligence', `PREDICTION_FAILURE: ${error.message}`);
    return NextResponse.json({ 
      success: false, 
      error: { code: 'INTERNAL_ERROR', message: 'Could not generate prediction' } 
    }, { status: 500 });
  }
}
