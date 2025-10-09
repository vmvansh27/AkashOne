import type { Request, Response, NextFunction } from "express";
import type { IStorage } from "../storage";

export function createFeatureFlagMiddleware(storage: IStorage) {
  return function requireFeature(featureKey: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const feature = await storage.getFeatureFlagByKey(featureKey);
        
        if (!feature) {
          return res.status(404).json({
            message: `Feature '${featureKey}' not found`,
          });
        }

        if (!feature.enabled) {
          return res.status(403).json({
            message: `Feature '${feature.name}' is currently disabled`,
            feature: featureKey,
          });
        }

        next();
      } catch (error: any) {
        return res.status(500).json({
          message: error.message || "Error checking feature flag",
        });
      }
    };
  };
}
