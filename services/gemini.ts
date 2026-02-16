
import { GoogleGenAI, Type } from "@google/genai";
import { Vehicle, MaintenanceRecord } from "../types";

const INDIAN_HUBS = [
  "Mumbai, Maharashtra", "Delhi, NCR", "Bengaluru, Karnataka", "Hyderabad, Telangana", 
  "Ahmedabad, Gujarat", "Chennai, Tamil Nadu", "Kolkata, West Bengal", "Surat, Gujarat", 
  "Pune, Maharashtra", "Jaipur, Rajasthan", "Lucknow, Uttar Pradesh", "Kanpur, Uttar Pradesh", 
  "Nagpur, Maharashtra", "Indore, Madhya Pradesh", "Thane, Maharashtra", "Bhopal, Madhya Pradesh"
];

export class GeminiService {
  private ai: GoogleGenAI;
  private static isRequesting: boolean = false;
  private static cooldownUntil: number = 0;
  private static placeCache: Map<string, string[]> = new Map();
  private static routeCache: Map<string, any> = new Map();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public static getQuotaStatus(): boolean {
    return Date.now() < GeminiService.cooldownUntil;
  }

  private setCooldown() {
    GeminiService.cooldownUntil = Date.now() + 60000; // 60s cooldown
  }

  async getPlaceSuggestions(query: string): Promise<{ source: 'AI' | 'Local', results: string[], isQuotaExhausted: boolean }> {
    const q = query.trim().toLowerCase();
    if (q.length < 3) return { source: 'Local', results: [], isQuotaExhausted: GeminiService.getQuotaStatus() };

    if (GeminiService.placeCache.has(q)) {
      return { source: 'AI', results: GeminiService.placeCache.get(q) || [], isQuotaExhausted: GeminiService.getQuotaStatus() };
    }

    if (GeminiService.getQuotaStatus() || GeminiService.isRequesting) {
      return { source: 'Local', results: this.getLocalSuggestions(q), isQuotaExhausted: true };
    }

    GeminiService.isRequesting = true;
    try {
      const prompt = `Return a comma-separated list of exactly 5 major Indian logistics cities that match or relate to "${query}". Names only.`;
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      const text = response.text || "";
      const results = text.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 2).slice(0, 5);
      
      if (results.length > 0) {
        GeminiService.placeCache.set(q, results);
        return { source: 'AI', results, isQuotaExhausted: false };
      }
      return { source: 'Local', results: this.getLocalSuggestions(q), isQuotaExhausted: false };
    } catch (e: any) {
      if (this.isQuotaError(e)) this.setCooldown();
      return { source: 'Local', results: this.getLocalSuggestions(q), isQuotaExhausted: true };
    } finally {
      GeminiService.isRequesting = false;
    }
  }

  async getRouteOptimization(origin: string, destination: string, vehicleType: string) {
    const cacheKey = `${origin}-${destination}-${vehicleType}`.toLowerCase();
    if (GeminiService.routeCache.has(cacheKey)) return GeminiService.routeCache.get(cacheKey);

    if (GeminiService.getQuotaStatus()) return this.getMockRoute(origin, destination);

    try {
      const prompt = `Suggest optimized route: ${origin} to ${destination} for ${vehicleType}. 
      Return JSON: { "route_name": "string", "steps": ["step1", "step2"], "total_distance_km": number, "estimated_duration_min": number, "fuel_cost_estimate": number, "efficiency_score": number }`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              route_name: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              total_distance_km: { type: Type.NUMBER },
              estimated_duration_min: { type: Type.NUMBER },
              fuel_cost_estimate: { type: Type.NUMBER },
              efficiency_score: { type: Type.NUMBER }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      data.source = 'AI';
      GeminiService.routeCache.set(cacheKey, data);
      return data;
    } catch (e: any) {
      if (this.isQuotaError(e)) this.setCooldown();
      return this.getMockRoute(origin, destination);
    }
  }

  async getPredictiveMaintenance(vehicle: Vehicle, history: MaintenanceRecord[]) {
    if (GeminiService.getQuotaStatus()) return this.getMockMaintenance();

    try {
      const historyText = history.map(h => `${h.date}: ${h.serviceType}`).join(', ');
      const prompt = `Analyze: ${vehicle.make} ${vehicle.model}, ${vehicle.mileage}km. History: ${historyText}. 
      Predict next 3 tasks in JSON array: [{ "task": "string", "urgency": "string", "estimated_mileage": number, "estimated_cost": number, "reason": "string" }]`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                urgency: { type: Type.STRING },
                estimated_mileage: { type: Type.NUMBER },
                estimated_cost: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              }
            }
          }
        }
      });
      return JSON.parse(response.text);
    } catch (e: any) {
      if (this.isQuotaError(e)) this.setCooldown();
      return this.getMockMaintenance();
    }
  }

  private isQuotaError(e: any): boolean {
    return e?.message?.includes('429') || e?.status === 429 || e?.message?.includes('RESOURCE_EXHAUSTED');
  }

  private getLocalSuggestions(query: string): string[] {
    return INDIAN_HUBS.filter(hub => hub.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }

  private getMockRoute(origin: string, destination: string) {
    return {
      route_name: `Standard NH Corridor (${origin} to ${destination})`,
      steps: [
        `Exit ${origin} via main logistics hub.`,
        "Connect to nearest National Highway (NH) corridor.",
        "Maintain steady cruise speed for optimal fuel efficiency.",
        "Pass through state border checkpoint (E-Way Bill Verification).",
        `Arrive at ${destination} regional distribution center.`
      ],
      total_distance_km: 150,
      estimated_duration_min: 240,
      fuel_cost_estimate: 2500,
      efficiency_score: 85,
      source: 'Local'
    };
  }

  private getMockMaintenance() {
    return [
      { task: "General Fluid Check", urgency: "Medium", estimated_mileage: 1000, estimated_cost: 1500, reason: "Scheduled periodic assessment (Local Fallback Mode)." },
      { task: "Tyre Rotation", urgency: "Low", estimated_mileage: 2500, estimated_cost: 800, reason: "Standard wear-level optimization." }
    ];
  }
}
