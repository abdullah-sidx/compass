"""
Compass - Delay Risk Prediction Model Training Script
Smart India Hackathon 2026 (SIH26016)

Generates 3,000 synthetic infrastructure land acquisition projects,
trains an interpretable standardized linear regression model for delay prediction,
evaluates held-out R^2, and exports the model specification to /public/model/risk-model.json.
"""

import os
import json
import numpy as np
from datetime import date
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error

def generate_synthetic_dataset(n_samples=3000, random_state=42):
    rng = np.random.RandomState(random_state)
    
    # 1. Project physical & demographic features
    land_area_ha = np.round(rng.uniform(8.0, 75.0, size=n_samples), 2)
    parcels_count = rng.randint(8, 35, size=n_samples)
    families_affected = np.round(parcels_count * rng.uniform(1.8, 3.8, size=n_samples)).astype(int)
    
    # 2. Risk & friction features
    # Correlate objections and disputes somewhat
    base_friction = rng.uniform(0.0, 1.0, size=n_samples)
    open_objections = np.round(base_friction * rng.uniform(5, 45, size=n_samples) + rng.uniform(0, 5, size=n_samples)).astype(int)
    open_objections = np.clip(open_objections, 0, 50)
    
    disputes = np.round(base_friction * rng.uniform(2, 22, size=n_samples) + rng.uniform(0, 4, size=n_samples)).astype(int)
    disputes = np.clip(disputes, 0, 28)
    
    stage_delay_days = np.round(base_friction * rng.uniform(10, 115, size=n_samples) + rng.uniform(0, 15, size=n_samples)).astype(int)
    stage_delay_days = np.clip(stage_delay_days, 0, 140)
    
    # High friction projects tend to have lower compensation paid %
    compensation_paid_pct = np.round(100 - base_friction * rng.uniform(20, 80, size=n_samples) - rng.uniform(0, 15, size=n_samples)).astype(int)
    compensation_paid_pct = np.clip(compensation_paid_pct, 5, 98)
    
    # Forest clearance pending is binary (approx 20% of projects)
    forest_clearance_pending = (rng.uniform(0, 1, size=n_samples) < 0.22).astype(int)
    
    # 3. Ground truth delay formula with plausible domain physics:
    # 30 days stage delay adds ~1.0 month
    # Each objection adds ~0.10 month
    # Each dispute adds ~0.15 month
    # Pending forest clearance adds ~3.2 months
    # Higher compensation paid reduces delay (~ -0.04 months per %)
    # Families & parcels add small operational overhead
    synthetic_delay = (
        1.2
        + (stage_delay_days / 30.0) * 1.05
        + open_objections * 0.095
        + disputes * 0.14
        + forest_clearance_pending * 3.20
        - (compensation_paid_pct - 50.0) * 0.042
        + families_affected * 0.012
        + parcels_count * 0.025
        + land_area_ha * 0.010
        + rng.normal(0.0, 0.45, size=n_samples) # Realistic noise
    )
    delay_months = np.clip(np.round(synthetic_delay, 1), 0.2, 18.0)
    
    feature_names = [
        "stageDelayDays",
        "openObjections",
        "disputes",
        "forestClearancePending",
        "compensationPaidPct",
        "familiesAffected",
        "parcelsCount",
        "landAreaHa",
    ]
    
    feature_labels = {
        "stageDelayDays": "Stage Delay (Days)",
        "openObjections": "Open Objections",
        "disputes": "Active Disputes",
        "forestClearancePending": "Forest Clearance Pending",
        "compensationPaidPct": "Compensation Disbursed (%)",
        "familiesAffected": "Families Affected",
        "parcelsCount": "Parcels Count",
        "landAreaHa": "Land Area (Hectares)",
    }
    
    X = np.column_stack([
        stage_delay_days,
        open_objections,
        disputes,
        forest_clearance_pending,
        compensation_paid_pct,
        families_affected,
        parcels_count,
        land_area_ha,
    ])
    
    return X, delay_months, feature_names, feature_labels

def train_and_export():
    print("=" * 65)
    print("COMPASS: Training Delay-Risk Linear Model on Synthetic Data")
    print("=" * 65)
    
    n_samples = 3000
    X, y, feature_names, feature_labels = generate_synthetic_dataset(n_samples=n_samples, random_state=42)
    
    # 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    
    # Compute feature means and standard deviations from training set
    means = np.mean(X_train, axis=0)
    stds = np.std(X_train, axis=0)
    stds = np.where(stds == 0, 1.0, stds)
    
    # Standardize X
    Z_train = (X_train - means) / stds
    Z_test = (X_test - means) / stds
    
    # Fit Ordinary Least Squares
    model = LinearRegression(fit_intercept=True)
    model.fit(Z_train, y_train)
    
    # Evaluate on held-out test set
    y_pred_test = model.predict(Z_test)
    r2 = r2_score(y_test, y_pred_test)
    mae = mean_absolute_error(y_test, y_pred_test)
    
    print(f"\nTraining Samples: {len(X_train)} | Held-Out Test Samples: {len(X_test)}")
    print(f"Held-Out R^2:    {r2:.4f}")
    print(f"Held-Out MAE:    {mae:.4f} months")
    print(f"Model Intercept: {model.intercept_:.4f} months (baseline delay at mean feature values)\n")
    
    # Feature importance table
    importance = []
    for i, name in enumerate(feature_names):
        coef = model.coef_[i]
        importance.append({
            "name": name,
            "label": feature_labels[name],
            "coef": coef,
            "abs_coef": abs(coef),
            "mean": float(means[i]),
            "std": float(stds[i]),
            "direction": "increases_risk" if coef > 0 else "reduces_risk"
        })
    
    # Sort by absolute coefficient descending
    importance.sort(key=lambda item: item["abs_coef"], reverse=True)
    
    print("Feature Importance Table (Standardized Beta Coefficients):")
    print("-" * 65)
    print(f"{'Feature':<28} | {'Beta Coef':>10} | {'Mean':>8} | {'Std':>8} | {'Impact'}")
    print("-" * 65)
    for f in importance:
        sign = "+" if f["coef"] > 0 else ""
        impact_dir = "Raises delay" if f["coef"] > 0 else "Lowers delay"
        print(f"{f['label']:<28} | {sign}{f['coef']:>9.4f} | {f['mean']:>8.2f} | {f['std']:>8.2f} | {impact_dir}")
    print("-" * 65)
    
    # Build JSON payload
    # Calibrated risk score mapping:
    # A project with low delay (< 3.2 mo) -> score < 40 (Low risk)
    # A project with medium delay (3.2 - 6.8 mo) -> score 40 - 69 (Medium risk)
    # A project with high delay (>= 6.8 mo) -> score >= 70 (High risk)
    model_export = {
        "meta": {
            "trainedOn": "synthetic data",
            "n": n_samples,
            "r2": round(float(r2), 4),
            "mae": round(float(mae), 4),
            "date": "2026-10-05",
            "description": "Standardized Ordinary Least Squares model trained on 3000 synthetic land acquisition projects",
            "disclaimer": "Prototype model trained on synthetic data. Not for official statutory determination."
        },
        "intercept": round(float(model.intercept_), 4),
        "features": {
            f["name"]: {
                "label": f["label"],
                "mean": round(float(f["mean"]), 4),
                "std": round(float(f["std"]), 4),
                "coef": round(float(f["coef"]), 4),
                "direction": f["direction"]
            }
            for f in importance
        },
        "featureOrder": [f["name"] for f in importance],
        "thresholds": {
            "lowMaxScore": 39,
            "mediumMaxScore": 69,
            "highMinScore": 70,
            "lowMaxDelayMonths": 3.2,
            "mediumMaxDelayMonths": 6.8
        },
        "sliderRanges": {
            "openObjections": {"min": 0, "max": 50, "step": 1, "unit": "objections"},
            "stageDelayDays": {"min": 0, "max": 120, "step": 1, "unit": "days"},
            "compensationPaidPct": {"min": 0, "max": 100, "step": 1, "unit": "%"},
            "forestClearancePending": {"type": "boolean", "label": "Forest clearance pending"}
        }
    }
    
    # Output path: public/model/risk-model.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    out_dir = os.path.join(project_root, "public", "model")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "risk-model.json")
    
    with open(out_file, "w", encoding="utf-8") as fp:
        json.dump(model_export, fp, indent=2)
        
    print(f"\n[OK] Model exported successfully to: {out_file}")
    return r2, importance

if __name__ == "__main__":
    train_and_export()
