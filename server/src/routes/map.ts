import { Router } from 'express';
import { validateMapFilters } from '../middleware/validateMapFilters';
import { mapService } from '../services/mapService';
import { yandexMapsService } from '../services/yandexMapsService';
import { Property } from '../models/Property';

const router = Router();

router.get('/properties', validateMapFilters, async (req, res) => {
  try {
    const filters = res.locals.mapFilters;
    const mapData = await mapService.getMapData(Property, filters);
    res.json(mapData);
  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Address parameter required',
      });
    }
    const result = await yandexMapsService.geocode(address);
    if (!result) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Could not geocode address',
      });
    }
    res.json(result);
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lng, lat } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'lng and lat parameters required',
      });
    }
    const longitude = Number(lng);
    const latitude = Number(lat);
    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'lng and lat must be valid numbers',
      });
    }
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid coordinates range',
      });
    }
    const result = await yandexMapsService.reverseGeocode(longitude, latitude);
    if (!result) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Could not reverse geocode coordinates',
      });
    }
    res.json(result);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
