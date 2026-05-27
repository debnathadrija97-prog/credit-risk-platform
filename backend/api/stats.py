from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.models import get_db, Application

router = APIRouter()

@router.get('/stats/portfolio')
def portfolio_stats(db: Session = Depends(get_db)):
    total = db.query(Application).count()
    if total == 0:
        return {'total': 0, 'approved': 0, 'review': 0, 'rejected': 0,
                'avg_risk_score': 0, 'default_rate': 0, 'override_rate': 0}

    approved = db.query(Application).filter(Application.decision=='APPROVED').count()
    review = db.query(Application).filter(Application.decision=='REVIEW').count()
    rejected = db.query(Application).filter(Application.decision=='REJECTED').count()
    avg_score = db.query(func.avg(Application.risk_score)).scalar()
    overridden = db.query(Application).filter(Application.overridden==True).count()

    return {
        'total': total,
        'approved': approved,
        'review': review,
        'rejected': rejected,
        'avg_risk_score': round(avg_score, 1),
        'override_rate': round(overridden / total * 100, 1),
        'default_rate': round(rejected / total * 100, 1)
    }