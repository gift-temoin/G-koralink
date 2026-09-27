from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Notification
from app.schemas.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserOut
from app.core.security import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=TokenResponse)
def register_user(data: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if phone number already exists
    existing_user = db.query(User).filter(User.phone_number == data.phone_number).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Iyi nimero ya telefoni isanzwe ikoreshwa. Injira cyangwa ukoreshe indi."
        )

    # Create user
    new_user = User(
        amazina_ya_mbere=data.amazina_ya_mbere.strip(),
        izina_rya_kabiri=data.izina_rya_kabiri.strip(),
        phone_number=data.phone_number,
        location=data.location.strip(),
        password_hash=get_password_hash(data.password),
        role="UMUKORESHA",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create welcoming notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Mwazihawe muri G KORALINK!",
        message=f"Murakaza neza {new_user.amazina_ya_mbere}! Konti yawe yakozwe neza. Ushobora gukoresha serivisi zacu zose."
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "full_name": new_user.full_name
    }

@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLoginRequest, db: Session = Depends(get_db)):
    clean_phone = data.phone_number.replace(" ", "").replace("-", "").replace("+250", "0")
    user = db.query(User).filter(User.phone_number == clean_phone).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nimero ya telefoni cyangwa ijambobanga ntabwo ari byo. Ongera ugerageze."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Konti yawe yahagaritswe. Nyamuneka vugana n'ubuyobozi."
        )

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name
    }

@router.post("/logout")
def logout_user():
    return {"message": "Wasohohotse neza muri konti yawe."}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
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
