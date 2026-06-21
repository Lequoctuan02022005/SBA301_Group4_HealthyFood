# Updated Entity Design

## User

```java
User
----
id
email
password

fullName
phone
avatar

role
status

emailVerified

customerPersonalInfo

subscriptionPackageId

createdAt
updatedAt
expireAt
```

### Notes

* CUSTOMER:

    * customerPersonalInfo != null
    * expireAt = null

* SELLER:

    * customerPersonalInfo = null
    * expireAt = seller package expiration date

* NUTRIENT / MANAGER / ADMIN:

    * customerPersonalInfo = null
    * expireAt = null

---

## Category

```java
Category
--------
id
name
description
type
```

```java
enum CategoryType {
    PRODUCT,
    TARGET
}
```

---

## Product

```java
Product
-------
id

sellerId
categoryId

name
description

ingredient
nutritionInfo

price
quantity

status

reviewComment
reviewDate

createdAt
updatedAt
```

```java
enum ProductStatus {
    PENDING_NUTRIENT,
    PENDING_MANAGER,
    PUBLISHED,
    REJECTED,
    HIDDEN
}
```

---

## ProductTarget

```java
ProductTarget
-------------
id

productId
categoryId
```

Used to assign target customer groups:

* Gym
* Weight Loss
* Diabetes
* Pregnant Women
* etc.

---

## Cart

Merged Cart + CartItem

```java
Cart
----
id

customerId
productId

quantity

createdAt
```

Each row represents one product in a customer's cart.

Example:

| customerId | productId | quantity |
| ---------- | --------- | -------- |
| 1          | 10        | 2        |
| 1          | 15        | 1        |

---

## Order

```java
Order
-----
id

customerId

voucherCode

totalAmount

status

createdAt
```

```java
enum OrderStatus {
    PENDING,
    PAID,
    COMPLETED,
    CANCELLED
}
```

---

## OrderDetail

```java
OrderDetail
-----------
id

orderId
productId

quantity
price
```

---

## Review

```java
Review
------
id

productId
customerId

rating
comment

createdAt
```

---

## Report

```java
Report
------
id

productId

customerId
sellerId

reason
description

status

managerComment

appealReason
appealStatus

isRequestRefund

evidence

createdAt
```

### Notes

```java
isRequestRefund : Boolean
```

Used when customer requests a refund.

```java
evidence : List<String>
```

Stores image/video URLs.

Example:

[
"https://cdn.com/evidence1.jpg",
"https://cdn.com/evidence2.jpg"
]

```java
enum ReportStatus {
    PENDING,
    APPROVED,
    REJECTED
}
```

---

## SubscriptionPackage

```java
SubscriptionPackage
-------------------
id

name
price

durationDays

description
```

---

# Final Entity List

1. User
2. Category
3. Product
4. ProductTarget
5. Cart
6. Order
7. OrderDetail
8. Review
9. Report
10. SubscriptionPackage

Total: 10 entities

```
```
