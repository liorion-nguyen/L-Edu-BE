# Schema Imports Fix - Dashboard Module

## Issues Fixed

### 1. Chat Schema Names
**Problem**: Đã import sai tên schema cho chat conversation
```typescript
// ❌ SAI - File không tồn tại
import { ChatConversation, ChatConversationSchema } from '../../scheme/chat-conversation.schema';

// ✅ ĐÚNG - Tên schema đúng là Conversation
import { Conversation, ConversationSchema } from '../../scheme/conversation.schema';
```

### 2. Role Enum Path
**Problem**: Import Role enum từ path không tồn tại
```typescript
// ❌ SAI - File không tồn tại
import { Role } from '../auth/enums/role.enum';

// ✅ ĐÚNG - Role enum nằm trong enums/user.enum.ts
import { Role } from '../../enums/user.enum';
```

## Files Updated

### L-Edu-BE/src/api/dashboard/dashboard.service.ts
```typescript
// Before
import { ChatConversation, ChatConversationDocument } from '../../scheme/chat-conversation.schema';

// After
import { Conversation, ConversationDocument } from '../../scheme/conversation.schema';

// Constructor injection
constructor(
  // ...
  @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  @InjectModel(ChatMessage.name) private messageModel: Model<ChatMessageDocument>,
) {}
```

### L-Edu-BE/src/api/dashboard/dashboard.module.ts
```typescript
// Before
import { ChatConversation, ChatConversationSchema } from '../../scheme/chat-conversation.schema';

// After
import { Conversation, ConversationSchema } from '../../scheme/conversation.schema';

// MongooseModule.forFeature
MongooseModule.forFeature([
  // ...
  { name: Conversation.name, schema: ConversationSchema },
  { name: ChatMessage.name, schema: ChatMessageSchema },
])
```

### L-Edu-BE/src/api/dashboard/dashboard.controller.ts
```typescript
// Before
import { Role } from '../auth/enums/role.enum';

// After
import { Role } from '../../enums/user.enum';
```

## Schema Structure in Project

### Chat-related Schemas
```
L-Edu-BE/src/scheme/
├── conversation.schema.ts       ✅ Conversation (chat conversations)
├── chat-message.schema.ts       ✅ ChatMessage (chat messages)
└── message.schema.ts            ⚠️  Message (other messages - not for chatbot)
```

### Enum Files
```
L-Edu-BE/src/enums/
├── user.enum.ts         ✅ Role, Status, Gender
├── session.enum.ts      ✅ Session-related enums
├── course.enum.ts       ✅ Course-related enums
└── message.enum.ts      ✅ Message-related enums
```

## Schema Details

### Conversation Schema
```typescript
@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastMessageAt: Date;
}
```

### ChatMessage Schema
```typescript
@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ required: true })
  conversationId: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ default: false })
  isStreaming: boolean;

  @Prop({ default: false })
  isComplete: boolean;

  @Prop({ type: [String] })
  imageUrls?: string[];
}
```

### Role Enum
```typescript
export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}
```

## Best Practices

1. **Verify Schema Names**: Always check the actual file content before importing
2. **Use Consistent Naming**: Follow project's naming conventions
3. **Check Enum Locations**: Know where enums are defined in the project
4. **TypeScript Auto-import**: Be careful with auto-imports, they might suggest wrong paths

## Testing Checklist

After fixing imports:
- ✅ TypeScript compilation passes (0 errors)
- ✅ NestJS application starts successfully
- ✅ Dashboard stats API works
- ✅ MongoDB queries execute correctly
- ✅ No runtime errors

## Related Documentation

- [NestJS Mongoose](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose Schemas](https://mongoosejs.com/docs/guide.html)
- [TypeScript Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
