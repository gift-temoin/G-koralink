from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import User, SavingsTransaction, LoanRequest, LoanRepayment, ProfitRecord, IkibinaGroup
from app.schemas.schemas import UserOut, UserUpdateRequest, PasswordChangeRequest, UserDashboardStats
from app.core.security import verify_password, get_password_hash
from app.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_active_user)):
    current_ikibina_id = None
    current_ikibina_name = None
    if current_user.group_memberships:
        group = current_user.group_memberships[0].group
        current_ikibina_id = group.id
        current_ikibina_name = group.name

    return UserOut(
        id=current_user.id,
        amazina_ya_mbere=current_user.amazina_ya_mbere,
        izina_rya_kabiri=current_user.izina_rya_kabiri,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        location=current_user.location,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        current_ikibina_id=current_ikibina_id,
        current_ikibina_name=current_ikibina_name
    )

@router.get("/me/dashboard", response_model=UserDashboardStats)
def get_user_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Total approved savings
    approved_savings = db.query(func.sum(SavingsTransaction.amount)).filter(
        SavingsTransaction.user_id == current_user.id,
        SavingsTransaction.status == "Byemejwe"
    ).scalar() or 0.0

    # Pending savings
    pending_savings = db.query(func.sum(SavingsTransaction.amount)).filter(
        SavingsTransaction.user_id == current_user.id,
        SavingsTransaction.status == "Bitegereje kwemezwa"
    ).scalar() or 0.0

    # Total profit
    total_profit = db.query(func.sum(ProfitRecord.amount)).filter(
        ProfitRecord.user_id == current_user.id
    ).scalar() or 0.0

    # Loans
    active_loans = db.query(LoanRequest).filter(
        LoanRequest.user_id == current_user.id,
        LoanRequest.status.in_(["Yemejwe", "Iri kwishyura", "Yarangiye"])
    ).all()

    total_loan_due = 0.0
    for l in active_loans:
        base = l.approved_amount if l.approved_amount is not None else l.requested_amount
        interest = (base * l.interest_rate) / 100.0 if l.interest_rate else 0.0
        total_loan_due += (base + interest)

    total_repaid = db.query(func.sum(LoanRepayment.amount)).filter(
        LoanRepayment.user_id == current_user.id,
        LoanRepayment.status == "Byemejwe"
    ).scalar() or 0.0

    remaining_debt = max(0.0, total_loan_due - total_repaid)

    # Loan limit rule: up to 3x savings or 100,000 Frw minimum
    loan_limit = max(100000.0, approved_savings * 3)

    pending_loans_count = db.query(LoanRequest).filter(
        LoanRequest.user_id == current_user.id,
        LoanRequest.status == "Bitegereje"
    ).count()

    current_ikibina_name = None
    if current_user.group_memberships:
        current_ikibina_name = current_user.group_memberships[0].group.name

    return UserDashboardStats(
        user_name=current_user.full_name,
        total_savings=approved_savings,
        pending_savings=pending_savings,
        total_profit=total_profit,
        remaining_loan_balance=remaining_debt,
        approved_loan_limit=loan_limit,
        total_repaid_loans=total_repaid,
        remaining_loan_to_pay=remaining_debt,
        pending_loans_count=pending_loans_count,
        current_ikibina_name=current_ikibina_name
    )

@router.put("/me", response_model=UserOut)
def update_user_profile(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if data.amazina_ya_mbere:
        current_user.amazina_ya_mbere = data.amazina_ya_mbere.strip()
    if data.izina_rya_kabiri:
        current_user.izina_rya_kabiri = data.izina_rya_kabiri.strip()
    if data.location:
        current_user.location = data.location.strip()

    db.commit()
    db.refresh(current_user)

    current_ikibina_id = None
    current_ikibina_name = None
    if current_user.group_memberships:
        group = current_user.group_memberships[0].group
        current_ikibina_id = group.id
        current_ikibina_name = group.name

    return UserOut(
        id=current_user.id,
        amazina_ya_mbere=current_user.amazina_ya_mbere,
        izina_rya_kabiri=current_user.izina_rya_kabiri,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        location=current_user.location,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        current_ikibina_id=current_ikibina_id,
        current_ikibina_name=current_ikibina_name
    )

@router.put("/me/password")
def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ijambobanga rya kera ntabwo ari ryo."
        )

    current_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Ijambobanga ryahinduwe neza."}
