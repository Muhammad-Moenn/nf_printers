# Pricing Prediction Roadmap

## Goal

Build a pricing prediction system for NF Printers that estimates an order price from order details such as service, quantity, paper type, size, GSM, color mode, sides, finishing options, and custom requirements.

## Recommended Approach

Use a machine learning regression model as the main pricing engine.

Recommended first model:

```txt
CatBoost Regressor
```

Why:

- Works well with categorical fields.
- Needs less preprocessing than many other ML models.
- Good fit for printing orders where fields like paper type, size, service, and color mode strongly affect price.

Use an AI/LLM only as a helper for extracting structured signals from free text requirements.

## Current Implementation Status

The app now has a working pricing integration, but it uses a rule-based pricing engine first because there is no historical pricing dataset yet.

Implemented:

```txt
Order form
   ↓
/api/pricing/predict
   ↓
Pricing client
   ↓
External model service if PRICING_MODEL_URL exists
   ↓
Rule-based pricing fallback
   ↓
Estimated amount shown in the UI
```

Current source:

```txt
rule_based
```

Future source:

```txt
ml_model
```

When enough real completed orders exist, train CatBoost and expose it through `PRICING_MODEL_URL`.

## High-Level Flow

```txt
Customer order details
        ↓
Validate and normalize data
        ↓
Extract structured features
        ↓
Send features to ML pricing model
        ↓
Return predicted price
        ↓
Admin can accept, adjust, or override price
        ↓
Save final price for future model improvement
```

## Data Structure

Current important fields:

```txt
product
service
quantity
amount
paperType
size
gsm
colorMode
sides
 designs        
finishingOptions
requirements
isReorder
```

Recommended Prisma improvements:

```prisma
quantity Int
amount   Float
```

Optional future fields:

```prisma
predictedAmount Float?
finalAmount     Float?
pricingSource   String? // predicted, manual, adjusted
```

## Feature Inputs

Use these fields as model inputs:

```txt
service
product
quantity
paperType
size
gsm
colorMode
sides
finishingOptions
isReorder
design
requirements-derived features
```

Useful derived features:

```txt
finishingOptionsCount
isDoubleSided
isColorPrint
isCustomSize
hasUrgency
hasSpecialInstructions
```

## Roadmap

### Phase 1: Clean Data

1. Convert `quantity` into a number.
2. Convert `amount` into a number.
3. Remove invalid or incomplete orders.
4. Standardize repeated values, for example:
   - `CMYK`
   - `Black & White`
   - `Single Side`
   - `Double Side`
5. Export historical orders from the database.

### Phase 2: Prepare Training Dataset

1. Create a dataset with one row per order.
2. Use order details as input columns.
3. Use final order price as the target column.
4. Split data:
   - 80% training
   - 20% testing

### Phase 3: Train Baseline Model

1. Start with CatBoost Regressor.
2. Train on historical orders.
3. Measure accuracy using:
   - MAE: Mean Absolute Error
   - RMSE: Root Mean Squared Error
4. Compare predicted price vs actual price.

### Phase 4: Add Prediction API

Create a separate pricing service or API endpoint:

```txt
POST /api/pricing/predict
```

Input:

```json
{
  "service": "Book Printing",
  "quantity": 100,
  "paperType": "Glossy",
  "size": "A4",
  "gsm": "80",
  "colorMode": "CMYK",
  "sides": "Double Side",
  "finishingOptions": ["Lamination"],
  "requirements": "Need urgent delivery"
}
```

Output:

```json
{
  "predictedAmount": 12500,
  "confidence": "medium"
}
```

### Phase 5: Integrate With App

1. User fills new order form.
2. App sends order details to pricing API.
3. UI shows estimated price.
4. Admin can approve or edit the price.
5. Save both predicted and final price.

### Phase 6: Improve Over Time

1. Store admin-adjusted prices.
2. Retrain the model regularly.
3. Track prediction errors.
4. Add more features if needed:
   - delivery urgency
   - customer type
   - material cost
   - machine cost
   - employee/labor cost

## Suggested Folder Structure

```txt
pricing-model/
  data/
    orders.csv
  notebooks/
    training.ipynb
  src/
    train.py
    predict.py
    features.py
  models/
    pricing-model.cbm
  requirements.txt

app/
  api/
    pricing/
      predict/
        route.ts

lib/
  pricing/
    normalize-order.ts
    pricing-client.ts
```

## Best Final Architecture

```txt
Next.js app
   ↓
Pricing API route
   ↓
Python pricing service
   ↓
CatBoost model
   ↓
Predicted price
```

## Important Notes

- Do not rely only on a chat AI model for pricing.
- Use historical final prices as the training target.
- Keep admin override available.
- The model will only be good if the old order pricing data is clean and consistent.
- Start simple, then improve after collecting more real orders.
