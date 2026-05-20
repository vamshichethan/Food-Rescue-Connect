import os
import uvicorn
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier

app = FastAPI(
    title="Food Rescue Connect AI Microservice",
    description="Predictive logistics and spoilage risk calculation microservice",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for the trained model
model = None

def generate_and_train_model():
    """
    Generates a high-quality simulated dataset representing historical food listings
    and trains a Random Forest Classifier to predict spoilage risk.
    """
    global model
    print("🧠 Initializing AI Model - Synthesizing training dataset...")
    
    np.random.seed(42)
    n_samples = 1000

    # Synthesize features
    hours_remaining = np.random.uniform(1.0, 48.0, n_samples)
    quantity_kg = np.random.uniform(0.5, 100.0, n_samples)
    distance_km = np.random.uniform(0.2, 20.0, n_samples)

    # Determine probability of spoilage using a logical heuristic:
    # High risk when:
    # 1. hours remaining is short
    # 2. distance is long (takes more time to deliver)
    # 3. quantity is large (harder to pack and transport quickly)
    base_prob = 1.0 - (hours_remaining / 48.0)  # less hours -> higher probability
    distance_effect = (distance_km / 20.0) * 0.4  # more distance -> higher probability
    quantity_effect = (quantity_kg / 100.0) * 0.1  # more quantity -> slight increase in risk

    prob = base_prob + distance_effect + quantity_effect
    prob = np.clip(prob, 0.0, 1.0)

    # Generate binary target: 1 = Spoiled, 0 = Saved
    spoilage_occurred = (np.random.rand(n_samples) < prob).astype(int)

    # Create DataFrame
    df = pd.DataFrame({
        'hours_remaining': hours_remaining,
        'quantity_kg': quantity_kg,
        'distance_km': distance_km,
        'spoilage_occurred': spoilage_occurred
    })

    # Train model
    X = df[['hours_remaining', 'quantity_kg', 'distance_km']]
    y = df['spoilage_occurred']

    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X, y)
    print("📡 AI Model trained successfully with Scikit-Learn!")

# Train the model on app startup
@app.on_event("startup")
async def startup_event():
    generate_and_train_model()

# Request schemas
class PredictionRequest(BaseModel):
    hours_remaining: float
    quantity_kg: float
    distance_km: float

class RecommendationRequest(BaseModel):
    listing_coordinates: list[float]  # [longitude, latitude]
    ngos: list[dict]  # [{"id": "...", "name": "...", "coordinates": [lng, lat], "capacity_kg": 100}]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Food Rescue Connect AI Microservice",
        "model_loaded": model is not None
    }

@app.post("/predict-risk")
def predict_risk(request: PredictionRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Machine learning model is not initialized.")

    try:
        # Format feature array
        features = [[
            request.hours_remaining,
            request.quantity_kg,
            request.distance_km
        ]]

        # Compute probability of spoilage
        prob_spoilage = model.predict_proba(features)[0][1]
        risk_percentage = round(float(prob_spoilage) * 100, 1)

        # Classify priority & actions
        if risk_percentage >= 75.0:
            priority = "CRITICAL"
            recommendation = "🚨 High Spoilage Risk! Expand NGO broadcast radius to 15km immediately and dispatch a priority push notification to nearby volunteers."
        elif risk_percentage >= 50.0:
            priority = "HIGH"
            recommendation = "⚠️ Elevated Spoilage Risk. Prioritize matching and send secondary notifications to volunteers."
        elif risk_percentage >= 25.0:
            priority = "MEDIUM"
            recommendation = "⏱️ Moderate Risk. Normal queue processing."
        else:
            priority = "LOW"
            recommendation = "✅ Secure Listing. Low risk of expiration."

        return {
            "spoilage_risk_percentage": risk_percentage,
            "priority_level": priority,
            "recommendation": recommendation
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/recommend-ngo")
def recommend_ngo(request: RecommendationRequest):
    """
    Ranks NGOs based on a weighted score of:
    - Distance (Haversine formula)
    - Available remaining capacity
    """
    if not request.ngos:
        return {"recommendations": []}

    try:
        listing_lng, listing_lat = request.listing_coordinates
        ranked_ngos = []

        for ngo in request.ngos:
            ngo_lng, ngo_lat = ngo["coordinates"]
            
            # Calculate distance in km using standard Haversine approximation
            # Earth's radius in km is ~6371
            d_lat = np.radians(ngo_lat - listing_lat)
            d_lng = np.radians(ngo_lng - listing_lng)
            
            a = (np.sin(d_lat / 2) ** 2 + 
                 np.cos(np.radians(listing_lat)) * np.cos(np.radians(ngo_lat)) * 
                 np.sin(d_lng / 2) ** 2)
            c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
            distance = 6371 * c

            # Custom score: capacity counts positively, distance counts negatively
            # score = capacity / (distance + 1)
            capacity = ngo.get("capacity_kg", 50.0)
            score = round(capacity / (distance + 1.0), 2)

            ranked_ngos.append({
                "id": ngo["id"],
                "name": ngo["name"],
                "distance_km": round(distance, 2),
                "score": score,
                "capacity_kg": capacity
            })

        # Sort by score descending
        ranked_ngos.sort(key=lambda x: x["score"], reverse=True)

        return {
            "recommendations": ranked_ngos
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Recommendation error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
