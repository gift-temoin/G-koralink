from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import IkibinaGroup, IkibinaMember, User, AuditLog
from app.schemas.schemas import IkibinaOut, IkibinaCreateRequest
from app.auth.dependencies import get_current_active_user, require_admin

router = APIRouter(tags=["Ikibina"])

@router.get("/ikibina", response_model=List[IkibinaOut])
def list_ikibina_groups(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    groups = db.query(IkibinaGroup).all()
    user_group_ids = {m.group_id for m in current_user.group_memberships}

    result = []
    for g in groups:
        members_count = db.query(IkibinaMember).filter(IkibinaMember.group_id == g.id).count()
        result.append(
            IkibinaOut(
                id=g.id,
                name=g.name,
                contribution_amount=g.contribution_amount,
                frequency=g.frequency,
                max_members=g.max_members,
                current_members_count=members_count,
                start_date=g.start_date,
                end_date=g.end_date,
                description=g.description,
                is_active=g.is_active,
                profit_enabled=g.profit_enabled,
                profit_rate=g.profit_rate,
                created_at=g.created_at,
                is_joined=(g.id in user_group_ids)
            )
        )
    return result

@router.get("/ikibina/{group_id}", response_model=IkibinaOut)
def get_ikibina_detail(
    group_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    group = db.query(IkibinaGroup).filter(IkibinaGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Ikibina ntabwo kibonetse.")
    
    members_count = db.query(IkibinaMember).filter(IkibinaMember.group_id == group.id).count()
    user_joined = db.query(IkibinaMember).filter(
        IkibinaMember.group_id == group.id,
        IkibinaMember.user_id == current_user.id
    ).first() is not None

    return IkibinaOut(
        id=group.id,
        name=group.name,
        contribution_amount=group.contribution_amount,
        frequency=group.frequency,
        max_members=group.max_members,
        current_members_count=members_count,
        start_date=group.start_date,
        end_date=group.end_date,
        description=group.description,
        is_active=group.is_active,
        profit_enabled=group.profit_enabled,
        profit_rate=group.profit_rate,
        created_at=group.created_at,
        is_joined=user_joined
    )

@router.post("/ikibina/{group_id}/join")
def join_ikibina(
    group_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    group = db.query(IkibinaGroup).filter(IkibinaGroup.id == group_id).first()
    if not group or not group.is_active:
        raise HTTPException(status_code=400, detail="Iki kibina ntabwo kigikora.")

    existing = db.query(IkibinaMember).filter(
        IkibinaMember.group_id == group_id,
        IkibinaMember.user_id == current_user.id
    ).first()
    if existing:
        return {"message": "Uramaze kuba umunyamuryango w'iki kibina."}

    members_count = db.query(IkibinaMember).filter(IkibinaMember.group_id == group_id).count()
    if members_count >= group.max_members:
        raise HTTPException(status_code=400, detail="Iki kibina cyagize abanyamuryango bose bateganyijwe.")

    new_member = IkibinaMember(group_id=group_id, user_id=current_user.id)
    db.add(new_member)
    db.commit()
    return {"message": f"Wabyinjiye muri {group.name} neza!"}

# Admin Endpoints
@router.post("/admin/ikibina", response_model=IkibinaOut)
def create_ikibina(
    data: IkibinaCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    group = IkibinaGroup(
        name=data.name.strip(),
        contribution_amount=data.contribution_amount,
        frequency=data.frequency,
        max_members=data.max_members,
        start_date=data.start_date,
        end_date=data.end_date,
        description=data.description,
        profit_enabled=data.profit_enabled,
        profit_rate=data.profit_rate,
        is_active=True
    )
    db.add(group)
    db.commit()
    db.refresh(group)

    # Audit log
    audit = AuditLog(
        admin_id=admin.id,
        action="CREATE_IKIBINA",
        target_type="IKIBINA",
        target_id=str(group.id),
        new_value=f"Created {group.name} ({group.contribution_amount} Frw)"
    )
    db.add(audit)
    db.commit()

    return IkibinaOut(
        id=group.id,
        name=group.name,
        contribution_amount=group.contribution_amount,
        frequency=group.frequency,
        max_members=group.max_members,
        current_members_count=0,
        start_date=group.start_date,
        end_date=group.end_date,
        description=group.description,
        is_active=group.is_active,
        profit_enabled=group.profit_enabled,
        profit_rate=group.profit_rate,
        created_at=group.created_at,
        is_joined=False
    )

@router.put("/admin/ikibina/{group_id}", response_model=IkibinaOut)
def update_ikibina(
    group_id: int,
    data: IkibinaCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    group = db.query(IkibinaGroup).filter(IkibinaGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Ikibina ntabwo kibonetse.")

    prev_val = f"Name: {group.name}, Amount: {group.contribution_amount}"

    group.name = data.name.strip()
    group.contribution_amount = data.contribution_amount
    group.frequency = data.frequency
    group.max_members = data.max_members
    group.start_date = data.start_date
    group.end_date = data.end_date
    group.description = data.description
    group.profit_enabled = data.profit_enabled
    group.profit_rate = data.profit_rate

    db.commit()
    db.refresh(group)

    audit = AuditLog(
        admin_id=admin.id,
        action="UPDATE_IKIBINA",
        target_type="IKIBINA",
        target_id=str(group.id),
        previous_value=prev_val,
        new_value=f"Name: {group.name}, Amount: {group.contribution_amount}"
    )
    db.add(audit)
    db.commit()

    members_count = db.query(IkibinaMember).filter(IkibinaMember.group_id == group.id).count()
    return IkibinaOut(
        id=group.id,
        name=group.name,
        contribution_amount=group.contribution_amount,
        frequency=group.frequency,
        max_members=group.max_members,
        current_members_count=members_count,
        start_date=group.start_date,
        end_date=group.end_date,
        description=group.description,
        is_active=group.is_active,
        profit_enabled=group.profit_enabled,
        profit_rate=group.profit_rate,
        created_at=group.created_at,
        is_joined=False
    )

@router.delete("/admin/ikibina/{group_id}")
def deactivate_ikibina(
    group_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    group = db.query(IkibinaGroup).filter(IkibinaGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Ikibina ntabwo kibonetse.")

    group.is_active = not group.is_active
    db.commit()

    action_str = "ACTIVATED" if group.is_active else "DEACTIVATED"
    audit = AuditLog(
        admin_id=admin.id,
        action=f"{action_str}_IKIBINA",
        target_type="IKIBINA",
        target_id=str(group.id),
        new_value=f"Status changed to active={group.is_active}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Ikibina cyagizwe {action_str}."}
