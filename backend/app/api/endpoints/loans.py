from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import LoanRequest, LoanRepayment, User, Transaction, AuditLog, Notification
from app.schemas.schemas import (
    LoanCreateRequest, LoanApproveRequest, LoanRejectRequest,
    LoanRepaymentCreateRequest, LoanOut, LoanRepaymentOut
)
from app.auth.dependencies import get_current_active_user, require_admin

router = APIRouter(prefix="/loans", tags=["Loans"])

def build_loan_out(loan: LoanRequest, db: Session) -> LoanOut:
    user_name = loan.user.full_name if loan.user else "Umukoresha"
    user_phone = loan.user.phone_number if loan.user else ""

    # Calculate approved repayments
    approved_repayments = db.query(LoanRepayment).filter(
        LoanRepayment.loan_id == loan.id,
        LoanRepayment.status == "Byemejwe"
    ).all()
    total_repaid = sum(r.amount for r in approved_repayments)

    base_amount = loan.approved_amount if loan.approved_amount is not None else loan.requested_amount
    interest_amount = (base_amount * loan.interest_rate) / 100.0 if loan.interest_rate else 0.0
    total_payable = base_amount + interest_amount
    remaining = max(0.0, total_payable - total_repaid)

    all_repayments = db.query(LoanRepayment).filter(LoanRepayment.loan_id == loan.id).order_by(LoanRepayment.created_at.desc()).all()
    repayments_out = [
        LoanRepaymentOut(
            id=r.id,
            loan_id=r.loan_id,
            user_id=r.user_id,
            user_name=r.user.full_name if r.user else "Umukoresha",
            amount=r.amount,
            payment_reference=r.payment_reference,
            status=r.status,
            rejection_reason=r.rejection_reason,
            created_at=r.created_at,
            approved_at=r.approved_at
        ) for r in all_repayments
    ]

    return LoanOut(
        id=loan.id,
        user_id=loan.user_id,
        user_name=user_name,
        user_phone=user_phone,
        requested_amount=loan.requested_amount,
        approved_amount=loan.approved_amount,
        reason=loan.reason,
        repayment_months=loan.repayment_months,
        status=loan.status,
        rejection_reason=loan.rejection_reason,
        interest_rate=loan.interest_rate,
        total_repaid=total_repaid,
        remaining_balance=remaining,
        due_date=loan.due_date,
        created_at=loan.created_at,
        approved_at=loan.approved_at,
        repayments=repayments_out
    )

@router.post("/request", response_model=LoanOut)
def request_loan(
    data: LoanCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check existing active uncompleted loan
    existing_loan = db.query(LoanRequest).filter(
        LoanRequest.user_id == current_user.id,
        LoanRequest.status.in_(["Bitegereje", "Yemejwe", "Iri kwishyura"])
    ).first()
    if existing_loan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ufite inguzanyo yaba itegereje cyangwa irimo kwishyurwa. Banza uyirangize kabona usaba iyindi."
        )

    loan = LoanRequest(
        user_id=current_user.id,
        requested_amount=data.requested_amount,
        reason=data.reason.strip(),
        repayment_months=data.repayment_months,
        status="Bitegereje"
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    # Notification
    notif = Notification(
        user_id=current_user.id,
        title="Ubusabe bw'inguzanyo bwakiriwe",
        message=f"Ubusabe bwawe bw'inguzanyo bwa {data.requested_amount:,.0f} Frw bwakiriwe. Ubuyobozi bwiga ku busabe bwawe."
    )
    db.add(notif)
    db.commit()

    return build_loan_out(loan, db)

@router.get("/my", response_model=List[LoanOut])
def get_my_loans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    loans = db.query(LoanRequest).filter(
        LoanRequest.user_id == current_user.id
    ).order_by(LoanRequest.created_at.desc()).all()

    return [build_loan_out(l, db) for l in loans]

@router.post("/{loan_id}/repayment", response_model=LoanRepaymentOut)
def submit_loan_repayment(
    loan_id: int,
    data: LoanRepaymentCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanRequest).filter(
        LoanRequest.id == loan_id,
        LoanRequest.user_id == current_user.id
    ).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Inguzanyo ntabwo ibonetse.")

    if loan.status not in ["Yemejwe", "Iri kwishyura"]:
        raise HTTPException(status_code=400, detail="Iyi nguzanyo ntabwo iri mu gihe cyo kwishyurwa.")

    repayment = LoanRepayment(
        loan_id=loan.id,
        user_id=current_user.id,
        amount=data.amount,
        payment_reference=data.payment_reference.strip(),
        status="Bitegereje kwemezwa"
    )
    db.add(repayment)
    db.commit()
    db.refresh(repayment)

    notif = Notification(
        user_id=current_user.id,
        title="Ubwishyu bw'inguzanyo bwakiriwe",
        message=f"Ubwishyu bwa {data.amount:,.0f} Frw ku nguzanyo bwakiriwe. Bitegereje kwemezwa n'ubuyobozi."
    )
    db.add(notif)
    db.commit()

    return LoanRepaymentOut(
        id=repayment.id,
        loan_id=repayment.loan_id,
        user_id=repayment.user_id,
        user_name=current_user.full_name,
        amount=repayment.amount,
        payment_reference=repayment.payment_reference,
        status=repayment.status,
        rejection_reason=repayment.rejection_reason,
        created_at=repayment.created_at,
        approved_at=repayment.approved_at
    )

# Admin Endpoints
@router.get("/admin/list", response_model=List[LoanOut])
def list_all_loans_admin(
    status_filter: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(LoanRequest)
    if status_filter:
        query = query.filter(LoanRequest.status == status_filter)
    loans = query.order_by(LoanRequest.created_at.desc()).all()
    return [build_loan_out(l, db) for l in loans]

@router.post("/admin/{loan_id}/approve", response_model=LoanOut)
def approve_loan_admin(
    loan_id: int,
    data: LoanApproveRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanRequest).filter(LoanRequest.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Inguzanyo ntabwo ibonetse.")

    now = datetime.now(timezone.utc)
    loan.approved_amount = data.approved_amount
    loan.repayment_months = data.repayment_months
    loan.interest_rate = data.interest_rate
    loan.status = "Iri kwishyura"
    loan.approved_at = now
    loan.due_date = now + timedelta(days=30 * data.repayment_months)

    # Ledger entry for disbursement
    ledger = Transaction(
        user_id=loan.user_id,
        amount=data.approved_amount,
        type="LOAN_DISBURSEMENT",
        status="BYEMEJWE",
        reference=f"LOAN-{loan.id}",
        created_by_id=admin.id,
        verified_by_id=admin.id,
        notes=f"Loan disbursement approved for user {loan.user_id}"
    )
    db.add(ledger)

    audit = AuditLog(
        admin_id=admin.id,
        action="APPROVE_LOAN",
        target_type="LOAN",
        target_id=str(loan.id),
        new_value=f"Approved amount: {data.approved_amount} Frw, months: {data.repayment_months}, interest: {data.interest_rate}%"
    )
    db.add(audit)

    notif = Notification(
        user_id=loan.user_id,
        title="Ubusabe bw'inguzanyo bwemejwe!",
        message=f"Ubusabe bwawe bw'inguzanyo bwa {data.approved_amount:,.0f} Frw bwemejwe neza. Igihe cyo kwishyura ni amezi {data.repayment_months}."
    )
    db.add(notif)

    db.commit()
    db.refresh(loan)
    return build_loan_out(loan, db)

@router.post("/admin/{loan_id}/reject", response_model=LoanOut)
def reject_loan_admin(
    loan_id: int,
    data: LoanRejectRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanRequest).filter(LoanRequest.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Inguzanyo ntabwo ibonetse.")

    loan.status = "Yanzwe"
    loan.rejection_reason = data.rejection_reason.strip()

    audit = AuditLog(
        admin_id=admin.id,
        action="REJECT_LOAN",
        target_type="LOAN",
        target_id=str(loan.id),
        new_value=f"Rejected loan request of {loan.requested_amount} Frw. Reason: {loan.rejection_reason}"
    )
    db.add(audit)

    notif = Notification(
        user_id=loan.user_id,
        title="Ubusabe bw'inguzanyo bwanzwe",
        message=f"Ubusabe bwawe bw'inguzanyo bwa {loan.requested_amount:,.0f} Frw bwanzwe. Impamvu: {loan.rejection_reason}"
    )
    db.add(notif)

    db.commit()
    db.refresh(loan)
    return build_loan_out(loan, db)

@router.post("/admin/repayment/{repayment_id}/approve")
def approve_repayment_admin(
    repayment_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    repayment = db.query(LoanRepayment).filter(LoanRepayment.id == repayment_id).first()
    if not repayment:
        raise HTTPException(status_code=404, detail="Ubwishyu ntabwo bubonetse.")

    repayment.status = "Byemejwe"
    repayment.approved_at = datetime.now(timezone.utc)

    # Ledger entry for repayment
    ledger = Transaction(
        user_id=repayment.user_id,
        amount=repayment.amount,
        type="LOAN_REPAYMENT",
        status="BYEMEJWE",
        reference=repayment.payment_reference,
        created_by_id=repayment.user_id,
        verified_by_id=admin.id,
        notes=f"Approved repayment for loan ID {repayment.loan_id}"
    )
    db.add(ledger)

    # Check if loan is now fully paid
    loan = db.query(LoanRequest).filter(LoanRequest.id == repayment.loan_id).first()
    if loan:
        approved_repayments = db.query(LoanRepayment).filter(
            LoanRepayment.loan_id == loan.id,
            LoanRepayment.status == "Byemejwe"
        ).all()
        total_repaid = sum(r.amount for r in approved_repayments)
        
        base_amount = loan.approved_amount if loan.approved_amount is not None else loan.requested_amount
        interest_amount = (base_amount * loan.interest_rate) / 100.0 if loan.interest_rate else 0.0
        total_payable = base_amount + interest_amount

        if total_repaid >= total_payable:
            loan.status = "Yarangiye"
            finish_notif = Notification(
                user_id=loan.user_id,
                title="Warangije kwishyura inguzanyo!",
                message=f"Twakugororeye! Warangije kwishyura inguzanyo ya {total_payable:,.0f} Frw yose."
            )
            db.add(finish_notif)

    audit = AuditLog(
        admin_id=admin.id,
        action="APPROVE_LOAN_REPAYMENT",
        target_type="LOAN_REPAYMENT",
        target_id=str(repayment.id),
        new_value=f"Approved repayment of {repayment.amount} Frw"
    )
    db.add(audit)

    notif = Notification(
        user_id=repayment.user_id,
        title="Ubwishyu bw'inguzanyo bwemejwe!",
        message=f"Ubwishyu bwawe bwa {repayment.amount:,.0f} Frw bwemejwe. Umwenda wawe wagabanutse."
    )
    db.add(notif)

    db.commit()
    return {"message": f"Ubwishyu bwa {repayment.amount:,.0f} Frw bwemejwe neza."}
