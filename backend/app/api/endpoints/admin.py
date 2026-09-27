from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import User, SavingsTransaction, LoanRequest, LoanRepayment, IkibinaGroup, IkibinaMember, ProfitRecord, AuditLog, Transaction
from app.schemas.schemas import AdminDashboardStats, UserOut, FinancialReportOut, AuditLogOut
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).filter(User.role == "UMUKORESHA").count()

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    new_users = db.query(User).filter(
        User.role == "UMUKORESHA",
        User.created_at >= thirty_days_ago
    ).count()

    active_ikibina = db.query(IkibinaGroup).filter(IkibinaGroup.is_active == True).count()

    approved_savings = db.query(func.sum(SavingsTransaction.amount)).filter(
        SavingsTransaction.status == "Byemejwe"
    ).scalar() or 0.0

    pending_savings = db.query(func.sum(SavingsTransaction.amount)).filter(
        SavingsTransaction.status == "Bitegereje kwemezwa"
    ).scalar() or 0.0

    pending_loans_count = db.query(LoanRequest).filter(LoanRequest.status == "Bitegereje").count()
    approved_loans_count = db.query(LoanRequest).filter(LoanRequest.status.in_(["Yemejwe", "Iri kwishyura", "Yarangiye"])).count()

    approved_loans = db.query(LoanRequest).filter(LoanRequest.status.in_(["Yemejwe", "Iri kwishyura", "Yarangiye"])).all()
    total_loan_given = 0.0
    for l in approved_loans:
        base = l.approved_amount if l.approved_amount is not None else l.requested_amount
        interest = (base * l.interest_rate) / 100.0 if l.interest_rate else 0.0
        total_loan_given += (base + interest)

    total_repaid = db.query(func.sum(LoanRepayment.amount)).filter(
        LoanRepayment.status == "Byemejwe"
    ).scalar() or 0.0

    outstanding_loans = max(0.0, total_loan_given - total_repaid)

    return AdminDashboardStats(
        total_users=total_users,
        new_users_this_month=new_users,
        active_ikibina_count=active_ikibina,
        total_savings_approved=approved_savings,
        pending_savings_amount=pending_savings,
        pending_loans_count=pending_loans_count,
        approved_loans_count=approved_loans_count,
        total_outstanding_loans=outstanding_loans,
        total_repaid_loans=total_repaid
    )

@router.get("/users", response_model=List[UserOut])
def get_admin_users(
    query: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    db_query = db.query(User).filter(User.role == "UMUKORESHA")
    if query:
        search = f"%{query}%"
        db_query = db_query.filter(
            (User.amazina_ya_mbere.ilike(search)) |
            (User.izina_rya_kabiri.ilike(search)) |
            (User.phone_number.ilike(search)) |
            (User.location.ilike(search))
        )
    users = db_query.order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        curr_id = None
        curr_name = None
        if u.group_memberships:
            g = u.group_memberships[0].group
            curr_id = g.id
            curr_name = g.name
        result.append(
            UserOut(
                id=u.id,
                amazina_ya_mbere=u.amazina_ya_mbere,
                izina_rya_kabiri=u.izina_rya_kabiri,
                full_name=u.full_name,
                phone_number=u.phone_number,
                location=u.location,
                role=u.role,
                is_active=u.is_active,
                created_at=u.created_at,
                current_ikibina_id=curr_id,
                current_ikibina_name=curr_name
            )
        )
    return result

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Umukoresha ntabwo kibonetse.")

    if user.role == "ADMIN":
        raise HTTPException(status_code=400, detail="Ntabwo wahagarika konti y'ubuyobozi.")

    user.is_active = not user.is_active
    db.commit()

    action = "ACTIVATED_USER" if user.is_active else "SUSPENDED_USER"
    audit = AuditLog(
        admin_id=admin.id,
        action=action,
        target_type="USER",
        target_id=str(user.id),
        new_value=f"Active state: {user.is_active}"
    )
    db.add(audit)
    db.commit()

    status_str = "yakoreshejwe neza" if user.is_active else "yahagaritswe"
    return {"message": f"Konti ya {user.full_name} {status_str}."}

@router.get("/reports", response_model=FinancialReportOut)
def generate_financial_report(
    period: str = "this_month", # today, this_week, this_month, all
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "this_week":
        start_date = now - timedelta(days=now.weekday())
    elif period == "this_month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start_date = datetime(2020, 1, 1, tzinfo=timezone.utc)

    approved_savings = db.query(func.sum(SavingsTransaction.amount)).filter(
        SavingsTransaction.status == "Byemejwe",
        SavingsTransaction.created_at >= start_date
    ).scalar() or 0.0

    pending_savings = db.query(func.sum(SavingsTransaction.amount)).filter(
        SavingsTransaction.status == "Bitegereje kwemezwa",
        SavingsTransaction.created_at >= start_date
    ).scalar() or 0.0

    approved_loans_objs = db.query(LoanRequest).filter(
        LoanRequest.status.in_(["Yemejwe", "Iri kwishyura", "Yarangiye"]),
        LoanRequest.created_at >= start_date
    ).all()
    approved_loans = sum((l.approved_amount or l.requested_amount) for l in approved_loans_objs)

    pending_loans_objs = db.query(LoanRequest).filter(
        LoanRequest.status == "Bitegereje",
        LoanRequest.created_at >= start_date
    ).all()
    pending_loans = sum(l.requested_amount for l in pending_loans_objs)

    repayments = db.query(func.sum(LoanRepayment.amount)).filter(
        LoanRepayment.status == "Byemejwe",
        LoanRepayment.created_at >= start_date
    ).scalar() or 0.0

    outstanding = max(0.0, approved_loans - repayments)
    net_fund = approved_savings + repayments - approved_loans
    tx_count = db.query(Transaction).filter(Transaction.created_at >= start_date).count()

    return FinancialReportOut(
        period=period,
        total_savings=approved_savings,
        pending_savings=pending_savings,
        approved_loans=approved_loans,
        pending_loans=pending_loans,
        loan_repayments=repayments,
        outstanding_loans=outstanding,
        net_fund_balance=net_fund,
        transactions_count=tx_count
    )

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    result = []
    for l in logs:
        admin_user = db.query(User).filter(User.id == l.admin_id).first()
        admin_name = admin_user.full_name if admin_user else "Admin"
        result.append(
            AuditLogOut(
                id=l.id,
                admin_id=l.admin_id,
                admin_name=admin_name,
                action=l.action,
                target_type=l.target_type,
                target_id=l.target_id,
                previous_value=l.previous_value,
                new_value=l.new_value,
                timestamp=l.timestamp
            )
        )
    return result
