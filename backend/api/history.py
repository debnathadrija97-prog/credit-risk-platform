from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from db.models import get_db, Application

router = APIRouter()

@router.get('/applications')
def get_applications(
    skip: int = 0,
    limit: int = 50,
    risk_band: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Application)
    if risk_band:
        query = query.filter(Application.risk_band == risk_band)
    total = query.count()
    records = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()

    return {
        'total': total,
        'items': [
            {
                'id': r.id,
                'applicant_name': r.applicant_name,
                'risk_score': r.risk_score,
                'risk_band': r.risk_band,
                'decision': r.decision,
                'overridden': r.overridden,
                'created_at': str(r.created_at)
            }
            for r in records
        ]
    }