from datetime import datetime, timezone, timedelta
from app.database.session import SessionLocal, engine, Base
from app.models.models import (
    User, IkibinaGroup, IkibinaMember, SavingsTransaction, LoanRequest,
    LoanRepayment, ProfitRecord, Notification, Transaction, AuditLog
)
from app.core.security import get_password_hash
from app.core.config import settings

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Admin setup
        admin = db.query(User).filter(User.phone_number == settings.ADMIN_PHONE).first()
        if not admin:
            admin = User(
                amazina_ya_mbere="ENOCK",
                izina_rya_kabiri="IRADUKUNDA",
                phone_number=settings.ADMIN_PHONE,
                location="Kigali, Nyarugenge",
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="ADMIN",
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print(f"--> Created Admin: {admin.full_name} ({admin.phone_number})")
        else:
            admin.password_hash = get_password_hash(settings.ADMIN_PASSWORD)
            db.commit()

        # 2. Default Ikibina Groups
        group1 = db.query(IkibinaGroup).filter(IkibinaGroup.name == "G KORALINK 2026").first()
        if not group1:
            group1 = IkibinaGroup(
                name="G KORALINK 2026",
                contribution_amount=9000.0,
                frequency="Buri cyumweru",
                max_members=25,
                start_date="2026-01-01",
                end_date="2026-12-31",
                description="Ikibina ngarukamwaka cy'abanyamuryango ba G KORALINK. Umusanzu ni 9,000 Frw buri cyumweru.",
                is_active=True,
                profit_enabled=True,
                profit_rate=5.0
            )
            db.add(group1)
            db.commit()

        group2 = db.query(IkibinaGroup).filter(IkibinaGroup.name == "IKIBINA CY'ITERAMBERE").first()
        if not group2:
            group2 = IkibinaGroup(
                name="IKIBINA CY'ITERAMBERE",
                contribution_amount=15000.0,
                frequency="Buri kwezi",
                max_members=40,
                start_date="2026-01-15",
                end_date="2026-12-15",
                description="Kwizigama by'ukwezi k'ubucuruzi n'iterambere rya rwiyemezamirimo.",
                is_active=True,
                profit_enabled=True,
                profit_rate=7.5
            )
            db.add(group2)
            db.commit()

        # 3. Sample Users
        user1 = db.query(User).filter(User.phone_number == "0781234567").first()
        if not user1:
            user1 = User(
                amazina_ya_mbere="Jean Claude",
                izina_rya_kabiri="MUGISHA",
                phone_number="0781234567",
                location="Gasabo, Kimironko",
                password_hash=get_password_hash("User123456"),
                role="UMUKORESHA",
                is_active=True
            )
            db.add(user1)
            db.commit()
            db.refresh(user1)

            # Join group 1
            m1 = IkibinaMember(group_id=group1.id, user_id=user1.id)
            db.add(m1)

            # Sample Savings
            s1 = SavingsTransaction(
                user_id=user1.id,
                group_id=group1.id,
                amount=9000.0,
                payment_method="MTN MoMo",
                payment_reference="MOMO-892134",
                status="Byemejwe",
                approved_at=datetime.now(timezone.utc) - timedelta(days=5),
                approved_by_id=admin.id
            )
            s2 = SavingsTransaction(
                user_id=user1.id,
                group_id=group1.id,
                amount=9000.0,
                payment_method="MTN MoMo",
                payment_reference="MOMO-892990",
                status="Bitegereje kwemezwa"
            )
            db.add_all([s1, s2])

            # Sample Profit
            p1 = ProfitRecord(
                user_id=user1.id,
                group_id=group1.id,
                amount=450.0,
                description="Inyungu kuri G KORALINK 2026 (5%)"
            )
            db.add(p1)

            # Sample Loan Request
            l1 = LoanRequest(
                user_id=user1.id,
                requested_amount=50000.0,
                approved_amount=50000.0,
                reason="Guhaha ibikoresho by'ubucuruzi",
                repayment_months=2,
                status="Iri kwishyura",
                interest_rate=2.0,
                approved_at=datetime.now(timezone.utc) - timedelta(days=10),
                due_date=datetime.now(timezone.utc) + timedelta(days=50)
            )
            db.add(l1)
            db.commit()
            db.refresh(l1)

            # Sample Repayment
            r1 = LoanRepayment(
                loan_id=l1.id,
                user_id=user1.id,
                amount=20000.0,
                payment_reference="MOMO-PAY-1002",
                status="Byemejwe",
                approved_at=datetime.now(timezone.utc) - timedelta(days=2)
            )
            db.add(r1)

            # Notifications
            n1 = Notification(
                user_id=user1.id,
                title="Kwizigama kwa 9,000 Frw kwemejwe",
                message="Kwizigama kwawe kwa 9,000 Frw muri G KORALINK 2026 kwemejwe neza."
            )
            n2 = Notification(
                user_id=user1.id,
                title="Inguzanyo ya 50,000 Frw yemejwe",
                message="Ubusabe bwawe bw'inguzanyo bwa 50,000 Frw bwemejwe neza n'ubuyobozi."
            )
            db.add_all([n1, n2])
            db.commit()

        user2 = db.query(User).filter(User.phone_number == "0789876543").first()
        if not user2:
            user2 = User(
                amazina_ya_mbere="Aline",
                izina_rya_kabiri="UWIMANA",
                phone_number="0789876543",
                location="Kicukiro, Kanombe",
                password_hash=get_password_hash("User123456"),
                role="UMUKORESHA",
                is_active=True
            )
            db.add(user2)
            db.commit()
            db.refresh(user2)

            m2 = IkibinaMember(group_id=group2.id, user_id=user2.id)
            db.add(m2)

            s3 = SavingsTransaction(
                user_id=user2.id,
                group_id=group2.id,
                amount=15000.0,
                payment_method="MTN MoMo",
                payment_reference="MOMO-771239",
                status="Byemejwe",
                approved_at=datetime.now(timezone.utc) - timedelta(days=3),
                approved_by_id=admin.id
            )
            db.add(s3)

            n3 = Notification(
                user_id=user2.id,
                title="Murakaza neza muri G KORALINK",
                message="Konti yawe yakozwe neza. Ushobora kureba ikibina urimo no gukora ubwisungane."
            )
            db.add(n3)
            db.commit()

        print("--> Database seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
