from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from db.models import get_db, Application
from ml.model import get_model_service

router = APIRouter()

class ApplicationInput(BaseModel):
    applicant_name: str = Field(..., min_length=2)
    income: float = Field(..., gt=0)
    loan_amount: float = Field(..., gt=0)
    loan_annuity: float = Field(..., gt=0)
    age_years: float = Field(..., ge=18, le=70)
    employment_years: float = Field(..., ge=0)
    ext_source_1: Optional[float] = None
    ext_source_2: Optional[float] = None
    ext_source_3: Optional[float] = None

@router.post('/predict')
def predict_default(payload: ApplicationInput, db: Session = Depends(get_db)):
    svc = get_model_service()
    input_dict = payload.dict()

    result = svc.predict(input_dict)
    explanations = svc.explain(input_dict)

    app_record = Application(
        applicant_name=payload.applicant_name,
        income=payload.income,
        loan_amount=payload.loan_amount,
        loan_annuity=payload.loan_annuity,
        age_years=payload.age_years,
        employment_years=payload.employment_years,
        ext_source_1=payload.ext_source_1,
        ext_source_2=payload.ext_source_2,
        ext_source_3=payload.ext_source_3,
        risk_score=result['score'],
        default_probability=result['probability'],
        risk_band=result['band'],
        decision=result['decision'],
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    return {
        'id': app_record.id,
        'applicant_name': payload.applicant_name,
        'risk_score': result['score'],
        'default_probability': round(result['probability'] * 100, 1),
        'risk_band': result['band'],
        'decision': result['decision'],
        'top_drivers': explanations,
        'created_at': str(app_record.created_at)
    }

@router.post('/predict/{app_id}/override')
def override_decision(app_id: int, reason: str, reviewer: str,
                      db: Session = Depends(get_db)):
    record = db.query(Application).filter(Application.id == app_id).first()
    if not record:
        raise HTTPException(status_code=404, detail='Application not found')
    record.overridden = True
    record.override_reason = reason
    record.reviewed_by = reviewer
    db.commit()
    return {'status': 'override recorded', 'id': app_id}