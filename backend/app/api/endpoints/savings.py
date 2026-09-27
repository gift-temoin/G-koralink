from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SavingsTransaction, IkibinaGroup, IkibinaMember, User, Transaction, AuditLog, Notification, ProfitRecord
from app.schemas.schemas import SavingsCreateRequest, SavingsReviewRequest, SavingsOut
from app.auth.dependencies import get_current_active_user, require_admin

router = APIRouter(prefix="/savings", tags=["Savings"])

@router.post("", response_model=SavingsOut)
def create_savings_submission(
    data: SavingsCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    group = db.query(IkibinaGroup).filter(IkibinaGroup.id == data.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Ikibina ntabwo kibonetse.")

    # Ensure user is a member or auto-join
    member = db.query(IkibinaMember).filter(
        IkibinaMember.group_id == data.group_id,
        IkibinaMember.user_id == current_user.id
    ).first()
    if not member:
        new_member = IkibinaMember(group_id=data.group_id, user_id=current_user.id)
        db.add(new_member)
        db.commit()

    savings = SavingsTransaction(
        user_id=current_user.id,
        group_id=data.group_id,
        amount=data.amount,
        payment_method="MTN MoMo",
        payment_reference=data.payment_reference.strip(),
        status="Bitegereje kwemezwa"
    )
    db.add(savings)
    db.commit()
    db.refresh(savings)

    # User notification
    notif = Notification(
        user_id=current_user.id,
        title="Ubusabe bwo kwizigama bwakiriwe",
        message=f"Ubusabe bwawe bwo kwizigama {data.amount:,.0f} Frw kuri {group.name} bwakiriwe. Bitegereje kwemezwa n'ubuyobozi."
    )
    db.add(notif)
    db.commit()

    return SavingsOut(
        id=savings.id,
        user_id=savings.user_id,
        user_name=current_user.full_name,
        user_phone=current_user.phone_number,
        group_id=savings.group_id,
        group_name=group.name,
        amount=savings.amount,
        payment_method=savings.payment_method,
        payment_reference=savings.payment_reference,
        status=savings.status,
        rejection_reason=savings.rejection_reason,
        created_at=savings.created_at,
        approved_at=savings.approved_at
    )

@router.get("/my", response_model=List[SavingsOut])
def get_my_savings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    savings_list = db.query(SavingsTransaction).filter(
        SavingsTransaction.user_id == current_user.id
    ).order_by(SavingsTransaction.created_at.desc()).all()

    result = []
    for s in savings_list:
        group_name = s.group.name if s.group else "G KORALINK"
        result.append(
            SavingsOut(
                id=s.id,
                user_id=s.user_id,
                user_name=current_user.full_name,
                user_phone=current_user.phone_number,
                group_id=s.group_id,
                group_name=group_name,
                amount=s.amount,
                payment_method=s.payment_method,
                payment_reference=s.payment_reference,
                status=s.status,
                rejection_reason=s.rejection_reason,
                created_at=s.created_at,
                approved_at=s.approved_at
            )
        )
    return result

# Admin Endpoints
@router.get("/admin/list", response_model=List[SavingsOut])
def list_all_savings_for_admin(
    status_filter: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(SavingsTransaction)
    if status_filter:
        query = query.filter(SavingsTransaction.status == status_filter)
    
    savings_list = query.order_by(SavingsTransaction.created_at.desc()).all()

    result = []
    for s in savings_list:
        user_name = s.user.full_name if s.user else "Umukoresha"
        user_phone = s.user.phone_number if s.user else ""
        group_name = s.group.name if s.group else "G KORALINK"
        result.append(
            SavingsOut(
                id=s.id,
                user_id=s.user_id,
                user_name=user_name,
                user_phone=user_phone,
                group_id=s.group_id,
                group_name=group_name,
                amount=s.amount,
                payment_method=s.payment_method,
                payment_reference=s.payment_reference,
                status=s.status,
                rejection_reason=s.rejection_reason,
                created_at=s.created_at,
                approved_at=s.approved_at
            )
        )
    return result

@router.post("/admin/{savings_id}/approve")
def approve_savings(
    savings_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    savings = db.query(SavingsTransaction).filter(SavingsTransaction.id == savings_id).first()
    if not savings:
        raise HTTPException(status_code=404, detail="Gwizizigama ntabwo bibonetse.")

    if savings.status == "Byemejwe":
        return {"message": "Bikorewe ku busabe bwasanzwe byemejwe."}

    savings.status = "Byemejwe"
    savings.approved_at = datetime.now(timezone.utc)
    savings.approved_by_id = admin.id

    # Create general ledger transaction
    ledger = Transaction(
        user_id=savings.user_id,
        amount=savings.amount,
        type="SAVINGS",
        status="BYEMEJWE",
        reference=savings.payment_reference,
        created_by_id=savings.user_id,
        verified_by_id=admin.id,
        notes=f"Approved savings for group ID {savings.group_id}"
    )
    db.add(ledger)

    # Check group profit distribution rules
    group = db.query(IkibinaGroup).filter(IkibinaGroup.id == savings.group_id).first()
    if group and group.profit_enabled and group.profit_rate > 0:
        calculated_profit = (savings.amount * group.profit_rate) / 100.0
        profit_rec = ProfitRecord(
            user_id=savings.user_id,
            group_id=group.id,
            amount=calculated_profit,
            description=f"Inyungu kuri {group.name} ({group.profit_rate}%)"
        )
        db.add(profit_rec)

    # Audit log
    audit = AuditLog(
        admin_id=admin.id,
        action="APPROVE_SAVINGS",
        target_type="SAVINGS",
        target_id=str(savings.id),
        new_value=f"Approved amount: {savings.amount} Frw"
    )
    db.add(audit)

    # User notification
    notif = Notification(
        user_id=savings.user_id,
        title="Kwizigama byemejwe!",
        message=f"Kwizigama kwawe kwa {savings.amount:,.0f} Frw kwemejwe neza. Konti yawe yongeweho aya mafaranga."
    )
    db.add(notif)

    db.commit()
    return {"message": f"Kwizigama kwa {savings.amount:,.0f} Frw kwemejwe neza."}

@router.post("/admin/{savings_id}/reject")
def reject_savings(
    savings_id: int,
    data: SavingsReviewRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    savings = db.query(SavingsTransaction).filter(SavingsTransaction.id == savings_id).first()
    if not savings:
        raise HTTPException(status_code=404, detail="Gwizizigama ntabwo bibonetse.")

    savings.status = "Byanzwe"
    savings.rejection_reason = data.rejection_reason or "Amafaranga ntabwo yagaragaye kuri konti."

    audit = AuditLog(
        admin_id=admin.id,
        action="REJECT_SAVINGS",
        target_type="SAVINGS",
        target_id=str(savings.id),
        new_value=f"Rejected savings of {savings.amount} Frw. Reason: {savings.rejection_reason}"
    )
    db.add(audit)

    notif = Notification(
        user_id=savings.user_id,
        title="Kwizigama byanzwe",
        message=f"Ubusabe bwawe bwo kwizigama {savings.amount:,.0f} Frw bwanzwe. Impamvu: {savings.rejection_reason}"
    )
    db.add(notif)

    db.commit()
    return {"message": "Ubusabe bwo kwizigama bwanzwe."}
