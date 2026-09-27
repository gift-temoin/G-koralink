from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    amazina_ya_mbere = Column(String(100), nullable=False)
    izina_rya_kabiri = Column(String(100), nullable=False)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    location = Column(String(200), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="UMUKORESHA", nullable=False) # UMUKORESHA or ADMIN
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    group_memberships = relationship("IkibinaMember", back_populates="user", cascade="all, delete-orphan")
    savings_transactions = relationship("SavingsTransaction", foreign_keys="SavingsTransaction.user_id", back_populates="user")
    loan_requests = relationship("LoanRequest", foreign_keys="LoanRequest.user_id", back_populates="user")
    repayments = relationship("LoanRepayment", foreign_keys="LoanRepayment.user_id", back_populates="user")
    profit_records = relationship("ProfitRecord", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    @property
    def full_name(self):
        return f"{self.amazina_ya_mbere} {self.izina_rya_kabiri}"


class IkibinaGroup(Base):
    __tablename__ = "ikibina_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    contribution_amount = Column(Float, nullable=False) # e.g. 9000.0
    frequency = Column(String(50), default="Buri cyumweru", nullable=False)
    max_members = Column(Integer, default=30, nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    profit_enabled = Column(Boolean, default=False, nullable=False)
    profit_rate = Column(Float, default=0.0, nullable=False) # In percentage
    created_at = Column(DateTime, default=utc_now)

    members = relationship("IkibinaMember", back_populates="group", cascade="all, delete-orphan")
    savings = relationship("SavingsTransaction", back_populates="group")


class IkibinaMember(Base):
    __tablename__ = "ikibina_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("ikibina_groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=utc_now)

    group = relationship("IkibinaGroup", back_populates="members")
    user = relationship("User", back_populates="group_memberships")


class SavingsTransaction(Base):
    __tablename__ = "savings_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("ikibina_groups.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), default="MTN MoMo", nullable=False)
    payment_reference = Column(String(100), nullable=False)
    status = Column(String(50), default="Bitegereje kwemezwa", nullable=False) # Bitegereje kwemezwa, Byemejwe, Byanzwe
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    approved_at = Column(DateTime, nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="savings_transactions")
    group = relationship("IkibinaGroup", back_populates="savings")
    approved_by = relationship("User", foreign_keys=[approved_by_id])


class LoanRequest(Base):
    __tablename__ = "loan_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_amount = Column(Float, nullable=False)
    approved_amount = Column(Float, nullable=True)
    reason = Column(Text, nullable=False)
    repayment_months = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="Bitegereje", nullable=False) # Bitegereje, Yemejwe, Yanzwe, Iri kwishyura, Yarangiye
    rejection_reason = Column(Text, nullable=True)
    interest_rate = Column(Float, default=0.0, nullable=False) # percentage interest/fee
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    approved_at = Column(DateTime, nullable=True)

    user = relationship("User", foreign_keys=[user_id], back_populates="loan_requests")
    repayments = relationship("LoanRepayment", back_populates="loan", cascade="all, delete-orphan")


class LoanRepayment(Base):
    __tablename__ = "loan_repayments"

    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loan_requests.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_reference = Column(String(100), nullable=False)
    status = Column(String(50), default="Bitegereje kwemezwa", nullable=False) # Bitegereje kwemezwa, Byemejwe, Byanzwe
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    approved_at = Column(DateTime, nullable=True)

    loan = relationship("LoanRequest", back_populates="repayments")
    user = relationship("User", foreign_keys=[user_id], back_populates="repayments")


class ProfitRecord(Base):
    __tablename__ = "profit_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("ikibina_groups.id"), nullable=True)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="profit_records")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(50), nullable=False) # SAVINGS, LOAN_DISBURSEMENT, LOAN_REPAYMENT, PROFIT, ADJUSTMENT
    status = Column(String(50), nullable=False) # BITEGEREJE, BYEMEJWE, BYANZWE
    reference = Column(String(100), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(50), nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)
