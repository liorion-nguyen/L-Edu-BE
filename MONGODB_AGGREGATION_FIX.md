# MongoDB Aggregation Pipeline Type Fix

## Issue
TypeScript strict type checking cho MongoDB aggregation pipelines yêu cầu `$sort` values phải là literal types `1` hoặc `-1`, không phải `number`.

## Error
```typescript
Type 'number' is not assignable to type '1 | -1 | Meta'.
```

## Solution
Sử dụng type assertion `as 1` hoặc `as -1` để cast giá trị về literal type.

### Before (Lỗi)
```typescript
{
  $sort: { _id: 1 }  // TypeScript error: number is not assignable to 1 | -1
}
```

### After (Đúng)
```typescript
{
  $sort: { _id: 1 as 1 }  // Type assertion to literal type
}
```

## Files Updated

### L-Edu-BE/src/api/dashboard/dashboard.service.ts

#### 1. getUserGrowthData()
```typescript
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}
```

#### 2. getCourseEnrollmentData()
```typescript
{
  $sort: { enrollmentCount: -1 as -1 }  // Sort descending by enrollment count
}
```

#### 3. getChatActivityData()
```typescript
// messageModel aggregation
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}

// conversationModel aggregation
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}
```

#### 4. getReviewTrendsData()
```typescript
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}
```

#### 5. getCourseGrowthData() (private)
```typescript
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}
```

#### 6. getSessionGrowthData() (private)
```typescript
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}
```

#### 7. getReviewGrowthData() (private)
```typescript
{
  $sort: { _id: 1 as 1 }  // Sort ascending by date
}
```

## Why This Happens

TypeScript's type system cần biết chính xác giá trị là `1` hoặc `-1` (literal types), không phải `number` (union type). Điều này đảm bảo type safety cho MongoDB aggregation pipeline.

### MongoDB Sort Order
- `1`: Ascending (tăng dần)
- `-1`: Descending (giảm dần)

## Best Practices

1. **Always use type assertion for $sort**:
   ```typescript
   { $sort: { field: 1 as 1 } }  // Ascending
   { $sort: { field: -1 as -1 } }  // Descending
   ```

2. **Consistency**: Áp dụng cho tất cả aggregation pipelines trong project.

3. **TypeScript strict mode**: Giúp phát hiện lỗi sớm trong development.

## Related MongoDB Operators

Các operators khác cũng có thể cần type assertion:
- `$project`: `{ field: 1 as 1 }` để include field
- `$addFields`: Depends on field types
- `$group`: `{ $sum: 1 }` không cần type assertion vì nó là một giá trị literal

## Testing

Sau khi fix, verify rằng:
1. ✅ TypeScript compilation thành công (0 errors)
2. ✅ Aggregation queries hoạt động đúng
3. ✅ Data được sort đúng thứ tự
4. ✅ API endpoints trả về data chính xác

## References

- [MongoDB Aggregation Pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/)
- [TypeScript Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)
- [Mongoose Aggregation](https://mongoosejs.com/docs/api/aggregate.html)
