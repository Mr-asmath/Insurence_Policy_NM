import { InsuranceLine, PremiumCalculationBreakdown } from '../types/insurance';

export interface RatingInput {
  recordType: InsuranceLine;
  policyState: string;
  // Auto fields
  vin?: string;
  modelYear?: string;
  // Property fields
  squareFootage?: number;
  yearBuilt?: string;
  // Life fields
  policyTermMonths?: number;
  coverageAmount?: number;
}

/**
 * Replicates the Apex class PremiumCalculator:
 * 
 * public class PremiumCalculator {
 *   public static List<Decimal> calculatePremium(List<PremiumInputWrapper> inputs) {
 *     Decimal basePremium = 1000.00;
 *     if (policy.Policy_State__c == 'CA') {
 *       basePremium *= 1.15;
 *     } else if (policy.Policy_State__c == 'TX') {
 *       basePremium *= 1.05;
 *     }
 *     if (policy.Model_Year__c != null && Integer.valueOf(policy.Model_Year__c) < 2018) {
 *       basePremium += 100;
 *     }
 *     return basePremium;
 *   }
 * }
 */
export function calculatePremium(input: RatingInput): PremiumCalculationBreakdown {
  const explanation: string[] = [];

  if (input.recordType === 'Auto') {
    let base = 1000.00;
    explanation.push(`Initial Auto Base Premium: $${base.toFixed(2)}`);

    let multiplier = 1.0;
    let stateAdjustment = 0;
    if (input.policyState === 'CA') {
      multiplier = 1.15;
      stateAdjustment = base * 0.15;
      base = base * 1.15;
      explanation.push(`State Adjustment (CA): × 1.15 (+ $${stateAdjustment.toFixed(2)})`);
    } else if (input.policyState === 'TX') {
      multiplier = 1.05;
      stateAdjustment = base * 0.05;
      base = base * 1.05;
      explanation.push(`State Adjustment (TX): × 1.05 (+ $${stateAdjustment.toFixed(2)})`);
    } else {
      explanation.push(`State Adjustment (${input.policyState || 'Standard'}): Neutral (1.00)`);
    }

    let modelYearAdjustment = 0;
    if (input.modelYear) {
      const year = parseInt(input.modelYear, 10);
      if (!isNaN(year) && year < 2018) {
        modelYearAdjustment = 100.00;
        base += 100.00;
        explanation.push(`Vehicle Age Surcharge (Year ${year} < 2018): + $100.00`);
      } else {
        explanation.push(`Vehicle Age (Year ${year} >= 2018): Standard rating tier (+ $0.00)`);
      }
    }

    const roundedTotal = Math.round(base * 100) / 100;
    explanation.push(`Final Rated Premium: $${roundedTotal.toFixed(2)}`);

    return {
      basePremium: 1000.00,
      stateMultiplier: multiplier,
      stateAdjustment,
      modelYearAdjustment,
      propertySqftAdjustment: 0,
      propertyAgeAdjustment: 0,
      lifeTermAdjustment: 0,
      totalCalculatedPremium: roundedTotal,
      formulaExplanation: explanation
    };
  }

  if (input.recordType === 'Property') {
    let base = 850.00;
    explanation.push(`Initial Property Base Premium: $${base.toFixed(2)}`);

    let multiplier = 1.0;
    let stateAdjustment = 0;
    if (input.policyState === 'CA') {
      multiplier = 1.20;
      stateAdjustment = base * 0.20;
      base = base * 1.20;
      explanation.push(`Coastal/Wildfire Hazard State Rate (CA): × 1.20 (+ $${stateAdjustment.toFixed(2)})`);
    } else if (input.policyState === 'TX') {
      multiplier = 1.10;
      stateAdjustment = base * 0.10;
      base = base * 1.10;
      explanation.push(`Hail & Wind Corridor State Rate (TX): × 1.10 (+ $${stateAdjustment.toFixed(2)})`);
    }

    let sqftAdjustment = 0;
    if (input.squareFootage && input.squareFootage > 1500) {
      sqftAdjustment = Math.round((input.squareFootage - 1500) * 0.35 * 100) / 100;
      base += sqftAdjustment;
      explanation.push(`Square Footage Rating (${input.squareFootage} sq ft > 1,500 base): + $${sqftAdjustment.toFixed(2)}`);
    }

    let ageAdjustment = 0;
    if (input.yearBuilt) {
      const year = parseInt(input.yearBuilt, 10);
      if (!isNaN(year) && year < 2000) {
        ageAdjustment = 120.00;
        base += ageAdjustment;
        explanation.push(`Pre-2000 Plumbing/Wiring Code Surcharge (Built ${year}): + $120.00`);
      }
    }

    const roundedTotal = Math.round(base * 100) / 100;
    explanation.push(`Final Rated Property Premium: $${roundedTotal.toFixed(2)}`);

    return {
      basePremium: 850.00,
      stateMultiplier: multiplier,
      stateAdjustment,
      modelYearAdjustment: 0,
      propertySqftAdjustment: sqftAdjustment,
      propertyAgeAdjustment: ageAdjustment,
      lifeTermAdjustment: 0,
      totalCalculatedPremium: roundedTotal,
      formulaExplanation: explanation
    };
  }

  // Life Insurance Line
  let base = 480.00;
  explanation.push(`Initial Term Life Base Premium: $${base.toFixed(2)}`);

  let termAdjustment = 0;
  const term = input.policyTermMonths || 120;
  if (term > 120) {
    const additionalYears = Math.floor((term - 120) / 12);
    termAdjustment = additionalYears * 35.00;
    base += termAdjustment;
    explanation.push(`Extended Term Duration (${term} months): + $${termAdjustment.toFixed(2)}`);
  }

  const roundedTotal = Math.round(base * 100) / 100;
  explanation.push(`Final Rated Life Premium: $${roundedTotal.toFixed(2)}`);

  return {
    basePremium: 480.00,
    stateMultiplier: 1.0,
    stateAdjustment: 0,
    modelYearAdjustment: 0,
    propertySqftAdjustment: 0,
    propertyAgeAdjustment: 0,
    lifeTermAdjustment: termAdjustment,
    totalCalculatedPremium: roundedTotal,
    formulaExplanation: explanation
  };
}

/**
 * Validation rule: VIN_Must_Be_17_Characters
 * Formula: AND( RecordType.DeveloperName = "Auto", LEN( VIN__c ) <> 17)
 */
export function validateVIN(recordType: InsuranceLine, vin?: string): { isValid: boolean; errorMessage?: string } {
  if (recordType !== 'Auto') {
    return { isValid: true };
  }
  const cleanVin = (vin || '').trim();
  if (cleanVin.length !== 17) {
    return {
      isValid: false,
      errorMessage: 'The Vehicle Identification Number (VIN) must be exactly 17 characters long for Auto Policies.'
    };
  }
  return { isValid: true };
}
