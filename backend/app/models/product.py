from datetime import datetime
from typing import List, Dict, Union, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

SpecificationValue = Union[str, int, float, bool]

class Product(BaseModel):
    product_id: str = Field(alias="productId")
    name: str
    slug: str
    brand: str
    model: Optional[str] = None
    sku: Optional[str] = None
    category: str
    price: int
    original_price: Optional[int] = Field(default=None, alias="originalPrice")
    discount_percentage: Optional[int] = Field(default=None, alias="discountPercentage")
    currency: str = "INR"
    description: str
    short_description: str = Field(alias="shortDescription")
    specifications: Dict[str, SpecificationValue]
    rating: float
    review_count: Optional[int] = Field(default=None, alias="reviewCount")
    stock: int
    warranty: str
    use_cases: List[str] = Field(alias="useCases")
    tags: List[str]
    images: List[str]
    color_options: Optional[List[str]] = Field(default=None, alias="colorOptions")
    highlights: Optional[List[str]] = None
    featured: bool
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

    model_config = ConfigDict(
        populate_by_name=True,
        str_strip_whitespace=True
    )

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        allowed = {
            "Laptops",
            "Smartphones",
            "Tablets",
            "Monitors",
            "Keyboards",
            "Mice",
            "Headphones",
            "Accessories"
        }
        if value not in allowed:
            raise ValueError(f"Category '{value}' is not allowed. Must be one of {allowed}")
        return value

    @field_validator("price")
    @classmethod
    def validate_price(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Price must be greater than zero")
        return value

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: float) -> float:
        if not (0.0 <= value <= 5.0):
            raise ValueError("Rating must be between 0.0 and 5.0")
        return value

    @field_validator("stock")
    @classmethod
    def validate_stock(cls, value: int) -> int:
        if value < 0:
            raise ValueError("Stock must be greater than or equal to zero")
        return value

    @field_validator("description")
    @classmethod
    def validate_description(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Description cannot be empty")
        return value

    @field_validator("specifications")
    @classmethod
    def validate_specifications(cls, value: Dict[str, SpecificationValue]) -> Dict[str, SpecificationValue]:
        if not value:
            raise ValueError("Specifications cannot be empty")
        return value

    @field_validator("images")
    @classmethod
    def validate_images(cls, value: List[str]) -> List[str]:
        if not value or len(value) < 1:
            raise ValueError("At least one image path must be provided")
        return value

    @field_validator("use_cases")
    @classmethod
    def validate_use_cases(cls, value: List[str]) -> List[str]:
        if not value or len(value) < 2:
            raise ValueError("At least two use cases must be provided")
        return value

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: List[str]) -> List[str]:
        if not value or len(value) < 4:
            raise ValueError("At least four tags must be provided")
        return value

    @model_validator(mode="after")
    def validate_pricing_discount_dates(self) -> "Product":
        # 1. Price check if original_price is present
        if self.original_price is not None:
            if self.original_price <= self.price:
                raise ValueError("originalPrice must be greater than price")
            # 2. Check discount percentage
            if self.discount_percentage is not None:
                expected_pct = round(((self.original_price - self.price) / self.original_price) * 100)
                if abs(self.discount_percentage - expected_pct) > 1:
                    raise ValueError(f"discountPercentage {self.discount_percentage}% is incorrect. Expected {expected_pct}%")
        
        # 3. Date check
        try:
            # Handle standard ISO formats, removing 'Z' if present
            created_str = self.created_at.replace("Z", "+00:00")
            updated_str = self.updated_at.replace("Z", "+00:00")
            created_dt = datetime.fromisoformat(created_str)
            updated_dt = datetime.fromisoformat(updated_str)
            if updated_dt < created_dt:
                raise ValueError("updatedAt cannot be earlier than createdAt")
        except ValueError as e:
            if "cannot be earlier" in str(e):
                raise e
            raise ValueError(f"Invalid timestamp format: {e}")

        return self
