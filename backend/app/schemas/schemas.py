from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator

# Auth Schemas
class UserRegisterRequest(BaseModel):
    amazina_ya_mbere: str = Field(..., min_length=2, description="Amazina ya mbere")
    izina_rya_kabiri: str = Field(..., min_length=2, description="Izina rya kabiri")
    phone_number: str = Field(..., description="Nimero ya telefoni")
    location: str = Field(..., min_length=2, description="Aho utuye")
    password: str = Field(..., min_length=6, description="Ijambobanga")
    confirm_password: str = Field(..., description="Ongera wandike ijambobanga")

    @validator('phone_number')
    def validate_phone(cls, v):
        clean_num = v.replace(" ", "").replace("-", "").replace("+250", "0")
        if not clean_num.isdigit() or len(clean_num) != 10 or not clean_num.startswith("07"):
            raise ValueError("Nyamuneka andika nimero ya telefoni yemewe (urugero: 078XXXXXXX).")
        return clean_num

    @validator('confirm_password')
    def validate_passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError("Amajambobanga ntabwo ahura.")
        return v

class UserLoginRequest(BaseModel):
    phone_number: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str

class UserOut(BaseModel):
    id: int
    amazina_ya_mbere: str
    izina_rya_kabiri: str
    full_name: str
    phone_number: str
    location: str
    role: str
    is_active: bool
    created_at: datetime
    current_ikibina_id: Optional[int] = None
    current_ikibina_name: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    amazina_ya_mbere: Optional[str] = None
    izina_rya_kabiri: Optional[str] = None
    location: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)
    confirm_new_password: str

    @validator('confirm_new_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError("Amajambobanga mashya ntabwo ahura.")
        return v

# Ikibina Schemas
class IkibinaCreateRequest(BaseModel):
    name: str = Field(..., min_length=3)
    contribution_amount: float = Field(..., gt=0)
    frequency: str = "Buri cyumweru"
    max_members: int = Field(30, gt=0)
    start_date: str
    end_date: str
    description: Optional[str] = None
    profit_enabled: bool = False
    profit_rate: float = 0.0

class IkibinaOut(BaseModel):
    id: int
    name: str
    contribution_amount: float
    frequency: str
    max_members: int
    current_members_count: int = 0
    start_date: str
    end_date: str
    description: Optional[str]
    is_active: bool
    profit_enabled: bool
    profit_rate: float
    created_at: datetime
    is_joined: bool = False

    class Config:
        from_attributes = True

# Savings Schemas
class SavingsCreateRequest(BaseModel):
    group_id: int
    amount: float = Field(..., gt=0)
    payment_reference: str = Field(..., min_length=3)

class SavingsReviewRequest(BaseModel):
    status: str # Byemejwe or Byanzwe
    rejection_reason: Optional[str] = None

class SavingsOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_phone: str
    group_id: int
    group_name: str
    amount: float
    payment_method: str
    payment_reference: str
    status: str
    rejection_reason: Optional[str]
    created_at: datetime
    approved_at: Optional[datetime]

    class Config:
        from_attributes = True

# Loan Schemas
class LoanCreateRequest(BaseModel):
    requested_amount: float = Field(..., gt=0)
    reason: str = Field(..., min_length=5)
    repayment_months: int = Field(1, gt=0)

class LoanApproveRequest(BaseModel):
    approved_amount: float = Field(..., gt=0)
    repayment_months: int = Field(..., gt=0)
    interest_rate: float = Field(0.0, ge=0)

class LoanRejectRequest(BaseModel):
    rejection_reason: str = Field(..., min_length=3)

class LoanRepaymentCreateRequest(BaseModel):
    amount: float = Field(..., gt=0)
    payment_reference: str = Field(..., min_length=3)

class LoanRepaymentOut(BaseModel):
    id: int
    loan_id: int
    user_id: int
    user_name: str
    amount: float
    payment_reference: str
    status: str
    rejection_reason: Optional[str]
    created_at: datetime
    approved_at: Optional[datetime]

    class Config:
        from_attributes = True

class LoanOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_phone: str
    requested_amount: float
    approved_amount: Optional[float]
    reason: str
    repayment_months: int
    status: str
    rejection_reason: Optional[str]
    interest_rate: float
    total_repaid: float = 0.0
    remaining_balance: float = 0.0
    due_date: Optional[datetime]
    created_at: datetime
    approved_at: Optional[datetime]
    repayments: List[LoanRepaymentOut] = []

    class Config:
        from_attributes = True

# Earnings / Profit
class ProfitOut(BaseModel):
    id: int
    user_id: int
    amount: float
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schemas
class UserDashboardStats(BaseModel):
    user_name: str
    total_savings: float # Approved savings
    pending_savings: float # Savings awaiting verification
    total_profit: float # Earnings/profit
    remaining_loan_balance: float # Current outstanding debt
    approved_loan_limit: float # Allowed loan limit based on savings
    total_repaid_loans: float
    remaining_loan_to_pay: float
    pending_loans_count: int
    current_ikibina_name: Optional[str]

class AdminDashboardStats(BaseModel):
    total_users: int
    new_users_this_month: int
    active_ikibina_count: int
    total_savings_approved: float
    pending_savings_amount: float
    pending_loans_count: int
    approved_loans_count: int
    total_outstanding_loans: float
    total_repaid_loans: float

# Notification Schema
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Financial Report Schema
class FinancialReportOut(BaseModel):
    period: str
    total_savings: float
    pending_savings: float
    approved_loans: float
    pending_loans: float
    loan_repayments: float
    outstanding_loans: float
    net_fund_balance: float
    transactions_count: int

# Audit Log Schema
class AuditLogOut(BaseModel):
    id: int
    admin_id: int
    admin_name: str
    action: str
    target_type: str
    target_id: str
    previous_value: Optional[str]
    new_value: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
